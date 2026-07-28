<?php
// app/Exceptions/Requisitions/RevisionException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when revision operations fail
 *
 * Used for:
 * - Invalid revision requests
 * - Revision approval failures
 * - Revision rejection errors
 * - Revision validation errors
 */
class RevisionException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'REVISION_ERROR';

  /**
   * Create a new revision exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'An error occurred with the revision',
    int $code = 400,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for revision not allowed
   *
   * @param string $currentStatus
   * @return self
   */
  public static function notAllowed(string $currentStatus): self
  {
    return new self(
      "Revision not allowed for requisition in '{$currentStatus}' status",
      400,
      null,
      ['current_status' => $currentStatus]
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
      "Maximum revisions ({$maxRevisions}) exceeded",
      400,
      null,
      ['max_revisions' => $maxRevisions]
    );
  }

  /**
   * Create exception for revision not found
   *
   * @param int $revisionId
   * @return self
   */
  public static function notFound(int $revisionId): self
  {
    return new self(
      "Revision #{$revisionId} not found",
      404,
      null,
      ['revision_id' => $revisionId]
    );
  }

  /**
   * Create exception for revision already processed
   *
   * @param int $revisionId
   * @param string $currentStatus
   * @return self
   */
  public static function alreadyProcessed(int $revisionId, string $currentStatus): self
  {
    return new self(
      "Revision #{$revisionId} has already been processed (status: {$currentStatus})",
      400,
      null,
      ['revision_id' => $revisionId, 'current_status' => $currentStatus]
    );
  }

  /**
   * Create exception for invalid revision data
   *
   * @param array $errors
   * @return self
   */
  public static function invalidData(array $errors): self
  {
    return new self(
      "Invalid revision data provided",
      400,
      null,
      ['errors' => $errors]
    );
  }

  /**
   * Create exception for revision without changes
   *
   * @return self
   */
  public static function noChanges(): self
  {
    return new self(
      "No changes specified in revision",
      400,
      null,
      ['reason' => 'no_changes']
    );
  }

  /**
   * Create exception for revision rejection
   *
   * @param string $reason
   * @return self
   */
  public static function rejectionFailed(string $reason): self
  {
    return new self(
      "Failed to reject revision: {$reason}",
      400,
      null,
      ['reason' => $reason]
    );
  }
}
