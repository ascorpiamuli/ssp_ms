<?php
// app/Exceptions/Requisitions/InvalidStateException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when operation is attempted in invalid state
 *
 * Used for:
 * - Invalid status transitions
 * - Operation not allowed in current state
 * - State machine violations
 */
class InvalidStateException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'INVALID_STATE';

  /**
   * Create a new invalid state exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'Operation not allowed in current state',
    int $code = 400,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for invalid status transition
   *
   * @param string $currentStatus
   * @param string $targetStatus
   * @param array $allowedTransitions
   * @return self
   */
  public static function invalidTransition(string $currentStatus, string $targetStatus, array $allowedTransitions): self
  {
    return new self(
      "Invalid status transition from '{$currentStatus}' to '{$targetStatus}'",
      400,
      null,
      [
        'current_status' => $currentStatus,
        'target_status' => $targetStatus,
        'allowed_transitions' => $allowedTransitions
      ]
    );
  }

  /**
   * Create exception for operation not allowed
   *
   * @param string $operation
   * @param string $currentStatus
   * @return self
   */
  public static function operationNotAllowed(string $operation, string $currentStatus): self
  {
    return new self(
      "Operation '{$operation}' not allowed in '{$currentStatus}' status",
      400,
      null,
      ['operation' => $operation, 'current_status' => $currentStatus]
    );
  }

  /**
   * Create exception for approval level mismatch
   *
   * @param string $expectedLevel
   * @param string $currentLevel
   * @return self
   */
  public static function levelMismatch(string $expectedLevel, string $currentLevel): self
  {
    return new self(
      "Expected approval level '{$expectedLevel}', got '{$currentLevel}'",
      400,
      null,
      ['expected_level' => $expectedLevel, 'current_level' => $currentLevel]
    );
  }

  /**
   * Create exception for requisition already processed
   *
   * @param int $requisitionId
   * @param string $status
   * @return self
   */
  public static function alreadyProcessed(int $requisitionId, string $status): self
  {
    return new self(
      "Requisition #{$requisitionId} is already '{$status}'",
      400,
      null,
      ['requisition_id' => $requisitionId, 'status' => $status]
    );
  }

  /**
   * Create exception for pending operations
   *
   * @param string $resource
   * @param int $id
   * @param string $pendingAction
   * @return self
   */
  public static function pendingOperation(string $resource, int $id, string $pendingAction): self
  {
    return new self(
      "Cannot perform operation because {$resource} #{$id} has pending '{$pendingAction}'",
      400,
      null,
      ['resource' => $resource, 'id' => $id, 'pending_action' => $pendingAction]
    );
  }

  /**
   * Create exception for expired resource
   *
   * @param string $resource
   * @param int $id
   * @param string $expiredAt
   * @return self
   */
  public static function expired(string $resource, int $id, string $expiredAt): self
  {
    return new self(
      "{$resource} #{$id} expired at {$expiredAt}",
      400,
      null,
      ['resource' => $resource, 'id' => $id, 'expired_at' => $expiredAt]
    );
  }
}
