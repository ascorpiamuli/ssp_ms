<?php
// app/Exceptions/Requisitions/ValidationException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when validation fails
 *
 * Used for:
 * - Data validation errors
 * - Business rule violations
 * - Required field missing
 * - Invalid data format
 */
class ValidationException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'VALIDATION_ERROR';

  /**
   * @var array Validation errors
   */
  protected array $errors = [];

  /**
   * Create a new validation exception
   *
   * @param string $message
   * @param array $errors
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'Validation failed',
    array $errors = [],
    int $code = 422,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
    $this->errors = $errors;
    $this->context['errors'] = $errors;
  }

  /**
   * Get validation errors
   *
   * @return array
   */
  public function getErrors(): array
  {
    return $this->errors;
  }

  /**
   * Create exception from validation errors
   *
   * @param array $errors
   * @return self
   */
  public static function fromErrors(array $errors): self
  {
    $message = 'Validation failed: ' . implode(', ', array_map(function ($key, $value) {
      return "{$key}: " . (is_array($value) ? implode(', ', $value) : $value);
    }, array_keys($errors), $errors));

    return new self($message, $errors);
  }

  /**
   * Create exception for required field
   *
   * @param string $field
   * @return self
   */
  public static function requiredField(string $field): self
  {
    return new self(
      "The field '{$field}' is required",
      [$field => ['The field is required']]
    );
  }

  /**
   * Create exception for invalid field value
   *
   * @param string $field
   * @param string $value
   * @param string $rule
   * @return self
   */
  public static function invalidValue(string $field, string $value, string $rule): self
  {
    return new self(
      "The field '{$field}' has an invalid value",
      [$field => ["The value '{$value}' is invalid for rule '{$rule}'"]]
    );
  }

  /**
   * Create exception for missing relation
   *
   * @param string $relation
   * @param int $id
   * @return self
   */
  public static function missingRelation(string $relation, int $id): self
  {
    return new self(
      "Related {$relation} #{$id} not found",
      [$relation => ["The {$relation} with ID {$id} does not exist"]]
    );
  }

  /**
   * Render the exception as JSON
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function render(): \Illuminate\Http\JsonResponse
  {
    return response()->json([
      'success' => false,
      'error' => [
        'code' => $this->errorCode,
        'message' => $this->getMessage(),
        'errors' => $this->errors,
        'context' => $this->context,
      ]
    ], $this->getCode() ?: 422);
  }
}
