<?php
// app/Services/Procurement/Services/TenderService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\Requisition;
use App\Models\Tender;
use App\Models\User;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\TenderServiceInterface;
use App\Services\Procurement\Contracts\Repositories\TenderRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\DTOs\TenderDTO;
use App\Services\Procurement\Exceptions\TenderException;

class TenderService extends BaseService implements TenderServiceInterface
{
  public function __construct(
    protected TenderRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected PdfGeneratorInterface $pdfGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher
  ) {
    parent::__construct();
  }

  public function createTender(TenderDTO $dto): Tender
  {
    $requisition = Requisition::find($dto->requisitionId);

    if (!$requisition) {
      throw TenderException::requisitionNotFound($dto->requisitionId);
    }

    $existing = Tender::where('requisition_id', $requisition->id)
      ->whereNotIn('status', ['cancelled', 'expired'])
      ->first();

    if ($existing) {
      throw TenderException::tenderAlreadyExists();
    }

    return $this->transaction(function () use ($requisition, $dto) {
      $tender = $this->repository->createTender([
        'requisition_id' => $requisition->id,
        'tender_number' => $dto->tenderNumber ?? $this->referenceGenerator->generateTenderNumber(),
        'title' => $dto->title,
        'description' => $dto->description,
        'issue_date' => $dto->issueDate->toDateString(),
        'closing_date' => $dto->closingDate->toDateString(),
        'closing_time' => $dto->closingTime,
        'tender_document_path' => $dto->tenderDocumentPath,
        'evaluation_criteria' => $dto->evaluationCriteria,
        'estimated_value' => $dto->estimatedValue,
        'status' => 'draft',
        'bidders' => $dto->bidders,
        'metadata' => $dto->metadata,
      ]);

      $this->logHistory(
        $requisition->id,
        'tender_created',
        'tender',
        $tender->id,
        null,
        ['tender_number' => $tender->tender_number],
        "Tender {$tender->tender_number} created"
      );

      return $tender;
    });
  }

  public function getTender(int $tenderId): Tender
  {
    $tender = $this->repository->findTender($tenderId);

    if (!$tender) {
      throw TenderException::tenderNotFound($tenderId);
    }

    return $tender;
  }

  public function getTenderForRequisition(int $requisitionId): ?Tender
  {
    return $this->repository->getTenderForRequisition($requisitionId);
  }

  public function publishTender(int $tenderId, int $userId): Tender
  {
    $tender = $this->getTender($tenderId);

    if ($tender->status !== 'draft') {
      throw TenderException::tenderMustBeDraft();
    }

    return $this->transaction(function () use ($tender, $userId) {
      $tender->publish($userId);

      $suppliers = User::where('role', 'supplier')
        ->where('is_active', true)
        ->get();

      if ($suppliers->isNotEmpty()) {
        $this->notificationDispatcher->notify('tender_published', [
          'tender_id' => $tender->id,
          'tender_number' => $tender->tender_number,
          'supplier_ids' => $suppliers->pluck('id')->toArray(),
          'closing_date' => $tender->closing_date->toDateString(),
        ]);
      }

      $this->logHistory(
        $tender->requisition_id,
        'tender_published',
        'tender',
        $tender->id,
        null,
        ['status' => 'published'],
        "Tender {$tender->tender_number} published"
      );

      return $tender;
    });
  }

  public function addBidder(int $tenderId, int $supplierId): Tender
  {
    $tender = $this->getTender($tenderId);

    if ($tender->status !== 'published') {
      throw new \Exception('Bidders can only be added to published tenders.');
    }

    $this->repository->addBidderToTender($tenderId, $supplierId);

    $this->logHistory(
      $tender->requisition_id,
      'bidder_added',
      'tender',
      $tender->id,
      null,
      ['supplier_id' => $supplierId],
      "Bidder added to tender {$tender->tender_number}"
    );

    return $tender;
  }

  public function removeBidder(int $tenderId, int $supplierId): Tender
  {
    $tender = $this->getTender($tenderId);

    if ($tender->status !== 'published') {
      throw new \Exception('Bidders can only be removed from published tenders.');
    }

    $bidders = $tender->getBidders();
    if (!in_array($supplierId, $bidders)) {
      throw TenderException::bidderNotFound($supplierId);
    }

    $this->repository->removeBidderFromTender($tenderId, $supplierId);

    $this->logHistory(
      $tender->requisition_id,
      'bidder_removed',
      'tender',
      $tender->id,
      null,
      ['supplier_id' => $supplierId],
      "Bidder removed from tender {$tender->tender_number}"
    );

    return $tender;
  }

  public function startEvaluation(int $tenderId): Tender
  {
    $tender = $this->getTender($tenderId);

    if ($tender->status !== 'published') {
      throw TenderException::tenderMustBePublished();
    }

    if ($tender->isExpired()) {
      throw TenderException::tenderExpired();
    }

    return $this->transaction(function () use ($tender) {
      $tender->startEvaluation();

      $this->notificationDispatcher->notify('tender_evaluating', [
        'tender_id' => $tender->id,
        'tender_number' => $tender->tender_number,
        'bidders' => $tender->getBidders(),
      ]);

      $this->logHistory(
        $tender->requisition_id,
        'tender_evaluating',
        'tender',
        $tender->id,
        null,
        ['status' => 'evaluating'],
        "Tender {$tender->tender_number} evaluation started"
      );

      return $tender;
    });
  }

