<?php
// app/Exceptions/Requisitions/DuplicateException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when duplicate records are detected
 *
 * Used for:
 * - Duplicate entries
 * - Unique constraint violations
 * - Duplicate workflow names
 * - Duplicate budget codes
 */
class DuplicateException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'DUPLICATE_ERROR';

  /**
   * Create a new duplicate exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'Duplicate record detected',
    int $code = 409,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for duplicate reference number
   *
   * @param string $referenceNumber
   * @return self
   */
  public static function referenceNumber(string $referenceNumber): self
  {
    return new self(
      "Requisition with reference number '{$referenceNumber}' already exists",
      409,
      null,
      ['reference_number' => $referenceNumber]
    );
  }

  /**
   * Create exception for duplicate budget code
   *
   * @param string $budgetCode
   * @return self
   */
  public static function budgetCode(string $budgetCode): self
  {
    return new self(
      "Budget with code '{$budgetCode}' already exists",
      409,
      null,
      ['budget_code' => $budgetCode]
    );
  }

  /**
   * Create exception for duplicate workflow name
   *
   * @param string $name
   * @param int $departmentId
   * @return self
   */
  public static function workflowName(string $name, int $departmentId): self
  {
    return new self(
      "Workflow '{$name}' already exists for department #{$departmentId}",
      409,
      null,
      ['name' => $name, 'department_id' => $departmentId]
    );
  }

  /**
   * Create exception for duplicate item
   *
   * @param string $itemName
   * @param int $requisitionId
   * @return self
   */
  public static function item(string $itemName, int $requisitionId): self
  {
    return new self(
      "Item '{$itemName}' already exists in requisition #{$requisitionId}",
      409,
      null,
      ['item_name' => $itemName, 'requisition_id' => $requisitionId]
    );
  }

  /**
   * Create exception for duplicate email
   *
   * @param string $email
   * @param string $resource
   * @return self
   */
  public static function email(string $email, string $resource): self
  {
    return new self(
      "Email '{$email}' already exists in {$resource}",
      409,
      null,
      ['email' => $email, 'resource' => $resource]
    );
  }

  /**
   * Create exception for duplicate code
   *
   * @param string $code
   * @param string $resource
   * @return self
   */
  public static function code(string $code, string $resource): self
  {
    return new self(
      "Code '{$code}' already exists in {$resource}",
      409,
      null,
      ['code' => $code, 'resource' => $resource]
    );
  }
}
