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
use App\Services\Procurement\Services\ProcurementService;
use App\Services\Procurement\Utilities\PdfGenerator;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;

class QuotationService extends BaseService implements QuotationServiceInterface
{
  public function __construct(
    protected QuotationRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher,
    protected ProcurementService $procurementService
  ) {
    parent::__construct();
    Log::info('[QuotationService] Constructed');
  }

  public function createQuotationRequest(QuotationDTO $dto): QuotationRequest
  {
    Log::info('[QuotationService] createQuotationRequest - START', [
      'requisition_id' => $dto->requisitionId,
      'title' => $dto->title,
    ]);

    $requisition = Requisition::find($dto->requisitionId);

    if (!$requisition) {
      throw QuotationException::requisitionNotFound($dto->requisitionId);
    }

    if (!$requisition->is_procurement_created) {
      try {
        $this->procurementService->startProcurement($requisition->id);
        $requisition->refresh();
      } catch (\Exception $e) {
        throw new \Exception('Failed to start procurement: ' . $e->getMessage());
      }
    }

    return $this->transaction(function () use ($requisition, $dto) {
      $userId = $this->getCurrentUserId();
      if (!$userId) {
        $userId = $requisition->user_id;
      }
      if (!$userId) {
        $userId = $this->getSystemUserId();
      }

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
        'generated_by' => $userId,
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

      Log::info('[QuotationService] createQuotationRequest - COMPLETED', [
        'qtn_id' => $qtn->id,
        'qtn_number' => $qtn->qtn_number,
      ]);

      return $qtn;
    });
  }

  public function sendQtnToSuppliers(int $qtnId, array $supplierIds): QuotationRequest
  {
    Log::info('[QuotationService] sendQtnToSuppliers - START', [
      'qtn_id' => $qtnId,
      'supplier_count' => count($supplierIds),
    ]);

    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status !== 'draft') {
      throw QuotationException::qtnNotOpen();
    }

