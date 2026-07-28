<?php
// app/Exceptions/Requisitions/ConstraintViolationException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when database constraints are violated
 *
 * Used for:
 * - Foreign key constraint violations
 * - Integrity constraint violations
 * - Business rule violations
 * - Relationship constraints
 */
class ConstraintViolationException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'CONSTRAINT_VIOLATION';

  /**
   * Create a new constraint violation exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'Constraint violation occurred',
    int $code = 409,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for foreign key violation
   *
   * @param string $table
   * @param string $column
   * @param mixed $value
   * @return self
   */
  public static function foreignKey(string $table, string $column, mixed $value): self
  {
    return new self(
      "Foreign key constraint violation on {$table}.{$column} with value '{$value}'",
      409,
      null,
      ['table' => $table, 'column' => $column, 'value' => $value]
    );
  }

  /**
   * Create exception for unique constraint violation
   *
   * @param string $table
   * @param string $column
   * @param mixed $value
   * @return self
   */
  public static function unique(string $table, string $column, mixed $value): self
  {
    return new self(
      "Unique constraint violation on {$table}.{$column} with value '{$value}'",
      409,
      null,
      ['table' => $table, 'column' => $column, 'value' => $value]
    );
  }

  /**
   * Create exception for delete constraint
   *
   * @param string $resource
   * @param int $id
   * @param string $dependentResource
   * @param int $dependentCount
   * @return self
   */
  public static function deleteConstraint(string $resource, int $id, string $dependentResource, int $dependentCount): self
  {
    return new self(
      "Cannot delete {$resource} #{$id} because it has {$dependentCount} related {$dependentResource} records",
      409,
      null,
      [
        'resource' => $resource,
        'id' => $id,
        'dependent_resource' => $dependentResource,
        'dependent_count' => $dependentCount
      ]
    );
  }

  /**
   * Create exception for relationship constraint
   *
   * @param string $relationship
   * @param int $id
   * @param string $message
   * @return self
   */
  public static function relationship(string $relationship, int $id, string $message): self
  {
    return new self(
      "Relationship constraint failed for {$relationship} #{$id}: {$message}",
      409,
      null,
      ['relationship' => $relationship, 'id' => $id, 'message' => $message]
    );
  }

  /**
   * Create exception for business rule violation
   *
   * @param string $rule
   * @param array $context
   * @return self
   */
  public static function businessRule(string $rule, array $context = []): self
  {
    return new self(
      "Business rule violation: {$rule}",
      409,
      null,
      array_merge(['rule' => $rule], $context)
    );
  }

  /**
   * Create exception for integrity constraint
   *
   * @param string $table
   * @param array $fields
   * @param string $message
   * @return self
   */
  public static function integrity(string $table, array $fields, string $message): self
  {
    return new self(
      "Integrity constraint violation on {$table}: {$message}",
      409,
      null,
      ['table' => $table, 'fields' => $fields, 'message' => $message]
    );
  }
}
