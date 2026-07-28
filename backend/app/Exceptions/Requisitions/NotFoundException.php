<?php
// app/Exceptions/Requisitions/NotFoundException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when a resource is not found
 *
 * Used for:
 * - Resource not found in database
 * - Record doesn't exist
 * - Invalid ID references
 */
class NotFoundException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'NOT_FOUND';

  /**
   * Create a new not found exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'Resource not found',
    int $code = 404,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for requisition not found
   *
   * @param int $id
   * @return self
   */
  public static function requisition(int $id): self
  {
    return new self(
      "Requisition #{$id} not found",
      404,
      null,
      ['requisition_id' => $id]
    );
  }

  /**
   * Create exception for item not found
   *
   * @param int $id
   * @return self
   */
  public static function item(int $id): self
  {
    return new self(
      "Requisition item #{$id} not found",
      404,
      null,
      ['item_id' => $id]
    );
  }

  /**
   * Create exception for approval not found
   *
   * @param int $id
   * @return self
   */
  public static function approval(int $id): self
  {
    return new self(
      "Approval #{$id} not found",
      404,
      null,
      ['approval_id' => $id]
    );
  }

  /**
   * Create exception for workflow not found
   *
   * @param int $id
   * @return self
   */
  public static function workflow(int $id): self
  {
    return new self(
      "Approval workflow #{$id} not found",
      404,
      null,
      ['workflow_id' => $id]
    );
  }

  /**
   * Create exception for budget not found
   *
   * @param string $code
   * @return self
   */
  public static function budget(string $code): self
  {
    return new self(
      "Budget with code '{$code}' not found",
      404,
      null,
      ['budget_code' => $code]
    );
  }

  /**
   * Create exception for revision not found
   *
   * @param int $id
   * @return self
   */
  public static function revision(int $id): self
  {
    return new self(
      "Revision #{$id} not found",
      404,
      null,
      ['revision_id' => $id]
    );
  }

  /**
   * Create exception for template not found
   *
   * @param int $id
   * @return self
   */
  public static function template(int $id): self
  {
    return new self(
      "Requisition template #{$id} not found",
      404,
      null,
      ['template_id' => $id]
    );
  }

  /**
   * Create exception for user not found
   *
   * @param int $id
   * @return self
   */
  public static function user(int $id): self
  {
    return new self(
      "User #{$id} not found",
      404,
      null,
      ['user_id' => $id]
    );
  }

  /**
   * Create exception for department not found
   *
   * @param int $id
   * @return self
   */
  public static function department(int $id): self
  {
    return new self(
      "Department #{$id} not found",
      404,
      null,
      ['department_id' => $id]
    );
  }

  /**
   * Create exception for supplier not found
   *
   * @param int $id
   * @return self
   */
  public static function supplier(int $id): self
  {
    return new self(
      "Supplier #{$id} not found",
      404,
      null,
      ['supplier_id' => $id]
    );
  }
}
