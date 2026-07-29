<?php
// app/Services/Procurement/Contracts/Validators/ProcurementValidatorInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Validators;

interface ProcurementValidatorInterface
{
  /**
   * Validate Quotation Request data.
   */
  public function validateQuotationRequest(array $data): array;

  /**
   * Validate Supplier Quotation data.
   */
  public function validateSupplierQuotation(array $data): array;

  /**
   * Validate Purchase Order data.
   */
  public function validatePurchaseOrder(array $data): array;

  /**
   * Validate Goods Received data.
   */
  public function validateGoodsReceived(array $data): array;

  /**
   * Validate Invoice data.
   */
  public function validateInvoice(array $data): array;

  /**
   * Validate Payment data.
   */
  public function validatePayment(array $data): array;

  /**
   * Validate Contract data.
   */
  public function validateContract(array $data): array;

  /**
   * Validate Tender data.
   */
  public function validateTender(array $data): array;

  /**
   * Validate Approval data.
   */
  public function validateApproval(array $data): array;

  /**
   * Validate a requisition for procurement.
   */
  public function validateRequisitionForProcurement(array $data): array;

  /**
   * Validate supplier selection.
   */
  public function validateSupplierSelection(array $data): array;

  /**
   * Validate three-way matching.
   */
  public function validateThreeWayMatching(array $data): array;

  /**
   * Validate approval workflow.
   */
  public function validateApprovalWorkflow(array $data): array;

  /**
   * Validate reference number format.
   */
  public function validateReferenceNumber(string $number, string $type): bool;

  /**
   * Validate date range.
   */
  public function validateDateRange(array $data): array;

  /**
   * Validate amount limits.
   */
  public function validateAmountLimits(array $data): array;

  /**
   * Validate supplier blacklist status.
   */
  public function validateSupplierBlacklist(int $supplierId): void;

  /**
   * Validate budget availability.
   */
  public function validateBudgetAvailability(int $requisitionId): array;

  /**
   * Get validation rules for a specific type.
   */
  public function getValidationRules(string $type): array;

  /**
   * Get validation messages.
   */
  public function getValidationMessages(): array;

  /**
   * Add custom validation rule.
   */
  public function addValidationRule(string $name, callable $rule): void;

  /**
   * Remove validation rule.
   */
  public function removeValidationRule(string $name): void;
}
