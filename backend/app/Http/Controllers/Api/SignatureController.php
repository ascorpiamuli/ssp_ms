<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Signature\UploadSignatureRequest;
use App\Http\Requests\Signature\VerifySignatureRequest;
use App\Http\Requests\Signature\VerifySignatureQRRequest;
use App\Http\Resources\Signature\SignatureResource;
use App\Http\Resources\Signature\SignatureVerificationResource;
use App\Http\Resources\Signature\SignatureStatusResource;
use App\Models\SignatureSpecimen;
use App\Services\Signatures\Contracts\Services\SignatureServiceInterface;
use App\Services\Signatures\Exceptions\SignatureNotFoundException;
use App\Services\Signatures\Exceptions\SignatureAlreadyVerifiedException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class SignatureController extends Controller
{
  protected SignatureServiceInterface $signatureService;

  public function __construct(SignatureServiceInterface $signatureService)
  {
    $this->signatureService = $signatureService;
  }

  /**
   * Upload a signature specimen
   */
  public function upload(UploadSignatureRequest $request): JsonResponse
  {
    $user = $request->user();
    $file = $request->file('signature');

    $specimen = $this->signatureService->uploadSignature(
      $user,
      $file,
      $request->ip(),
      $request->userAgent()
    );

    return response()->json([
      'success' => true,
      'message' => 'Signature uploaded successfully. Awaiting verification.',
      'data' => new SignatureResource($specimen),
    ], 201);
  }

  /**
   * Verify a signature specimen (Admin/Manual verification)
   */
  public function verify(VerifySignatureRequest $request, int $specimenId): JsonResponse
  {
    try {
      $verifier = $request->user();

      $verified = $this->signatureService->verifySignature(
        $specimenId,
        $verifier,
        $request->input('notes'),
        $request->ip(),
        $request->userAgent()
      );

      $qr = $this->signatureService->getSignatureQR($specimenId);

      return response()->json([
        'success' => true,
        'message' => 'Signature verified successfully',
        'data' => [
          'specimen' => new SignatureResource($verified),
          'qr_code' => $qr,
        ],
      ]);
    } catch (SignatureNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Signature specimen not found. It may have been deleted.',
      ], 404);
    } catch (SignatureAlreadyVerifiedException $e) {
      $qr = $this->signatureService->getSignatureQR($specimenId);
      return response()->json([
        'success' => true,
        'message' => 'Signature was already verified',
        'data' => [
          'qr_code' => $qr,
        ],
      ], 200);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to verify signature: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Verify signature via QR Code (Legacy JSON payload scanning)
   */
  public function verifyByQR(VerifySignatureQRRequest $request): JsonResponse
  {
    $verifier = $request->user();
    $qrData = $request->input('qr_data');

    $result = $this->signatureService->verifySignatureByQR(
      $qrData,
      $verifier,
      $request->ip(),
      $request->userAgent()
    );

    return response()->json([
      'success' => true,
      'message' => 'Signature verified via QR Code',
      'data' => $result,
    ]);
  }

  /**
   * NEW: Verify signature by Secure Token (For the clean QR URL flow)
   * This is a PUBLIC endpoint - no authentication required
   */
  public function verifyByToken(Request $request, string $token): JsonResponse
  {
    Log::info('🔍 [verifyByToken] Starting token lookup', [
      'token_received' => $token
    ]);

    try {
      // Look up the specimen using the query builder correctly
      $specimen = SignatureSpecimen::query()
        ->where('qr_verification_token', $token)
        ->with(['user', 'verifiedBy'])
        ->first();

      Log::info('🔍 [verifyByToken] Database query result', [
        'found' => $specimen !== null,
        'specimen_id' => $specimen?->id,
        'user_id' => $specimen?->user_id,
        'token_in_db' => $specimen?->qr_verification_token,
      ]);

      if (!$specimen) {
        return response()->json([
          'success' => false,
          'message' => 'Invalid or expired verification token.',
        ], 404);
      }

      // ==========================================
      // PUBLIC DATA MAPPING (Strip out sensitive IDs)
      // ==========================================
      $user = $specimen->user;
      $verifiedBy = $specimen->verifiedBy;

      return response()->json([
        'success' => true,
        'message' => 'Signature found',
        'data' => [
          'specimen' => [
            // Public user details
            'user' => [
              'full_name' => $user?->full_name ?? 'Unknown User',
              'email'     => $user?->email ?? 'No email provided',
              'role_label' => $user?->role_label ?? $user?->role ?? 'Unknown Role',
            ],

            // Public signature details
            'signature_image_url' => $specimen->signature_image_url,
            'is_verified'         => (bool) $specimen->is_verified,
            'status'              => $specimen->status,
            'status_label'        => $specimen->status_label,
            'status_color'        => $specimen->status_color,
            'verified_at'         => $specimen->verified_at?->toISOString(),
            'verification_notes'  => $specimen->verification_notes,
            'verification_method' => $specimen->verification_method,
            'document_reference'  => 'SIG-' . $specimen->id,

            // Public verifier details
            'verified_by' => [
              'full_name' => $verifiedBy?->full_name ?? 'Unknown Verifier',
              'email'     => $verifiedBy?->email ?? 'N/A',
            ],
          ],

          // QR Code data (Base64 images are safe to expose)
          'qr_code' => [
            'data'  => $specimen->qr_code_data,
            'image' => $specimen->qr_code_image,
            'hash'  => $specimen->qr_code_hash,
          ],
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [verifyByToken] Unexpected error occurred', [
        'token' => $token,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'An internal server error occurred while verifying the token.',
      ], 500);
    }
  }

  /**
   * Get current user's signature status
   * PUBLIC - Works with or without authentication
   */
  public function status(Request $request): JsonResponse
  {
    try {
      $user = $request->user();

      // If user is not authenticated, try to find by token
      if (!$user) {
        $token = $request->query('token') ?? $request->input('token');
        if ($token) {
          $specimen = SignatureSpecimen::where('qr_verification_token', $token)->first();
          if ($specimen) {
            $user = $specimen->user;
          }
        }
      }

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'User not authenticated and no valid token provided',
          'data' => null,
        ], 401);
      }

      $status = $this->signatureService->getUserSignatureStatus($user);

      return response()->json([
        'success' => true,
        'data' => $status,
      ]);
    } catch (\Exception $e) {
      Log::error('Error getting signature status: ' . $e->getMessage());

      return response()->json([
        'success' => false,
        'message' => 'Failed to get signature status',
        'data' => null,
      ], 500);
    }
  }

  /**
   * Get current user's signature
   * PUBLIC - Works with or without authentication
   */
  public function mySignature(Request $request): JsonResponse
  {
    try {
      $user = $request->user();

      // If user is not authenticated, try to find by token
      if (!$user) {
        $token = $request->query('token') ?? $request->input('token');
        Log::info('🔍 [mySignature] No authenticated user, checking token', ['token_present' => !!$token]);

        if ($token) {
          $specimen = SignatureSpecimen::where('qr_verification_token', $token)->first();
          if ($specimen) {
            $user = $specimen->user;
            Log::info('🔍 [mySignature] Found user via token', ['user_id' => $user?->id]);
          }
        }
      }

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'User not authenticated and no valid token provided',
          'data' => null,
        ], 401);
      }

      $signature = $this->signatureService->getUserSignature($user);

      if (!$signature) {
        return response()->json([
          'success' => true,
          'message' => 'No verified signature found',
          'data' => null,
        ]);
      }

      return response()->json([
        'success' => true,
        'data' => new SignatureResource($signature),
      ]);
    } catch (\Exception $e) {
      Log::error('Error getting my signature: ' . $e->getMessage());

      return response()->json([
        'success' => false,
        'message' => 'Failed to get signature: ' . $e->getMessage(),
        'data' => null,
      ], 500);
    }
  }

  /**
   * Get signature QR code
   * PUBLIC - Works with or without authentication
   */
  public function getQR(Request $request, int $specimenId): JsonResponse
  {
    try {
      $qr = $this->signatureService->getSignatureQR($specimenId);

      if (!$qr) {
        return response()->json([
          'success' => false,
          'message' => 'QR Code not found or signature not verified',
          'data' => null,
        ], 404);
      }

      return response()->json([
        'success' => true,
        'data' => $qr,
      ]);
    } catch (SignatureNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Signature specimen not found.',
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'data' => null,
      ], 404);
    }
  }

  /**
   * Regenerate QR Code
   * Requires authentication
   */
  public function regenerateQR(Request $request, int $specimenId): JsonResponse
  {
    try {
      $user = $request->user();

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required to regenerate QR codes',
        ], 401);
      }

      $qr = $this->signatureService->regenerateQR(
        $specimenId,
        $user,
        $request->ip(),
        $request->userAgent()
      );

      return response()->json([
        'success' => true,
        'message' => 'QR Code regenerated successfully',
        'data' => $qr,
      ]);
    } catch (SignatureNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Signature specimen not found.',
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to regenerate QR Code: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete signature
   * Requires authentication
   */
  public function destroy(Request $request, int $specimenId): JsonResponse
  {
    try {
      $user = $request->user();

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required to delete signatures',
        ], 401);
      }

      $result = $this->signatureService->deleteSignature($specimenId, $user);

      if (!$result) {
        return response()->json([
          'success' => false,
          'message' => 'Failed to delete signature',
        ], 500);
      }

      return response()->json([
        'success' => true,
        'message' => 'Signature deleted successfully',
      ]);
    } catch (SignatureNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Signature specimen not found.',
      ], 404);
    }
  }

  /**
   * Get all pending signatures (Admin only)
   */
  public function pending(Request $request): JsonResponse
  {
    $pending = $this->signatureService->getPendingSignatures();

    return response()->json([
      'success' => true,
      'data' => SignatureResource::collection($pending),
      'meta' => [
        'total' => $pending->count(),
        'per_page' => $pending->count(),
        'current_page' => 1,
        'last_page' => 1,
        'from' => $pending->count() > 0 ? 1 : 0,
        'to' => $pending->count(),
      ],
      'links' => [
        'first' => null,
        'last' => null,
        'prev' => null,
        'next' => null,
      ],
    ]);
  }

  /**
   * Get all verified signatures (Admin only)
   */
  public function verified(Request $request): JsonResponse
  {
    $verified = $this->signatureService->getVerifiedSignatures();

    return response()->json([
      'success' => true,
      'data' => SignatureResource::collection($verified),
      'meta' => [
        'total' => $verified->count(),
        'per_page' => $verified->count(),
        'current_page' => 1,
        'last_page' => 1,
        'from' => $verified->count() > 0 ? 1 : 0,
        'to' => $verified->count(),
      ],
      'links' => [
        'first' => null,
        'last' => null,
        'prev' => null,
        'next' => null,
      ],
    ]);
  }

  /**
   * Get signature statistics (Admin only)
   */
  public function stats(Request $request): JsonResponse
  {
    $stats = $this->signatureService->getStats();

    return response()->json([
      'success' => true,
      'data' => $stats,
    ]);
  }

  /**
   * Get all signature verification logs (Admin only)
   */
  public function logs(Request $request): JsonResponse
  {
    try {
      $filters = $request->only(['action', 'status', 'user_id', 'date_from', 'date_to']);
      $filters = array_filter($filters, fn($value) => !is_null($value) && $value !== '');

      $logs = $this->signatureService->getVerificationLogs($filters);

      return response()->json([
        'success' => true,
        'data' => $logs,
        'meta' => [
          'total' => $logs->count(),
          'filters_applied' => $filters,
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [SignatureController] Failed to fetch verification logs', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch verification logs: ' . $e->getMessage(),
      ], 500);
    }
  }
}
