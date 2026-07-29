<?php
// app/Services/Procurement/Validators/ProcurementValidator.php

declare(strict_types=1);

namespace App\Services\Procurement\Validators;

use App\Models\SupplierBlacklist;
use App\Models\Requisition;
use App\Services\Procurement\Contracts\Validators\ProcurementValidatorInterface;
use Illuminate\Support\Facades\Validator;

class ProcurementValidator implements ProcurementValidatorInterface
{
  protected array $rules = [];
  protected array $messages = [];
  protected array $customRules = [];

  public function __construct()
  {
    $this->loadDefaultRules();
    $this->loadDefaultMessages();
  }

  public function validateQuotationRequest(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('quotation_request'));
  }

  public function validateSupplierQuotation(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('supplier_quotation'));
  }

  public function validatePurchaseOrder(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('purchase_order'));
  }

  public function validateGoodsReceived(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('goods_received'));
  }

  public function validateInvoice(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('invoice'));
  }

  public function validatePayment(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('payment'));
  }

  public function validateContract(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('contract'));
  }

  public function validateTender(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('tender'));
  }

  public function validateApproval(array $data): array
  {
    return $this->validateData($data, $this->getValidationRules('approval'));
  }

  public function validateRequisitionForProcurement(array $data): array
  {
    $rules = [
      'requisition_id' => 'required|exists:requisitions,id',
      'user_id' => 'required|exists:users,id',
    ];

    $validated = $this->validateData($data, $rules);

    // Check if requisition exists and is approved
    $requisition = Requisition::find($data['requisition_id']);
    if (!$requisition) {
      throw new \Exception('Requisition not found.');
    }

    if (!$requisition->isApproved()) {
      throw new \Exception('Requisition must be fully approved before procurement can start.');
    }

    if ($requisition->is_procurement_created) {
      throw new \Exception('Procurement has already been initiated for this requisition.');
    }

    if ($requisition->status === 'cancelled') {
      throw new \Exception('Cannot start procurement for a cancelled requisition.');
    }

    return $validated;
  }

  public function validateSupplierSelection(array $data): array
  {
    $rules = [
      'requisition_id' => 'required|exists:requisitions,id',
      'supplier_id' => 'required|exists:users,id',
      'quotation_id' => 'required|exists:supplier_quotations,id',
    ];

    $validated = $this->validateData($data, $rules);

    // Check if supplier is blacklisted
    $this->validateSupplierBlacklist($data['supplier_id']);

    // Check if quotation belongs to supplier
    $quotation = \App\Models\SupplierQuotation::find($data['quotation_id']);
    if (!$quotation || $quotation->supplier_id !== $data['supplier_id']) {
      throw new \Exception('Quotation does not belong to the selected supplier.');
    }

    return $validated;
  }

  public function validateThreeWayMatching(array $data): array
  {
    $rules = [
      'invoice_id' => 'required|exists:invoices,id',
    ];

    $validated = $this->validateData($data, $rules);

    // Check if invoice has PO and GRN
    $invoice = \App\Models\Invoice::with(['purchaseOrder', 'goodsReceivedNote'])->find($data['invoice_id']);
    if (!$invoice) {
      throw new \Exception('Invoice not found.');
    }

    if (!$invoice->purchaseOrder) {
      throw new \Exception('No purchase order found for three-way matching.');
    }

    if (!$invoice->goodsReceivedNote) {
      throw new \Exception('No GRN found for three-way matching.');
    }

    return $validated;
  }

  public function validateApprovalWorkflow(array $data): array
  {
    $rules = [
      'entity_id' => 'required|integer',
      'entity_type' => 'required|string',
      'level' => 'required|string|in:hod,accountant,principal,final,diocesan_accountant,procurement',
      'approver_id' => 'required|exists:users,id',
    ];

    return $this->validateData($data, $rules);
  }

  public function validateReferenceNumber(string $number, string $type): bool
  {
    $pattern = $this->getReferencePattern($type);
    return preg_match($pattern, $number) === 1;
  }

  public function validateDateRange(array $data): array
  {
    $rules = [
      'start_date' => 'required|date',
      'end_date' => 'required|date|after_or_equal:start_date',
    ];

    return $this->validateData($data, $rules);
  }

  public function validateAmountLimits(array $data): array
  {
    $rules = [
      'amount' => 'required|numeric|min:0|max:999999999.99',
    ];

    return $this->validateData($data, $rules);
  }

  public function validateSupplierBlacklist(int $supplierId): void
  {
    if (SupplierBlacklist::isBlacklisted($supplierId)) {
      throw new \Exception('Supplier is blacklisted and cannot participate in procurement.');
    }
  }

  public function validateBudgetAvailability(int $requisitionId): array
  {
    $requisition = Requisition::find($requisitionId);
    if (!$requisition) {
      throw new \Exception('Requisition not found.');
    }

    $available = true;
    $message = 'Budget is available.';

    if ($requisition->budget_allocated && $requisition->total_amount > $requisition->budget_allocated) {
      $available = false;
      $message = 'Requisition amount exceeds allocated budget.';
    }

    return [
      'available' => $available,
      'message' => $message,
      'allocated' => $requisition->budget_allocated,
      'required' => $requisition->total_amount,
      'balance' => $requisition->budget_allocated ? $requisition->budget_allocated - $requisition->total_amount : null,
    ];
  }

  public function getValidationRules(string $type): array
  {
    return $this->rules[$type] ?? [];
  }

  public function getValidationMessages(): array
  {
    return $this->messages;
  }

  public function addValidationRule(string $name, callable $rule): void
  {
    $this->customRules[$name] = $rule;
  }

  public function removeValidationRule(string $name): void
  {
    unset($this->customRules[$name]);
  }

  /**
   * Validate data against rules.
   */
  protected function validateData(array $data, array $rules): array
  {
    $validator = Validator::make($data, $rules, $this->messages);

    // Add custom rules
    foreach ($this->customRules as $name => $rule) {
      $validator->addExtension($name, $rule);
    }

    if ($validator->fails()) {
      throw new \Exception(json_encode($validator->errors()->toArray()));
    }

    return $validator->validated();
  }

  /**
   * Load default validation rules.
   */
  protected function loadDefaultRules(): void
  {
    $this->rules = [
      'quotation_request' => [
        'requisition_id' => 'required|exists:requisitions,id',
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
        'issue_date' => 'required|date',
        'closing_date' => 'required|date|after_or_equal:issue_date',
        'supplier_ids' => 'required|array|min:1',
        'supplier_ids.*' => 'exists:users,id',
      ],
      'supplier_quotation' => [
        'quotation_request_id' => 'required|exists:quotation_requests,id',
        'supplier_id' => 'required|exists:users,id',
        'items' => 'required|array|min:1',
        'items.*.requisition_item_id' => 'required|exists:requisition_items,id',
        'items.*.item_name' => 'required|string|max:255',
        'items.*.quantity' => 'required|numeric|min:0.01',
        'items.*.unit_price' => 'required|numeric|min:0',
      ],
      'purchase_order' => [
        'requisition_id' => 'required|exists:requisitions,id',
        'type' => 'required|in:lpo,lso',
        'title' => 'required|string|max:255',
        'expected_delivery_date' => 'required|date|after:today',
        'items' => 'required|array|min:1',
      ],
      'goods_received' => [
        'purchase_order_id' => 'required|exists:purchase_orders,id',
        'type' => 'required|in:grn,san',
        'received_date' => 'required|date',
        'items' => 'required|array|min:1',
      ],
      'invoice' => [
        'purchase_order_id' => 'required|exists:purchase_orders,id',
        'supplier_id' => 'required|exists:users,id',
        'customer_invoice_no' => 'required|string|max:100',
        'invoice_date' => 'required|date',
        'due_date' => 'required|date|after_or_equal:invoice_date',
        'items' => 'required|array|min:1',
      ],
      'payment' => [
        'invoice_id' => 'required|exists:invoices,id',
        'payee_name' => 'required|string|max:200',
        'payment_method' => 'required|in:cheque,bank_transfer,cash,mobile_money',
      ],
      'contract' => [
        'requisition_id' => 'required|exists:requisitions,id',
        'supplier_id' => 'required|exists:users,id',
        'title' => 'required|string|max:255',
        'start_date' => 'required|date',
        'end_date' => 'required|date|after:start_date',
        'contract_value' => 'required|numeric|min:0',
      ],
      'tender' => [
        'requisition_id' => 'required|exists:requisitions,id',
        'title' => 'required|string|max:255',
        'closing_date' => 'required|date|after:today',
      ],
      'approval' => [
        'entity_id' => 'required|integer',
        'entity_type' => 'required|string',
        'level' => 'required|in:hod,accountant,principal,final,diocesan_accountant,procurement',
        'approver_id' => 'required|exists:users,id',
      ],
    ];
  }

  /**
   * Load default validation messages.
   */
  protected function loadDefaultMessages(): void
  {
    $this->messages = [
      'required' => 'The :attribute field is required.',
      'exists' => 'The selected :attribute is invalid.',
      'min' => 'The :attribute must be at least :min.',
      'max' => 'The :attribute may not be greater than :max.',
      'date' => 'The :attribute must be a valid date.',
      'after' => 'The :attribute must be after :date.',
      'after_or_equal' => 'The :attribute must be after or equal to :date.',
      'in' => 'The selected :attribute is invalid.',
      'array' => 'The :attribute must be an array.',
      'numeric' => 'The :attribute must be a number.',
      'string' => 'The :attribute must be a string.',
    ];
  }

  /**
   * Get reference number pattern.
   */
  protected function getReferencePattern(string $type): string
  {
    $patterns = [
      'QTN' => '/^QTN-\d{4}-\d{5}$/',
      'SQ' => '/^SQ-\d{4}-\d{5}$/',
      'LPO' => '/^LPO-\d{4}-\d{5}$/',
      'LSO' => '/^LSO-\d{4}-\d{5}$/',
      'GRN' => '/^GRN-\d{4}-\d{5}$/',
      'SAN' => '/^SAN-\d{4}-\d{5}$/',
      'INV' => '/^INV-\d{4}-\d{5}$/',
      'PV' => '/^PV-\d{4}-\d{5}$/',
      'CHQ' => '/^CHQ-\d{4}-\d{5}$/',
      'CTR' => '/^CTR-\d{4}-\d{5}$/',
      'TND' => '/^TND-\d{4}-\d{5}$/',
    ];

    return $patterns[$type] ?? '/^[A-Z]+-\d{4}-\d{5}$/';
  }
}
