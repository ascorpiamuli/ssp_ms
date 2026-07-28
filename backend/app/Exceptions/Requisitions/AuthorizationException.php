<?php
// app/Exceptions/Requisitions/AuthorizationException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when authorization fails
 *
 * Used for:
 * - Unauthorized access attempts
 * - Insufficient permissions
 * - Role-based access violations
 * - Ownership verification failures
 */
class AuthorizationException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'AUTHORIZATION_ERROR';

  /**
   * Create a new authorization exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'You are not authorized to perform this action',
    int $code = 403,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for missing permission
   *
   * @param string $permission
   * @return self
   */
  public static function missingPermission(string $permission): self
  {
    return new self(
      "You do not have the required permission: '{$permission}'",
      403,
      null,
      ['permission' => $permission]
    );
  }

  /**
   * Create exception for unauthorized requisition access
   *
   * @param int $userId
   * @param int $requisitionId
   * @return self
   */
  public static function requisitionAccess(int $userId, int $requisitionId): self
  {
    return new self(
      "User #{$userId} does not have access to requisition #{$requisitionId}",
      403,
      null,
      ['user_id' => $userId, 'requisition_id' => $requisitionId]
    );
  }

  /**
   * Create exception for unauthorized approval
   *
   * @param int $userId
   * @param string $level
   * @return self
   */
  public static function approvalAccess(int $userId, string $level): self
  {
    return new self(
      "User #{$userId} is not authorized to approve at '{$level}' level",
      403,
      null,
      ['user_id' => $userId, 'level' => $level]
    );
  }

  /**
   * Create exception for missing role
   *
   * @param array $requiredRoles
   * @return self
   */
  public static function missingRole(array $requiredRoles): self
  {
    return new self(
      "You must have one of the following roles: " . implode(', ', $requiredRoles),
      403,
      null,
      ['required_roles' => $requiredRoles]
    );
  }

  /**
   * Create exception for department access violation
   *
   * @param int $userId
   * @param int $departmentId
   * @return self
   */
  public static function departmentAccess(int $userId, int $departmentId): self
  {
    return new self(
      "User #{$userId} does not belong to department #{$departmentId}",
      403,
      null,
      ['user_id' => $userId, 'department_id' => $departmentId]
    );
  }

  /**
   * Create exception for ownership violation
   *
   * @param int $userId
   * @param string $resource
   * @param int $resourceId
   * @return self
   */
  public static function notOwner(int $userId, string $resource, int $resourceId): self
  {
    return new self(
      "User #{$userId} is not the owner of {$resource} #{$resourceId}",
      403,
      null,
      ['user_id' => $userId, 'resource' => $resource, 'resource_id' => $resourceId]
    );
  }
}
