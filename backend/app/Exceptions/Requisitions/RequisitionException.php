<?php
// app/Exceptions/Requisitions/RequisitionException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

use Exception;

/**
 * Base exception for all requisition-related errors
 *
 * This is the parent exception that all other requisition exceptions extend from.
 * It provides a consistent error handling pattern across the requisition module.
 */
class RequisitionException extends Exception
{
  /**
   * @var array Additional context data
   */
  protected array $context = [];

  /**
   * @var string Error code for client-side handling
   */
  protected string $errorCode = 'REQ_ERROR';

  /**
   * Constructor
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = '',
    int $code = 400,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous);
    $this->context = $context;
  }

  /**
   * Get the context data
   *
   * @return array
   */
  public function getContext(): array
  {
    return $this->context;
  }

  /**
   * Get the error code
   *
   * @return string
   */
  public function getErrorCode(): string
  {
    return $this->errorCode;
  }

  /**
   * Set the error code
   *
   * @param string $errorCode
   * @return self
   */
  public function setErrorCode(string $errorCode): self
  {
    $this->errorCode = $errorCode;
    return $this;
  }

  /**
   * Add context data
   *
   * @param string $key
   * @param mixed $value
   * @return self
   */
  public function addContext(string $key, mixed $value): self
  {
    $this->context[$key] = $value;
    return $this;
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
        'context' => $this->context,
        'file' => $this->getFile(),
        'line' => $this->getLine(),
      ]
    ], $this->getCode() ?: 400);
  }

  /**
   * Report the exception
   *
   * @return void
   */
  public function report(): void
  {
    \Illuminate\Support\Facades\Log::error($this->getMessage(), [
      'exception' => get_class($this),
      'code' => $this->errorCode,
      'context' => $this->context,
      'trace' => $this->getTraceAsString(),
    ]);
  }
}
