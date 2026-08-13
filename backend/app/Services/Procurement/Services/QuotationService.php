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

class QuotationService extends BaseService implements QuotationServiceInterface
{
  public function __construct(
    protected QuotationRepositoryInterface $repository,
    protected ReferenceNumberGeneratorInterface $referenceGenerator,
    protected NotificationDispatcherInterface $notificationDispatcher,
    protected ProcurementService $procurementService
  ) {
    parent::__construct();
  }

  public function createQuotationRequest(QuotationDTO $dto): QuotationRequest
  {
    $requisition = Requisition::find($dto->requisitionId);

    if (!$requisition) {
      throw QuotationException::requisitionNotFound($dto->requisitionId);
    }

    // Auto-start procurement if not started
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

        // ✅ Auto-update QTN to evaluating when all quotations are verified
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

      return $quotation;
    });
  }

  public function evaluateSupplierQuotation(int $quotationId, int $score, ?string $notes = null): SupplierQuotation
  {
    Log::info('[QuotationService] evaluateSupplierQuotation - START', [
      'quotation_id' => $quotationId,
      'score' => $score,
      'notes' => $notes,
      'user_id' => $this->getCurrentUserId(),
      'timestamp' => now()->toDateTimeString()
    ]);

    try {
      Log::info('[QuotationService] evaluateSupplierQuotation - fetching quotation', [
        'quotation_id' => $quotationId
      ]);

      $quotation = $this->getSupplierQuotation($quotationId);

      Log::info('[QuotationService] evaluateSupplierQuotation - quotation found', [
        'quotation_id' => $quotation->id,
        'quotation_number' => $quotation->quotation_number,
        'current_status' => $quotation->status,
        'current_verification_status' => $quotation->verification_status,
        'supplier_id' => $quotation->supplier_id,
        'qtn_id' => $quotation->quotation_request_id
      ]);

      if ($quotation->status === 'evaluated') {
        Log::warning('[QuotationService] evaluateSupplierQuotation - quotation already evaluated', [
          'quotation_id' => $quotationId,
          'quotation_number' => $quotation->quotation_number,
          'current_status' => $quotation->status
        ]);
        throw QuotationException::quotationAlreadyEvaluated();
      }

      Log::info('[QuotationService] evaluateSupplierQuotation - starting transaction');

      return $this->transaction(function () use ($quotation, $score, $notes) {
        Log::info('[QuotationService] evaluateSupplierQuotation - transaction started');

        // 1. Update the supplier quotation
        Log::info('[QuotationService] evaluateSupplierQuotation - updating supplier quotation', [
          'quotation_id' => $quotation->id,
          'score' => $score,
          'evaluated_by' => $this->getCurrentUserId()
        ]);

        $quotation->update([
          'status' => 'evaluated',
          'evaluated_by' => $this->getCurrentUserId(),
          'evaluated_at' => now(),
          'evaluation_score' => $score,
          'evaluation_notes' => $notes,
        ]);

        Log::info('[QuotationService] evaluateSupplierQuotation - supplier quotation updated', [
          'quotation_id' => $quotation->id,
          'new_status' => 'evaluated',
          'evaluation_score' => $score,
          'evaluated_at' => now()->toDateTimeString()
        ]);

        // 2. Get the QTN/RFQ
        $qtn = $quotation->quotationRequest;
        Log::info('[QuotationService] evaluateSupplierQuotation - QTN details', [
          'qtn_id' => $qtn->id,
          'qtn_number' => $qtn->qtn_number,
          'qtn_status' => $qtn->status,
          'requisition_id' => $qtn->requisition_id
        ]);

        // 3. UPDATE THE QUOTATION REQUEST TABLE
        if ($qtn) {
          // Only update if current status is 'responded' (has responses)
          if ($qtn->status === 'responded') {
            Log::info('[QuotationService] evaluateSupplierQuotation - moving QTN to evaluating', [
              'qtn_id' => $qtn->id,
              'qtn_number' => $qtn->qtn_number,
              'current_status' => $qtn->status,
              'new_status' => 'evaluating',
              'triggered_by' => 'first_quotation_evaluated'
            ]);

            $qtn->update([
              'status' => 'evaluating'
            ]);

            Log::info('[QuotationService] evaluateSupplierQuotation - QTN moved to evaluating', [
              'qtn_id' => $qtn->id,
              'qtn_number' => $qtn->qtn_number,
              'updated_status' => $qtn->refresh()->status
            ]);

            $this->logHistory(
              $qtn->requisition_id,
              'qtn_status_changed',
              'quotation_request',
              $qtn->id,
              ['status' => 'responded'],
              ['status' => 'evaluating'],
              "QTN {$qtn->qtn_number} moved to evaluating"
            );

            Log::info('[QuotationService] evaluateSupplierQuotation - history logged for status change', [
              'qtn_id' => $qtn->id,
              'action' => 'qtn_status_changed'
            ]);
          } else {
            Log::info('[QuotationService] evaluateSupplierQuotation - QTN status unchanged', [
              'qtn_id' => $qtn->id,
              'current_status' => $qtn->status,
              'reason' => 'status is not "responded"'
            ]);
          }

          // ✅ Check if ALL quotations are evaluated, then auto-close
          $allQuotations = $qtn->supplierQuotations()
            ->whereIn('status', ['submitted', 'evaluated'])
            ->get();

          Log::info('[QuotationService] evaluateSupplierQuotation - checking all quotations status', [
            'qtn_id' => $qtn->id,
            'total_quotations' => $allQuotations->count(),
            'quotation_ids' => $allQuotations->pluck('id')->toArray(),
            'statuses' => $allQuotations->pluck('status')->toArray()
          ]);

          $allEvaluated = $allQuotations->every(function ($q) {
            return $q->status === 'evaluated';
          });

          Log::info('[QuotationService] evaluateSupplierQuotation - all evaluated check', [
            'qtn_id' => $qtn->id,
            'all_evaluated' => $allEvaluated,
            'current_qtn_status' => $qtn->status
          ]);

          // If all submitted quotations are evaluated, close the QTN
          if ($allEvaluated && $qtn->status === 'evaluating') {
            Log::info('[QuotationService] evaluateSupplierQuotation - auto-closing QTN', [
              'qtn_id' => $qtn->id,
              'qtn_number' => $qtn->qtn_number,
              'reason' => 'all_quotations_evaluated',
              'total_evaluated' => $allQuotations->count()
            ]);

            $qtn->update([
              'status' => 'closed'
            ]);

            Log::info('[QuotationService] evaluateSupplierQuotation - QTN auto-closed', [
              'qtn_id' => $qtn->id,
              'qtn_number' => $qtn->qtn_number,
              'new_status' => $qtn->refresh()->status
            ]);

            $this->logHistory(
              $qtn->requisition_id,
              'qtn_auto_closed',
              'quotation_request',
              $qtn->id,
              ['status' => 'evaluating'],
              ['status' => 'closed'],
              "All quotations evaluated. QTN {$qtn->qtn_number} auto-closed"
            );

            Log::info('[QuotationService] evaluateSupplierQuotation - history logged for auto-close', [
              'qtn_id' => $qtn->id,
              'action' => 'qtn_auto_closed'
            ]);
          } else {
            Log::info('[QuotationService] evaluateSupplierQuotation - QTN not auto-closed', [
              'qtn_id' => $qtn->id,
              'all_evaluated' => $allEvaluated,
              'qtn_status' => $qtn->status,
              'reason' => $allEvaluated ? 'qtn_status_not_evaluating' : 'not_all_quotations_evaluated'
            ]);
          }
        } else {
          Log::warning('[QuotationService] evaluateSupplierQuotation - no QTN found', [
            'quotation_id' => $quotation->id,
            'quotation_request_id' => $quotation->quotation_request_id
          ]);
        }

        // 4. Log the evaluation
        Log::info('[QuotationService] evaluateSupplierQuotation - logging evaluation history', [
          'quotation_id' => $quotation->id,
          'quotation_number' => $quotation->quotation_number,
          'score' => $score
        ]);

        $this->logHistory(
          $quotation->quotationRequest->requisition_id,
          'quotation_evaluated',
          'supplier_quotation',
          $quotation->id,
          null,
          ['evaluation_score' => $score, 'status' => 'evaluated'],
          "Quotation {$quotation->quotation_number} evaluated with score {$score}%"
        );

        Log::info('[QuotationService] evaluateSupplierQuotation - COMPLETED SUCCESSFULLY', [
          'quotation_id' => $quotation->id,
          'quotation_number' => $quotation->quotation_number,
          'final_status' => $quotation->status,
          'evaluation_score' => $score,
          'qtn_status' => $qtn ? $qtn->refresh()->status : null,
          'timestamp' => now()->toDateTimeString()
        ]);

        return $quotation;
      });
    } catch (QuotationException $e) {
      Log::error('[QuotationService] evaluateSupplierQuotation - QuotationException caught', [
        'quotation_id' => $quotationId,
        'error_message' => $e->getMessage(),
        'error_code' => $e->getCode(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    } catch (\Exception $e) {
      Log::error('[QuotationService] evaluateSupplierQuotation - UNEXPECTED ERROR', [
        'quotation_id' => $quotationId,
        'error_message' => $e->getMessage(),
        'error_file' => $e->getFile(),
        'error_line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
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

    $qtn = $quotation->quotationRequest;
    if ($qtn && !in_array($qtn->status, ['evaluating', 'closed'])) {
        throw new \Exception(
            'RFQ must be in "evaluating" or "closed" status to select a supplier.'
        );
    }

    return $this->transaction(function () use ($requisition, $supplierId, $quotation) {
        // ✅ FIX: Decode metadata if it's a string
        $metadata = $requisition->metadata;
        if (is_string($metadata)) {
            $metadata = json_decode($metadata, true) ?? [];
        } elseif (!is_array($metadata)) {
            $metadata = [];
        }

        // ✅ Build procurement data
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

        // ✅ FIX: Ensure all values are scalar (string/int)
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

        // ✅ FIX: Ensure log data doesn't contain arrays in scalar fields
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

        return $requisition;
    });
}

  public function closeQtn(int $qtnId, ?string $reason = null): QuotationRequest
  {
    $qtn = $this->getQuotationRequest($qtnId);

    // Check if already closed
    if ($qtn->status === 'closed') {
      throw QuotationException::qtnAlreadyClosed();
    }

    // Check if already cancelled
    if ($qtn->status === 'cancelled') {
      throw new \Exception('Cannot close a cancelled QTN.');
    }

    // ✅ Only allow closing from specific statuses
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

  /**
   * Get a system user ID as fallback.
   */
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
  // PDF GENERATION METHODS
  // ============================================================

  protected function generateQtnFilename(QuotationRequest $qtn, string $suffix = ''): string
  {
    $rfqNumber = $qtn->qtn_number ?? 'RFQ-' . str_pad($qtn->id, 5, '0', STR_PAD_LEFT);
    $rfqNumber = str_replace(' ', '-', trim($rfqNumber));
    return $rfqNumber . ($suffix ? '-' . $suffix : '') . '.pdf';
  }

  public function downloadQTNPDF(int $qtnId, string $suffix = ''): \Illuminate\Http\Response
  {
    $qtn = $this->getQuotationRequest($qtnId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateQuotation($qtn);
    $filename = $this->generateQtnFilename($qtn, $suffix);

    return response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => 'attachment; filename="' . $filename . '"',
      'Cache-Control' => 'private, max-age=0, must-revalidate',
      'Pragma' => 'public',
    ]);
  }

  public function streamQTNPDF(int $qtnId, string $suffix = ''): \Illuminate\Http\Response
  {
    $qtn = $this->getQuotationRequest($qtnId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateQuotation($qtn);
    $filename = $this->generateQtnFilename($qtn, $suffix);

    return response($pdfContent, 200, [
      'Content-Type' => 'application/pdf',
      'Content-Disposition' => 'inline; filename="' . $filename . '"',
    ]);
  }

  public function saveQTNPDF(int $qtnId, string $suffix = ''): string
  {
    $qtn = $this->getQuotationRequest($qtnId);
    $pdfGenerator = app(PdfGenerator::class);
    $pdfContent = $pdfGenerator->generateQuotation($qtn);
    $filename = $this->generateQtnFilename($qtn, $suffix);
    $path = "procurement/qtns/" . date('Y/m/d/');

    return $pdfGenerator->savePdf($pdfContent, $filename, $path);
  }

  public function generateQTNPDFContent(int $qtnId): string
  {
    $qtn = $this->getQuotationRequest($qtnId);
    $pdfGenerator = app(PdfGenerator::class);
    return $pdfGenerator->generateQuotation($qtn);
  }

  public function downloadVerifiedQTNPDF(int $qtnId): \Illuminate\Http\Response
  {
    return $this->downloadQTNPDF($qtnId, 'verified');
  }

  public function downloadDraftQTNPDF(int $qtnId): \Illuminate\Http\Response
  {
    return $this->downloadQTNPDF($qtnId, 'draft');
  }
}
