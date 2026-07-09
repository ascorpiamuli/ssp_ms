<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

trait ApiResponseTrait
{
  /**
   * Send a success response.
   *
   * @param mixed $data
   * @param string $message
   * @param int $status
   * @param array $headers
   * @return JsonResponse
   */
  protected function success(
    $data = null,
    string $message = 'Success',
    int $status = Response::HTTP_OK,
    array $headers = []
  ): JsonResponse {
    $response = [
      'success' => true,
      'message' => $message,
    ];

    if (!is_null($data)) {
      $response['data'] = $data;
    }

    return response()->json($response, $status, $headers);
  }

  /**
   * Send an error response.
   *
   * @param string $message
   * @param int $status
   * @param mixed $errors
   * @param array $headers
   * @return JsonResponse
   */
  protected function error(
    string $message = 'An error occurred',
    int $status = Response::HTTP_BAD_REQUEST,
    $errors = null,
    array $headers = []
  ): JsonResponse {
    $response = [
      'success' => false,
      'message' => $message,
    ];

    if (!is_null($errors)) {
      $response['errors'] = $errors;
    }

    return response()->json($response, $status, $headers);
  }

  /**
   * Send a validation error response.
   *
   * @param ValidationException $e
   * @return JsonResponse
   */
  protected function validationError(ValidationException $e): JsonResponse
  {
    return $this->error(
      'Validation failed',
      Response::HTTP_UNPROCESSABLE_ENTITY,
      $e->errors()
    );
  }

  /**
   * Send a not found response.
   *
   * @param string $message
   * @return JsonResponse
   */
  protected function notFound(string $message = 'Resource not found'): JsonResponse
  {
    return $this->error($message, Response::HTTP_NOT_FOUND);
  }

  /**
   * Send an unauthorized response.
   *
   * @param string $message
   * @return JsonResponse
   */
  protected function unauthorized(string $message = 'Unauthorized'): JsonResponse
  {
    return $this->error($message, Response::HTTP_UNAUTHORIZED);
  }

  /**
   * Send a forbidden response.
   *
   * @param string $message
   * @return JsonResponse
   */
  protected function forbidden(string $message = 'Forbidden'): JsonResponse
  {
    return $this->error($message, Response::HTTP_FORBIDDEN);
  }

  /**
   * Send a created response.
   *
   * @param mixed $data
   * @param string $message
   * @return JsonResponse
   */
  protected function created($data = null, string $message = 'Resource created successfully'): JsonResponse
  {
    return $this->success($data, $message, Response::HTTP_CREATED);
  }

  /**
   * Send a no content response.
   *
   * @return JsonResponse
   */
  protected function noContent(): JsonResponse
  {
    return response()->json(null, Response::HTTP_NO_CONTENT);
  }

  /**
   * Send a paginated response.
   *
   * @param mixed $data
   * @param array $pagination
   * @param string $message
   * @return JsonResponse
   */
  protected function paginated($data, array $pagination, string $message = 'Data retrieved successfully'): JsonResponse
  {
    return $this->success([
      'items' => $data,
      'pagination' => $pagination,
    ], $message);
  }
}
