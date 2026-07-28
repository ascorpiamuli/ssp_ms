<?php
// app/Exceptions/Requisitions/ApprovalException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when approval operations fail
 *
 * Used for:
 * - Invalid approval actions
 * - Unauthorized approval attempts
 * - Workflow configuration errors
 * - Approval process failures
 */
class ApprovalException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'APPROVAL_ERROR';

  /**
   * Create a new approval exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'An error occurred while processing the approval',
    int $code = 400,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for invalid approval state
   *
   * @param string $level
   * @param string $currentStatus
   * @return self
   */
  public static function invalidState(string $level, string $currentStatus): self
  {
    return new self(
      "Cannot process approval for level '{$level}' as it is already '{$currentStatus}'",
      400,
      null,
      ['level' => $level, 'current_status' => $currentStatus]
    );
  }

  /**
   * Create exception for unauthorized approval
   *
   * @param int $userId
   * @param string $level
   * @return self
   */
  public static function unauthorized(int $userId, string $level): self
  {
    return new self(
      "User #{$userId} is not authorized to approve at level '{$level}'",
      403,
      null,
      ['user_id' => $userId, 'level' => $level]
    );
  }

  /**
   * Create exception for missing workflow
   *
   * @param int $departmentId
   * @param float $amount
   * @return self
   */
  public static function workflowNotFound(int $departmentId, float $amount): self
  {
    return new self(
      "No approval workflow found for department #{$departmentId} with amount {$amount}",
      404,
      null,
      ['department_id' => $departmentId, 'amount' => $amount]
    );
  }

  /**
   * Create exception for missing approver
   *
   * @param string $level
   * @param int $departmentId
   * @return self
   */
  public static function approverNotFound(string $level, int $departmentId): self
  {
    return new self(
      "No approver found for level '{$level}' in department #{$departmentId}",
      404,
      null,
      ['level' => $level, 'department_id' => $departmentId]
    );
  }

  /**
   * Create exception for max revisions exceeded
   *
   * @param int $maxRevisions
   * @return self
   */
  public static function maxRevisionsExceeded(int $maxRevisions): self
  {
    return new self(
      "Maximum revisions ({$maxRevisions}) have been exceeded",
      400,
      null,
      ['max_revisions' => $maxRevisions]
    );
  }

  /**
   * Create exception for invalid approval level
   *
   * @param string $level
   * @param array $validLevels
   * @return self
   */
  public static function invalidLevel(string $level, array $validLevels): self
  {
    return new self(
      "Invalid approval level '{$level}'. Valid levels: " . implode(', ', $validLevels),
      400,
      null,
      ['level' => $level, 'valid_levels' => $validLevels]
    );
  }

  /**
   * Create exception for delegation error
   *
   * @param string $reason
   * @return self
   */
  public static function delegationError(string $reason): self
  {
    return new self(
      "Delegation failed: {$reason}",
      400,
      null,
      ['reason' => $reason]
    );
  }
}
