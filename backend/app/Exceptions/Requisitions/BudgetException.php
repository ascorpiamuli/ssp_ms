<?php
// app/Exceptions/Requisitions/BudgetException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when budget operations fail
 *
 * Used for:
 * - Insufficient budget
 * - Budget verification failures
 * - Budget allocation errors
 * - Budget validation errors
 */
class BudgetException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'BUDGET_ERROR';

  /**
   * Create a new budget exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'An error occurred with the budget',
    int $code = 400,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for insufficient budget
   *
   * @param string $budgetCode
   * @param float $available
   * @param float $requested
   * @return self
   */
  public static function insufficientBudget(string $budgetCode, float $available, float $requested): self
  {
    return new self(
      "Insufficient budget for code '{$budgetCode}'. Available: {$available}, Requested: {$requested}",
      400,
      null,
      ['budget_code' => $budgetCode, 'available' => $available, 'requested' => $requested]
    );
  }

  /**
   * Create exception for budget not found
   *
   * @param string $budgetCode
   * @return self
   */
  public static function notFound(string $budgetCode): self
  {
    return new self(
      "Budget with code '{$budgetCode}' not found",
      404,
      null,
      ['budget_code' => $budgetCode]
    );
  }

  /**
   * Create exception for invalid budget state
   *
   * @param string $budgetCode
   * @param string $currentStatus
   * @param string $requiredStatus
   * @return self
   */
  public static function invalidState(string $budgetCode, string $currentStatus, string $requiredStatus): self
  {
    return new self(
      "Budget '{$budgetCode}' is in '{$currentStatus}' state. Expected '{$requiredStatus}'",
      400,
      null,
      ['budget_code' => $budgetCode, 'current_status' => $currentStatus, 'required_status' => $requiredStatus]
    );
  }

  /**
   * Create exception for budget exhausted
   *
   * @param string $budgetCode
   * @return self
   */
  public static function exhausted(string $budgetCode): self
  {
    return new self(
      "Budget '{$budgetCode}' is exhausted",
      400,
      null,
      ['budget_code' => $budgetCode]
    );
  }

  /**
   * Create exception for budget verification failure
   *
   * @param string $budgetCode
   * @param string $reason
   * @return self
   */
  public static function verificationFailed(string $budgetCode, string $reason): self
  {
    return new self(
      "Budget verification failed for '{$budgetCode}': {$reason}",
      400,
      null,
      ['budget_code' => $budgetCode, 'reason' => $reason]
    );
  }

  /**
   * Create exception for duplicate budget
   *
   * @param int $requisitionId
   * @return self
   */
  public static function duplicateBudget(int $requisitionId): self
  {
    return new self(
      "Budget already exists for requisition #{$requisitionId}",
      409,
      null,
      ['requisition_id' => $requisitionId]
    );
  }

  /**
   * Create exception for fiscal year mismatch
   *
   * @param string $budgetFiscalYear
   * @param string $requisitionFiscalYear
   * @return self
   */
  public static function fiscalYearMismatch(string $budgetFiscalYear, string $requisitionFiscalYear): self
  {
    return new self(
      "Budget fiscal year '{$budgetFiscalYear}' does not match requisition fiscal year '{$requisitionFiscalYear}'",
      400,
      null,
      ['budget_fiscal_year' => $budgetFiscalYear, 'requisition_fiscal_year' => $requisitionFiscalYear]
    );
  }
}
