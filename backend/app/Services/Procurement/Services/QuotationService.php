<?php
// app/Services/Procurement/Services/QuotationService.php

declare(strict_types=1);

namespace App\Services\Procurement\Services;

use App\Models\Requisition;
use App\Models\QuotationRequest;
use App\Models\SupplierQuotation;
use App\Models\SupplierQuotationItem;
use App\Models\User;
use App\Services\Procurement\Base\BaseService;
use App\Services\Procurement\Contracts\Services\QuotationServiceInterface;
use App\Services\Procurement\Contracts\Repositories\QuotationRepositoryInterface;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\DTOs\QuotationDTO;
use App\Services\Procurement\DTOs\SupplierQuotationDTO;
use App\Services\Procurement\Exceptions\QuotationException;

class QuotationService extends BaseService implements QuotationServiceInterface
{
  public function __construct(
    protected QuotationRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher
  ) {
    parent::__construct();
  }

  public function createQuotationRequest(QuotationDTO $dto): QuotationRequest
  {
    $requisition = Requisition::find($dto->requisitionId);

    if (!$requisition) {
      throw QuotationException::requisitionNotFound($dto->requisitionId);
    }

    if (!$requisition->is_procurement_created) {
      throw new \Exception('Procurement must be started before creating a QTN.');
    }

    return $this->transaction(function () use ($requisition, $dto) {
      $qtn = $this->repository->createQuotationRequest([
        'requisition_id' => $requisition->id,
        'qtn_number' => $this->referenceGenerator->generateQtnNumber(),
        'title' => $dto->title,
        'description' => $dto->description,
        'issue_date' => $dto->issueDate->toDateString(),
        'closing_date' => $dto->closingDate->toDateString(),
        'closing_time' => $dto->closingTime,
        'delivery_terms' => $dto->deliveryTerms,
        'payment_terms' => $dto->paymentTerms,
        'special_conditions' => $dto->specialConditions,
        'instructions' => $dto->instructions,
        'status' => 'draft',
        'is_automated' => $dto->isAutomated,
        'is_tender' => $dto->isTender,
        'tender_number' => $dto->isTender ? $this->referenceGenerator->generateTenderNumber() : null,
        'generated_by' => $this->getCurrentUserId(),
        'reminder_days' => $dto->reminderDays,
        'metadata' => $dto->metadata,
      ]);

      $this->logHistory(
        $requisition->id,
        'qtn_generated',
        'quotation_request',
        $qtn->id,
        null,
        ['qtn_number' => $qtn->qtn_number],
        "Quotation Request {$qtn->qtn_number} generated"
      );

      return $qtn;
    });
  }

  public function sendQtnToSuppliers(int $qtnId, array $supplierIds): QuotationRequest
  {
    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status !== 'draft') {
      throw QuotationException::qtnNotOpen();
    }