  public function awardTender(int $tenderId, int $supplierId, float $amount, ?string $notes = null): Tender
  {
    $tender = $this->getTender($tenderId);

    if ($tender->status !== 'evaluating') {
      throw TenderException::tenderMustBeEvaluating();
    }

    $bidders = $tender->getBidders();
    if (!in_array($supplierId, $bidders)) {
      throw TenderException::bidderNotFound($supplierId);
    }

    if ($tender->status === 'awarded' || $tender->status === 'cancelled') {
      throw TenderException::tenderAlreadyAwarded();
    }

    return $this->transaction(function () use ($tender, $supplierId, $amount, $notes) {
      $tender->award($supplierId, $amount, $notes);

      $requisition = $tender->requisition;
      if ($requisition) {
        $requisition->update([
          'supplier_id' => $supplierId,
          'metadata' => array_merge($requisition->metadata ?? [], [
            'tender_awarded' => [
              'tender_id' => $tender->id,
              'tender_number' => $tender->tender_number,
              'awarded_at' => now(),
              'awarded_amount' => $amount,
            ]
          ])
        ]);
      }

      $this->notificationDispatcher->notify('tender_awarded', [
        'tender_id' => $tender->id,
        'tender_number' => $tender->tender_number,
        'awarded_to' => $supplierId,
        'bidders' => $tender->getBidders(),
        'amount' => $amount,
        'notes' => $notes,
      ]);

      $this->logHistory(
        $tender->requisition_id,
        'tender_awarded',
        'tender',
        $tender->id,
        null,
        [
          'awarded_to' => $supplierId,
          'awarded_amount' => $amount,
          'status' => 'awarded',
        ],
        "Tender {$tender->tender_number} awarded to supplier #{$supplierId} for {$amount}"
      );

      return $tender;
    });
  }

  public function cancelTender(int $tenderId, string $reason, int $userId): Tender
  {
    $tender = $this->getTender($tenderId);

    if ($tender->status === 'awarded' || $tender->status === 'cancelled') {
      throw TenderException::tenderAlreadyCancelled();
    }

    return $this->transaction(function () use ($tender, $reason, $userId) {
      $tender->cancel($reason, $userId);

      $this->notificationDispatcher->notify('tender_cancelled', [
        'tender_id' => $tender->id,
        'tender_number' => $tender->tender_number,
        'bidders' => $tender->getBidders(),
        'reason' => $reason,
      ]);

      $this->logHistory(
        $tender->requisition_id,
        'tender_cancelled',
        'tender',
        $tender->id,
        null,
        [
          'status' => 'cancelled',
          'cancellation_reason' => $reason,
        ],
        "Tender {$tender->tender_number} cancelled: {$reason}"
      );

      return $tender;
    });
  }

  public function getTenderStatistics(int $tenderId): array
  {
    $tender = $this->getTender($tenderId);

    return [
      'tender' => [
        'id' => $tender->id,
        'tender_number' => $tender->tender_number,
        'title' => $tender->title,
        'status' => $tender->status_label,
        'estimated_value' => $tender->formatted_estimated_value,
        'issue_date' => $tender->issue_date->toDateString(),
        'closing_date' => $tender->closing_date->toDateString(),
        'is_open' => $tender->is_open,
        'is_expired' => $tender->isExpired(),
        'days_until_closing' => $tender->days_until_closing,
      ],
      'bidders' => [
        'total' => $tender->bidder_count,
        'list' => $tender->getBidders(),
      ],
      'award' => $tender->status === 'awarded' ? [
        'awarded_to' => $tender->awarded_to,
        'awarded_at' => $tender->awarded_at?->toDateTimeString(),
        'awarded_amount' => $tender->formatted_awarded_amount,
        'award_notes' => $tender->award_notes,
      ] : null,
      'timeline' => [
        'created_at' => $tender->created_at->toDateTimeString(),
        'published_at' => $tender->published_at?->toDateTimeString(),
        'evaluated_at' => $tender->updated_at->toDateTimeString(),
        'awarded_at' => $tender->awarded_at?->toDateTimeString(),
        'cancelled_at' => $tender->cancelled_at?->toDateTimeString(),
      ],
    ];
  }

  public function getBidders(int $tenderId): array
  {
    return $this->repository->getBiddersForTender($tenderId);
  }

  public function getOpenTenders(): array
  {
    return $this->repository->getOpenTenders();
  }

  public function getClosingSoonTenders(int $days = 7): array
  {
    return $this->repository->getTendersClosingSoon($days);
  }

  public function generateTenderPdf(int $tenderId): string
  {
    $tender = $this->getTender($tenderId);
    return $this->pdfGenerator->generateTender($tender);
  }

  public function getPublishedTenders(): array
  {
    return $this->repository->getPublishedTenders();
  }

  public function getTendersByStatus(string $status): array
  {
    return $this->repository->getTendersByStatus($status);
  }

  public function isTenderOpen(int $tenderId): bool
  {
    $tender = $this->getTender($tenderId);
    return $tender->isOpen();
  }

  public function isSupplierBidder(int $tenderId, int $supplierId): bool
  {
    $bidders = $this->getBidders($tenderId);
    return in_array($supplierId, $bidders);
  }

  /**
   * Log history.
   */
  protected function logHistory(
    int $requisitionId,
    string $action,
    string $entityType,
    int $entityId,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    \App\Models\ProcurementHistory::create([
      'requisition_id' => $requisitionId,
      'user_id' => $this->getCurrentUserId(),
      'action' => $action,
      'entity_type' => $entityType,
      'entity_id' => $entityId,
      'old_values' => $oldValues,
      'new_values' => $newValues,
      'comment' => $comment,
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
