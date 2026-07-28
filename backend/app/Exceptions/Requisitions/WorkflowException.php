<?php
// app/Exceptions/Requisitions/WorkflowException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when workflow operations fail
 *
 * Used for:
 * - Workflow configuration errors
 * - Invalid workflow assignments
 * - Workflow validation failures
 * - Workflow activation/deactivation errors
 */
class WorkflowException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'WORKFLOW_ERROR';

  /**
   * Create a new workflow exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'An error occurred with the approval workflow',
    int $code = 400,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for workflow not found
   *
   * @param int $workflowId
   * @return self
   */
  public static function notFound(int $workflowId): self
  {
    return new self(
      "Workflow #{$workflowId} not found",
      404,
      null,
      ['workflow_id' => $workflowId]
    );
  }

  /**
   * Create exception for invalid workflow configuration
   *
   * @param array $errors
   * @return self
   */
  public static function invalidConfiguration(array $errors): self
  {
    return new self(
      "Invalid workflow configuration",
      400,
      null,
      ['errors' => $errors]
    );
  }

  /**
   * Create exception for missing approval levels
   *
   * @param int $workflowId
   * @return self
   */
  public static function missingLevels(int $workflowId): self
  {
    return new self(
      "Workflow #{$workflowId} has no approval levels configured",
      400,
      null,
      ['workflow_id' => $workflowId]
    );
  }

  /**
   * Create exception for invalid default workflow
   *
   * @param int $departmentId
   * @return self
   */
  public static function invalidDefault(int $departmentId): self
  {
    return new self(
      "Cannot set default workflow for department #{$departmentId}: default already exists",
      400,
      null,
      ['department_id' => $departmentId]
    );
  }

  /**
   * Create exception for workflow in use
   *
   * @param int $workflowId
   * @param int $usageCount
   * @return self
   */
  public static function workflowInUse(int $workflowId, int $usageCount): self
  {
    return new self(
      "Workflow #{$workflowId} is currently in use by {$usageCount} requisitions and cannot be modified",
      400,
      null,
      ['workflow_id' => $workflowId, 'usage_count' => $usageCount]
    );
  }

  /**
   * Create exception for duplicate workflow name
   *
   * @param string $name
   * @param int $departmentId
   * @return self
   */
  public static function duplicateName(string $name, int $departmentId): self
  {
    return new self(
      "Workflow '{$name}' already exists for department #{$departmentId}",
      409,
      null,
      ['name' => $name, 'department_id' => $departmentId]
    );
  }

  /**
   * Create exception for threshold conflict
   *
   * @param string $level
   * @param float $amount
   * @param float $threshold
   * @return self
   */
  public static function thresholdConflict(string $level, float $amount, float $threshold): self
  {
    return new self(
      "Amount {$amount} exceeds the {$threshold} threshold for '{$level}' approval",
      400,
      null,
      ['level' => $level, 'amount' => $amount, 'threshold' => $threshold]
    );
  }
}