    return $this->transaction(function () use ($qtn, $supplierIds) {
      $suppliers = User::whereIn('id', $supplierIds)
        ->where('role', 'supplier')
        ->where('is_active', true)
        ->get();

      if ($suppliers->isEmpty()) {
        throw QuotationException::noValidSuppliers();
      }

      foreach ($suppliers as $supplier) {
        $qtn->addSentSupplier($supplier->id);
      }

      $qtn->update([
        'status' => 'sent',
        'sent_at' => now(),
      ]);

      // Notify suppliers
      $this->notificationDispatcher->notify('qtn_sent', [
        'qtn_id' => $qtn->id,
        'qtn_number' => $qtn->qtn_number,
        'supplier_ids' => $supplierIds,
        'requisition_id' => $qtn->requisition_id,
        'closing_date' => $qtn->closing_date->toDateString(),
      ]);

      $this->logHistory(
        $qtn->requisition_id,
        'qtn_sent',
        'quotation_request',
        $qtn->id,
        null,
        ['sent_to' => $supplierIds],
        "QTN {$qtn->qtn_number} sent to " . count($supplierIds) . " suppliers"
      );

      return $qtn;
    });
  }

  public function getQuotationRequest(int $qtnId): QuotationRequest
  {
    $qtn = $this->repository->findQuotationRequest($qtnId);

    if (!$qtn) {
      throw QuotationException::qtnNotFound($qtnId);
    }

    return $qtn;
  }

  public function submitSupplierQuotation(SupplierQuotationDTO $dto): SupplierQuotation
  {
    $qtn = $this->getQuotationRequest($dto->quotationRequestId);

    if (!$qtn->canRespond()) {
      throw QuotationException::qtnNotOpen();
    }

    if ($qtn->isExpired()) {
      throw QuotationException::qtnExpired();
    }

    if (!$this->isSupplierInvited($qtn->id, $dto->supplierId)) {
      throw QuotationException::supplierNotInvited($dto->supplierId);
    }

    if ($this->hasSupplierResponded($qtn->id, $dto->supplierId)) {
      throw QuotationException::supplierAlreadyResponded($dto->supplierId);
    }

    if (empty($dto->items)) {
      throw QuotationException::noItems();
    }

    return $this->transaction(function () use ($qtn, $dto) {
      $quotation = $this->repository->createSupplierQuotation([
        'quotation_request_id' => $qtn->id,
        'supplier_id' => $dto->supplierId,
        'quotation_number' => $this->referenceGenerator->generateSupplierQuotationNumber(),
        'supplier_reference_no' => $dto->supplierReferenceNo,
        'submission_date' => $dto->submissionDate->toDateString(),
        'validity_date' => $dto->validityDate->toDateString(),
        'delivery_time' => $dto->deliveryTime,
        'payment_terms' => $dto->paymentTerms,
        'delivery_terms' => $dto->deliveryTerms,
        'warranty_terms' => $dto->warrantyTerms,
        'total_amount' => 0,
        'tax_amount' => 0,
        'discount_amount' => 0,
        'net_amount' => 0,
        'currency' => $dto->currency,
        'status' => 'submitted',
        'submission_method' => $dto->submissionMethod,
        'uploaded_file_path' => $dto->uploadedFilePath,
        'original_filename' => $dto->originalFilename,
        'notes' => $dto->notes,
        'metadata' => $dto->metadata,
      ]);

      foreach ($dto->items as $itemData) {
        $item = $this->repository->createSupplierQuotationItem([
          'supplier_quotation_id' => $quotation->id,
          'requisition_item_id' => $itemData['requisition_item_id'],
          'item_name' => $itemData['item_name'],
          'description' => $itemData['description'] ?? null,
          'unit_of_measure' => $itemData['unit_of_measure'] ?? null,
          'quantity' => $itemData['quantity'],
          'unit_price' => $itemData['unit_price'],
          'total_price' => $itemData['quantity'] * $itemData['unit_price'],
          'tax_rate' => $itemData['tax_rate'] ?? 0,
          'tax_amount' => 0,
          'discount_rate' => $itemData['discount_rate'] ?? 0,
          'discount_amount' => 0,
          'net_price' => 0,
          'delivery_days' => $itemData['delivery_days'] ?? null,
          'warranty_months' => $itemData['warranty_months'] ?? null,
          'specifications' => $itemData['specifications'] ?? null,
          'brand' => $itemData['brand'] ?? null,
          'model' => $itemData['model'] ?? null,
          'is_alternative' => $itemData['is_alternative'] ?? false,
          'alternative_notes' => $itemData['alternative_notes'] ?? null,
        ]);

        $item->calculateTotals();
      }

      $quotation->updateTotals();

      $qtn->addRespondedSupplier($dto->supplierId);

      $respondedCount = count($qtn->getRespondedSuppliers());
      $sentCount = count($qtn->getSentSuppliers());

      if ($respondedCount >= $sentCount) {
        $qtn->markAsResponded();
      }

      $this->checkAndMarkLowest($quotation);

      // Notify procurement officer
      $this->notificationDispatcher->notify('quotation_received', [
        'quotation_id' => $quotation->id,
        'quotation_number' => $quotation->quotation_number,
        'supplier_id' => $dto->supplierId,
        'qtn_id' => $qtn->id,
        'requisition_id' => $qtn->requisition_id,
      ]);

      $this->logHistory(
        $qtn->requisition_id,
        'quotation_submitted',
        'supplier_quotation',
        $quotation->id,
        null,
        ['quotation_number' => $quotation->quotation_number],
        "Quotation submitted by supplier ID: {$dto->supplierId}"
      );

      return $quotation;
    });
  }

  public function verifySupplierQuotation(int $quotationId, int $userId, string $status, ?string $notes = null): SupplierQuotation
  {
    $quotation = $this->getSupplierQuotation($quotationId);

    if ($quotation->verification_status === 'verified') {
      throw QuotationException::quotationAlreadyVerified();
    }

    return $this->transaction(function () use ($quotation, $userId, $status, $notes) {
      $quotation->update([
        'verification_status' => $status,
        'verified_by' => $userId,
        'verified_at' => now(),
        'verification_notes' => $notes,
      ]);

      if ($status === 'verified') {
        $this->checkAndMarkLowest($quotation);
      }

      $this->logHistory(
        $quotation->quotationRequest->requisition_id,
        'quotation_verified',
        'supplier_quotation',
        $quotation->id,
        null,
        ['verification_status' => $quotation->verification_status],
        "Quotation {$quotation->quotation_number} verified"
      );

      return $quotation;
    });
  }

  public function evaluateSupplierQuotation(int $quotationId, int $score, ?string $notes = null): SupplierQuotation
  {
    $quotation = $this->getSupplierQuotation($quotationId);

    if ($quotation->status === 'evaluated') {
      throw QuotationException::quotationAlreadyEvaluated();
    }

    return $this->transaction(function () use ($quotation, $score, $notes) {
      $quotation->update([
        'status' => 'evaluated',
        'evaluated_by' => $this->getCurrentUserId(),
        'evaluated_at' => now(),
        'evaluation_score' => $score,
        'evaluation_notes' => $notes,
      ]);

      $this->logHistory(
        $quotation->quotationRequest->requisition_id,
        'quotation_evaluated',
        'supplier_quotation',
        $quotation->id,
        null,
        ['evaluation_score' => $score],
        "Quotation {$quotation->quotation_number} evaluated"
      );

      return $quotation;
    });
  }

  public function selectSupplier(int $requisitionId, int $supplierId, int $quotationId): Requisition
  {
    $requisition = Requisition::find($requisitionId);
    if (!$requisition) {
      throw QuotationException::requisitionNotFound($requisitionId);
    }

    $quotation = $this->getSupplierQuotation($quotationId);

    if ($quotation->supplier_id !== $supplierId) {
      throw QuotationException::supplierQuotationMismatch();
    }

    return $this->transaction(function () use ($requisition, $supplierId, $quotation) {
      $requisition->update([
        'supplier_id' => $supplierId,
        'metadata' => array_merge($requisition->metadata ?? [], [
          'procurement' => [
            'selected_supplier_id' => $supplierId,
            'selected_quotation_id' => $quotation->id,
            'selected_at' => now(),
            'selected_by' => $this->getCurrentUserId(),
          ]
        ])
      ]);

      $quotation->markAsAccepted();

      $quotation->quotationRequest->supplierQuotations()
        ->where('id', '!=', $quotation->id)
        ->where('status', 'submitted')
        ->update(['status' => 'rejected']);

      $quotation->quotationRequest->markAsClosed();

      // Notify selected supplier
      $this->notificationDispatcher->notify('supplier_selected', [
        'requisition_id' => $requisition->id,
        'supplier_id' => $supplierId,
        'quotation_id' => $quotation->id,
        'reference_number' => $requisition->reference_number,
      ]);

      $this->logHistory(
        $requisition->id,
        'supplier_selected',
        'requisition',
        $requisition->id,
        null,
        ['supplier_id' => $supplierId, 'quotation_id' => $quotation->id],
        "Supplier selected for requisition"
      );

      return $requisition;
    });
  }

  public function getLowestQuotation(int $qtnId): ?SupplierQuotation
  {
    return $this->repository->getLowestQuotationForQtn($qtnId);
  }

  public function getQuotationsForQtn(int $qtnId): array
  {
    return $this->repository->getSupplierQuotationsForQtn($qtnId);
  }

  public function closeQtn(int $qtnId, ?string $reason = null): QuotationRequest
  {
    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status === 'closed') {
      throw QuotationException::qtnAlreadyClosed();
    }

    return $this->transaction(function () use ($qtn) {
      $qtn->markAsClosed();

      $this->logHistory(
        $qtn->requisition_id,
        'qtn_closed',
        'quotation_request',
        $qtn->id,
        null,
        ['status' => 'closed'],
        "QTN {$qtn->qtn_number} closed"
      );

      return $qtn;
    });
  }

  public function cancelQtn(int $qtnId, string $reason): QuotationRequest
  {
    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status === 'closed' || $qtn->status === 'cancelled') {
      throw QuotationException::qtnAlreadyCancelled();
    }

    return $this->transaction(function () use ($qtn, $reason) {
      $qtn->markAsCancelled($reason);

      // Notify suppliers
      $this->notificationDispatcher->notify('qtn_cancelled', [
        'qtn_id' => $qtn->id,
        'qtn_number' => $qtn->qtn_number,
        'reason' => $reason,
        'supplier_ids' => $qtn->getSentSuppliers(),
      ]);

      $this->logHistory(
        $qtn->requisition_id,
        'qtn_cancelled',
        'quotation_request',
        $qtn->id,
        null,
        ['cancellation_reason' => $reason],
        "QTN {$qtn->qtn_number} cancelled: {$reason}"
      );

      return $qtn;
    });
  }

  public function sendQtnReminder(int $qtnId): void
  {
    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status !== 'sent' && $qtn->status !== 'responded') {
      throw new \Exception('Reminder can only be sent for active QTNs.');
    }

    $sentSuppliers = $qtn->getSentSuppliers();
    $respondedSuppliers = $qtn->getRespondedSuppliers();
    $pendingSuppliers = array_diff($sentSuppliers, $respondedSuppliers);

    if (empty($pendingSuppliers)) {
      throw new \Exception('All suppliers have responded.');
    }

    $this->notificationDispatcher->notify('qtn_reminder', [
      'qtn_id' => $qtn->id,
      'qtn_number' => $qtn->qtn_number,
      'closing_date' => $qtn->closing_date->toDateString(),
      'supplier_ids' => $pendingSuppliers,
    ]);

    $this->logHistory(
      $qtn->requisition_id,
      'qtn_reminder_sent',
      'quotation_request',
      $qtn->id,
      null,
      ['reminded_suppliers' => $pendingSuppliers],
      "Reminder sent to " . count($pendingSuppliers) . " suppliers"
    );
  }

  public function getQtnStatistics(int $qtnId): array
  {
    $qtn = $this->getQuotationRequest($qtnId);

    $statistics = [
      'total_sent' => count($qtn->getSentSuppliers()),
      'total_responded' => count($qtn->getRespondedSuppliers()),
      'total_declined' => count($qtn->getDeclinedSuppliers()),
      'response_rate' => $qtn->response_rate,
      'lowest_quotation' => null,
      'highest_quotation' => null,
      'average_quotation' => 0,
    ];

    if ($qtn->status === 'closed' || $qtn->status === 'responded') {
      $lowest = $qtn->getLowestQuotation();
      $highest = $qtn->getHighestQuotation();
      $average = $qtn->getAverageQuotation();

      $statistics['lowest_quotation'] = $lowest ? [
        'supplier' => $lowest->supplier->full_name,
        'amount' => $lowest->net_amount,
        'quotation_number' => $lowest->quotation_number,
      ] : null;

      $statistics['highest_quotation'] = $highest ? [
        'supplier' => $highest->supplier->full_name,
        'amount' => $highest->net_amount,
        'quotation_number' => $highest->quotation_number,
      ] : null;

      $statistics['average_quotation'] = $average;
    }

    return $statistics;
  }

  public function isSupplierInvited(int $qtnId, int $supplierId): bool
  {
    return $this->repository->isSupplierInvited($qtnId, $supplierId);
  }

  public function hasSupplierResponded(int $qtnId, int $supplierId): bool
  {
    return $this->repository->hasSupplierResponded($qtnId, $supplierId);
  }

  public function getSupplierQuotation(int $quotationId): SupplierQuotation
  {
    $quotation = $this->repository->findSupplierQuotation($quotationId);

    if (!$quotation) {
      throw QuotationException::quotationNotFound($quotationId);
    }

    return $quotation;
  }

  public function updateQuotationRequest(int $qtnId, array $data): QuotationRequest
  {
    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status !== 'draft') {
      throw new \Exception('QTN can only be updated in draft status.');
    }

    return $this->repository->updateQuotationRequest($qtnId, $data);
  }

  public function getActiveQtns(): array
  {
    return $this->repository->getActiveQtns();
  }

  public function getQtnsClosingSoon(int $days = 2): array
  {
    return $this->repository->getQtnsClosingSoon($days);
  }

  /**
   * Check and mark the lowest quotation.
   */
  protected function checkAndMarkLowest(SupplierQuotation $quotation): void
  {
    $qtn = $quotation->quotationRequest;
    $allQuotations = $qtn->supplierQuotations()
      ->where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->get();

    if ($allQuotations->isEmpty()) {
      return;
    }

    $lowest = $allQuotations->sortBy('net_amount')->first();
    $qtn->supplierQuotations()->update(['is_lowest' => false]);
    $lowest->update(['is_lowest' => true]);
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