    return $this->transaction(function () use ($qtn, $supplierIds) {
      $suppliers = \App\Models\Supplier::whereIn('id', $supplierIds)
        ->with('user')
        ->get()
        ->filter(function ($supplier) {
          return $supplier->user && $supplier->user->is_active;
        });

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

      Log::info('[QuotationService] sendQtnToSuppliers - COMPLETED', [
        'qtn_id' => $qtn->id,
        'qtn_number' => $qtn->qtn_number,
      ]);

      return $qtn;
    });
  }

  public function getQuotationRequest(int $qtnId): QuotationRequest
  {
    Log::info('[QuotationService] getQuotationRequest - START', ['qtn_id' => $qtnId]);

    $qtn = $this->repository->findQuotationRequest($qtnId);

    if (!$qtn) {
      throw QuotationException::qtnNotFound($qtnId);
    }

    Log::info('[QuotationService] getQuotationRequest - FOUND', [
      'qtn_id' => $qtn->id,
      'qtn_number' => $qtn->qtn_number,
      'status' => $qtn->status,
    ]);

    return $qtn;
  }

  public function submitSupplierQuotation(SupplierQuotationDTO $dto): SupplierQuotation
  {
    Log::info('[QuotationService] submitSupplierQuotation - START', [
      'quotation_request_id' => $dto->quotationRequestId,
      'supplier_id' => $dto->supplierId,
      'items_count' => count($dto->items),
    ]);

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
      $quotationData = [
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
      ];

      $quotation = $this->repository->createSupplierQuotation($quotationData);

      foreach ($dto->items as $itemData) {
        $itemCreateData = [
          'supplier_quotation_id' => $quotation->id,
          'requisition_item_id' => $itemData['requisition_item_id'] ?? null,
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
        ];

        $item = $this->repository->createSupplierQuotationItem($itemCreateData);
        $item->calculateTotals();
      }

      $quotation->updateTotals();

      $qtn->addRespondedSupplier($dto->supplierId);

      $respondedCount = count($qtn->getRespondedSuppliers());
      $sentCount = count($qtn->getSentSuppliers());

      if ($respondedCount >= $sentCount && $sentCount > 0) {
        $qtn->markAsResponded();
      }

      $this->checkAndMarkLowest($quotation);

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
        [
          'quotation_number' => $quotation->quotation_number,
          'items_count' => count($dto->items),
        ],
        "Quotation submitted by supplier ID: {$dto->supplierId}"
      );

      Log::info('[QuotationService] submitSupplierQuotation - COMPLETED', [
        'quotation_id' => $quotation->id,
        'quotation_number' => $quotation->quotation_number,
        'items_count' => count($dto->items),
      ]);

      return $quotation;
    });
  }

  public function verifySupplierQuotation(int $quotationId, int $userId, string $status, ?string $notes = null): SupplierQuotation
  {
    Log::info('[QuotationService] verifySupplierQuotation - START', [
      'quotation_id' => $quotationId,
      'user_id' => $userId,
      'status' => $status,
    ]);

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

        $qtn = $quotation->quotationRequest;
        if ($qtn && $qtn->status === 'responded') {
          $allQuotations = $qtn->supplierQuotations()
            ->where('status', 'submitted')
            ->get();

          $allVerified = $allQuotations->every(function ($q) {
            return $q->verification_status === 'verified';
          });

          if ($allVerified) {
            $qtn->update(['status' => 'evaluating']);

            $this->logHistory(
              $qtn->requisition_id,
              'qtn_status_changed',
              'quotation_request',
              $qtn->id,
              ['status' => 'responded'],
              ['status' => 'evaluating'],
              "All quotations verified. QTN {$qtn->qtn_number} moved to evaluating"
            );
          }
        }
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

      Log::info('[QuotationService] verifySupplierQuotation - COMPLETED', [
        'quotation_id' => $quotation->id,
        'verification_status' => $quotation->verification_status,
      ]);

      return $quotation;
    });
  }

  public function evaluateSupplierQuotation(int $quotationId, int $score, ?string $notes = null): SupplierQuotation
  {
    Log::info('[QuotationService] evaluateSupplierQuotation - START', [
      'quotation_id' => $quotationId,
      'score' => $score,
      'user_id' => $this->getCurrentUserId(),
    ]);

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

      $qtn = $quotation->quotationRequest;
      if ($qtn) {
        if ($qtn->status === 'responded') {
          $qtn->update(['status' => 'evaluating']);

          $this->logHistory(
            $qtn->requisition_id,
            'qtn_status_changed',
            'quotation_request',
            $qtn->id,
            ['status' => 'responded'],
            ['status' => 'evaluating'],
            "QTN {$qtn->qtn_number} moved to evaluating"
          );
        }

        $allQuotations = $qtn->supplierQuotations()
          ->whereIn('status', ['submitted', 'evaluated'])
          ->get();

        $allEvaluated = $allQuotations->every(function ($q) {
          return $q->status === 'evaluated';
        });

        if ($allEvaluated && $qtn->status === 'evaluating') {
          $qtn->update(['status' => 'closed']);

          $this->logHistory(
            $qtn->requisition_id,
            'qtn_auto_closed',
            'quotation_request',
            $qtn->id,
            ['status' => 'evaluating'],
            ['status' => 'closed'],
            "All quotations evaluated. QTN {$qtn->qtn_number} auto-closed"
          );
        }
      }

      $this->logHistory(
        $quotation->quotationRequest->requisition_id,
        'quotation_evaluated',
        'supplier_quotation',
        $quotation->id,
        null,
        ['evaluation_score' => $score, 'status' => 'evaluated'],
        "Quotation {$quotation->quotation_number} evaluated with score {$score}%"
      );

      Log::info('[QuotationService] evaluateSupplierQuotation - COMPLETED', [
        'quotation_id' => $quotation->id,
        'evaluation_score' => $score,
      ]);

      return $quotation;
    });
  }

  public function selectSupplier(int $requisitionId, int $supplierId, int $quotationId): Requisition
  {
    Log::info('[QuotationService] selectSupplier - START', [
      'requisition_id' => $requisitionId,
      'supplier_id' => $supplierId,
      'quotation_id' => $quotationId,
    ]);

    $requisition = Requisition::find($requisitionId);
    if (!$requisition) {
      throw QuotationException::requisitionNotFound($requisitionId);
    }

    $quotation = $this->getSupplierQuotation($quotationId);

    if ($quotation->supplier_id !== $supplierId) {
      throw QuotationException::supplierQuotationMismatch();
    }

    $qtn = $quotation->quotationRequest;
    if ($qtn && !in_array($qtn->status, ['evaluating', 'closed'])) {
      throw new \Exception(
        'RFQ must be in "evaluating" or "closed" status to select a supplier.'
      );
    }

    return $this->transaction(function () use ($requisition, $supplierId, $quotation) {
      $metadata = $requisition->metadata;
      if (is_string($metadata)) {
        $metadata = json_decode($metadata, true) ?? [];
      } elseif (!is_array($metadata)) {
        $metadata = [];
      }

      $metadata['procurement'] = array_merge(
        $metadata['procurement'] ?? [],
        [
          'selected_supplier_id' => $supplierId,
          'selected_quotation_id' => $quotation->id,
          'selected_at' => now()->toDateTimeString(),
          'selected_by' => $this->getCurrentUserId(),
        ]
      );

      $requisition->update([
        'supplier_id' => $supplierId,
        'metadata' => $metadata,
      ]);

      $quotation->markAsAccepted();

      $quotation->quotationRequest->supplierQuotations()
        ->where('id', '!=', $quotation->id)
        ->whereIn('status', ['submitted', 'evaluated'])
        ->update(['status' => 'rejected']);

      $quotation->quotationRequest->update([
        'status' => 'closed'
      ]);

      try {
        $this->notificationDispatcher->notify('supplier_selected', [
          'requisition_id' => (string) $requisition->id,
          'supplier_id' => (string) $supplierId,
          'quotation_id' => (string) $quotation->id,
          'reference_number' => (string) ($requisition->reference_number ?? ''),
        ]);
      } catch (\Exception $e) {
        Log::error('Failed to send notification: ' . $e->getMessage());
      }

      $this->logHistory(
        $requisition->id,
        'supplier_selected',
        'requisition',
        $requisition->id,
        null,
        [
          'supplier_id' => (string) $supplierId,
          'quotation_id' => (string) $quotation->id,
          'selected_at' => now()->toDateTimeString(),
        ],
        "Supplier selected for requisition #{$requisition->reference_number}"
      );

      Log::info('[QuotationService] selectSupplier - COMPLETED', [
        'requisition_id' => $requisition->id,
        'supplier_id' => $supplierId,
      ]);

      return $requisition;
    });
  }

  public function closeQtn(int $qtnId, ?string $reason = null): QuotationRequest
  {
    Log::info('[QuotationService] closeQtn - START', [
      'qtn_id' => $qtnId,
      'reason' => $reason,
    ]);

    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status === 'closed') {
      throw QuotationException::qtnAlreadyClosed();
    }

    if ($qtn->status === 'cancelled') {
      throw new \Exception('Cannot close a cancelled QTN.');
    }

    $allowedStatuses = ['evaluating', 'expired'];
    if (!in_array($qtn->status, $allowedStatuses)) {
      $statusMap = [
        'draft' => 'Draft (edit or delete instead)',
        'sent' => 'Sent (waiting for supplier responses)',
        'responded' => 'Responded (evaluate quotations first)',
      ];

      $suggestion = $statusMap[$qtn->status] ?? 'current status';

      throw new \Exception(
        "Cannot close QTN while in '{$qtn->status}' status. " .
          "The QTN must be in 'evaluating' or 'expired' status to close. " .
          "Current status: {$qtn->status} - {$suggestion}"
      );
    }

    return $this->transaction(function () use ($qtn, $reason) {
      $qtn->markAsClosed();

      $this->logHistory(
        $qtn->requisition_id,
        'qtn_closed',
        'quotation_request',
        $qtn->id,
        null,
        ['status' => 'closed', 'reason' => $reason],
        "QTN {$qtn->qtn_number} closed" . ($reason ? " - Reason: {$reason}" : "")
      );

      Log::info('[QuotationService] closeQtn - COMPLETED', [
        'qtn_id' => $qtn->id,
        'qtn_number' => $qtn->qtn_number,
      ]);

      return $qtn;
    });
  }

  public function cancelQtn(int $qtnId, string $reason): QuotationRequest
  {
    Log::info('[QuotationService] cancelQtn - START', [
      'qtn_id' => $qtnId,
      'reason' => $reason,
    ]);

    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status === 'closed' || $qtn->status === 'cancelled') {
      throw QuotationException::qtnAlreadyCancelled();
    }

    return $this->transaction(function () use ($qtn, $reason) {
      $qtn->markAsCancelled($reason);

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

      Log::info('[QuotationService] cancelQtn - COMPLETED', [
        'qtn_id' => $qtn->id,
        'qtn_number' => $qtn->qtn_number,
      ]);

      return $qtn;
    });
  }

  public function sendQtnReminder(int $qtnId): void
  {
    Log::info('[QuotationService] sendQtnReminder - START', ['qtn_id' => $qtnId]);

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

    Log::info('[QuotationService] sendQtnReminder - COMPLETED', ['qtn_id' => $qtnId]);
  }

  public function getQtnStatistics(int $qtnId): array
  {
    Log::info('[QuotationService] getQtnStatistics - START', ['qtn_id' => $qtnId]);

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

    Log::info('[QuotationService] getQtnStatistics - COMPLETED', [
      'qtn_id' => $qtnId,
      'total_sent' => $statistics['total_sent'],
      'total_responded' => $statistics['total_responded'],
    ]);

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
    Log::info('[QuotationService] getSupplierQuotation - START', ['quotation_id' => $quotationId]);

    $quotation = $this->repository->findSupplierQuotation($quotationId);

    if (!$quotation) {
      throw QuotationException::quotationNotFound($quotationId);
    }

    Log::info('[QuotationService] getSupplierQuotation - FOUND', [
      'quotation_id' => $quotation->id,
      'quotation_number' => $quotation->quotation_number,
      'status' => $quotation->status,
    ]);

    return $quotation;
  }

  public function updateQuotationRequest(int $qtnId, array $data): QuotationRequest
  {
    Log::info('[QuotationService] updateQuotationRequest - START', [
      'qtn_id' => $qtnId,
      'data_keys' => array_keys($data),
    ]);

    $qtn = $this->getQuotationRequest($qtnId);

    if ($qtn->status !== 'draft') {
      throw new \Exception('QTN can only be updated in draft status.');
    }

    Log::info('[QuotationService] updateQuotationRequest - COMPLETED', ['qtn_id' => $qtnId]);

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

  public function getLowestQuotation(int $qtnId): ?SupplierQuotation
  {
    return $this->repository->getLowestQuotationForQtn($qtnId);
  }

  public function getQuotationsForQtn(int $qtnId): array
  {
    return $this->repository->getSupplierQuotationsForQtn($qtnId);
  }

  public function getQuotationsBySupplier(int $supplierId): array
  {
    return $this->repository->getQuotationsBySupplier($supplierId);
  }

  public function getAllQuotations(array $filters = []): array
  {
    return $this->repository->getAllSupplierQuotations($filters);
  }

  protected function checkAndMarkLowest(SupplierQuotation $quotation): void
  {
    Log::info('[QuotationService] checkAndMarkLowest - START', [
      'quotation_id' => $quotation->id,
      'quotation_number' => $quotation->quotation_number,
    ]);

    $qtn = $quotation->quotationRequest;
    $allQuotations = $qtn->supplierQuotations()
      ->where('status', 'submitted')
      ->where('verification_status', 'verified')
      ->get();

    if ($allQuotations->isEmpty()) {
      Log::info('[QuotationService] checkAndMarkLowest - No verified quotations to check');
      return;
    }

    $lowest = $allQuotations->sortBy('net_amount')->first();
    $qtn->supplierQuotations()->update(['is_lowest' => false]);
    $lowest->update(['is_lowest' => true]);

    Log::info('[QuotationService] checkAndMarkLowest - COMPLETED', [
      'lowest_quotation_id' => $lowest->id,
      'lowest_net_amount' => $lowest->net_amount,
    ]);
  }

  protected function logHistory(
    int $requisitionId,
    string $action,
    string $entityType,
    int $entityId,
    ?array $oldValues = null,
    ?array $newValues = null,
    ?string $comment = null
  ): void {
    $userId = $this->getCurrentUserId();
    if (!$userId) {
      $requisition = \App\Models\Requisition::find($requisitionId);
      if ($requisition && $requisition->user_id) {
        $userId = $requisition->user_id;
      }
    }
    if (!$userId) {
      $userId = $this->getSystemUserId();
    }

    \App\Models\ProcurementHistory::create([
      'requisition_id' => $requisitionId,
      'user_id' => $userId,
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

  protected function getSystemUserId(): int
  {
    $admin = \App\Models\User::where('is_admin', true)->first();
    if ($admin) {
      return $admin->id;
    }

    $admin = \App\Models\User::role('admin')->first();
    if ($admin) {
      return $admin->id;
    }

    $user = \App\Models\User::first();
    if ($user) {
      return $user->id;
    }

    return 1;
  }

  // ============================================================
  // RFQ PDF METHODS - NO STORAGE, FRESH GENERATION ONLY
  // ============================================================

  protected function generateQtnFilename(QuotationRequest $qtn, string $suffix = ''): string
  {
    $rfqNumber = $qtn->qtn_number ?? 'RFQ-' . str_pad($qtn->id, 5, '0', STR_PAD_LEFT);
    $rfqNumber = str_replace(' ', '-', trim($rfqNumber));
    return $rfqNumber . ($suffix ? '-' . $suffix : '') . '.pdf';
  }

  /**
   * Download RFQ PDF - Generates fresh PDF each time
   */
  public function downloadQTNPDF(int $qtnId, string $suffix = ''): Response
  {
    Log::info('[QuotationService] downloadQTNPDF - START', [
      'qtn_id' => $qtnId,
      'suffix' => $suffix,
    ]);

    $qtn = $this->getQuotationRequest($qtnId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateQuotation($qtn);
    $filename = $this->generateQtnFilename($qtn, $suffix);

    Log::info('[QuotationService] downloadQTNPDF - COMPLETED', [
      'qtn_id' => $qtnId,
      'filename' => $filename,
    ]);

    return response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => 'attachment; filename="' . $filename . '"',
      'Cache-Control' => 'no-cache, no-store, must-revalidate',
      'Pragma' => 'no-cache',
      'Expires' => '0',
    ]);
  }

  /**
   * Stream RFQ PDF - Generates fresh PDF each time
   */
  public function streamQTNPDF(int $qtnId, string $suffix = ''): Response
  {
    Log::info('[QuotationService] streamQTNPDF - START', ['qtn_id' => $qtnId]);

    $qtn = $this->getQuotationRequest($qtnId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateQuotation($qtn);
    $filename = $this->generateQtnFilename($qtn, $suffix);

    Log::info('[QuotationService] streamQTNPDF - COMPLETED', ['qtn_id' => $qtnId]);

    return response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => 'inline; filename="' . $filename . '"',
      'Cache-Control' => 'no-cache, no-store, must-revalidate',
      'Pragma' => 'no-cache',
      'Expires' => '0',
    ]);
  }

  public function generateQTNPDFContent(int $qtnId): string
  {
    Log::info('[QuotationService] generateQTNPDFContent - START', ['qtn_id' => $qtnId]);

    $qtn = $this->getQuotationRequest($qtnId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateQuotation($qtn);

    Log::info('[QuotationService] generateQTNPDFContent - COMPLETED');

    return $pdfContent;
  }

  public function downloadVerifiedQTNPDF(int $qtnId): Response
  {
    return $this->downloadQTNPDF($qtnId, 'verified');
  }

  public function downloadDraftQTNPDF(int $qtnId): Response
  {
    return $this->downloadQTNPDF($qtnId, 'draft');
  }

  // ============================================================
  // SUPPLIER QUOTATION PDF METHODS - NO STORAGE
  // ============================================================

  protected function generateSupplierQuotationFilename(SupplierQuotation $quotation, string $suffix = ''): string
  {
    $qtnNumber = $quotation->quotation_number ?? 'QTN-' . str_pad($quotation->id, 5, '0', STR_PAD_LEFT);
    $qtnNumber = str_replace(' ', '-', trim($qtnNumber));
    return $qtnNumber . ($suffix ? '-' . $suffix : '') . '.pdf';
  }

  /**
   * Download supplier quotation PDF - Generates fresh PDF each time
   */
  public function downloadSupplierQuotationPDF(int $quotationId, string $suffix = ''): Response
  {
    Log::info('[QuotationService] downloadSupplierQuotationPDF - START', [
      'quotation_id' => $quotationId,
      'suffix' => $suffix,
    ]);

    $quotation = $this->getSupplierQuotation($quotationId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateSupplierQuotationWithData($quotation);
    $filename = $this->generateSupplierQuotationFilename($quotation, $suffix);

    Log::info('[QuotationService] downloadSupplierQuotationPDF - COMPLETED', [
      'quotation_id' => $quotationId,
      'filename' => $filename,
    ]);

    return response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => 'attachment; filename="' . $filename . '"',
      'Cache-Control' => 'no-cache, no-store, must-revalidate',
      'Pragma' => 'no-cache',
      'Expires' => '0',
    ]);
  }

  /**
   * Stream supplier quotation PDF - Generates fresh PDF each time
   */
  public function streamSupplierQuotationPDF(int $quotationId, string $suffix = ''): Response
  {
    Log::info('[QuotationService] streamSupplierQuotationPDF - START', ['quotation_id' => $quotationId]);

    $quotation = $this->getSupplierQuotation($quotationId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateSupplierQuotationWithData($quotation);
    $filename = $this->generateSupplierQuotationFilename($quotation, $suffix);

    Log::info('[QuotationService] streamSupplierQuotationPDF - COMPLETED', ['quotation_id' => $quotationId]);

    return response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => 'inline; filename="' . $filename . '"',
      'Cache-Control' => 'no-cache, no-store, must-revalidate',
      'Pragma' => 'no-cache',
      'Expires' => '0',
    ]);
  }

  public function generateSupplierQuotationPDFContent(int $quotationId): string
  {
    Log::info('[QuotationService] generateSupplierQuotationPDFContent - START', ['quotation_id' => $quotationId]);

    $quotation = $this->getSupplierQuotation($quotationId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateSupplierQuotationWithData($quotation);

    Log::info('[QuotationService] generateSupplierQuotationPDFContent - COMPLETED');

    return $pdfContent;
  }

  /**
   * Download supplier quotation PDF with pre-loaded data - Generates fresh each time
   */
  public function downloadSupplierQuotationPDFWithData(SupplierQuotation $quotation): Response
  {
    Log::info('[QuotationService] downloadSupplierQuotationPDFWithData - START', [
      'quotation_id' => $quotation->id,
      'quotation_number' => $quotation->quotation_number,
    ]);

    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateSupplierQuotationWithData($quotation);
    $filename = $this->generateSupplierQuotationFilename($quotation);

    Log::info('[QuotationService] downloadSupplierQuotationPDFWithData - COMPLETED', [
      'quotation_id' => $quotation->id,
      'filename' => $filename,
    ]);

    return response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => 'attachment; filename="' . $filename . '"',
      'Cache-Control' => 'no-cache, no-store, must-revalidate',
      'Pragma' => 'no-cache',
      'Expires' => '0',
    ]);
  }

  public function getSupplierQuotationBase64PDF(int $quotationId): array
  {
    Log::info('[QuotationService] getSupplierQuotationBase64PDF - START', ['quotation_id' => $quotationId]);

    $quotation = $this->getSupplierQuotation($quotationId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateSupplierQuotationWithData($quotation);
    $base64 = base64_encode($pdfContent);
    $filename = $this->generateSupplierQuotationFilename($quotation);

    return [
      'base64' => $base64,
      'filename' => $filename,
      'size' => strlen($pdfContent),
    ];
  }

  public function downloadVerifiedSupplierQuotationPDF(int $quotationId): Response
  {
    return $this->downloadSupplierQuotationPDF($quotationId, 'verified');
  }

  public function downloadDraftSupplierQuotationPDF(int $quotationId): Response
  {
    return $this->downloadSupplierQuotationPDF($quotationId, 'draft');
  }
}
