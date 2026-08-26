<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Signature\UploadSignatureRequest;
use App\Http\Requests\Signature\VerifySignatureRequest;
use App\Http\Requests\Signature\VerifySignatureQRRequest;
use App\Http\Resources\Signature\SignatureResource;
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
   * Helper to get user from token
   */
  protected function getUserFromToken(string $token): ?\App\Models\User
  {
    $specimen = SignatureSpecimen::where('qr_verification_token', $token)->with('user')->first();
    return $specimen?->user;
  }

  /**
   * Helper to get signature data for public response
   */
  protected function getPublicSignatureData(SignatureSpecimen $specimen): array
  {
    $user = $specimen->user;
    $verifiedBy = $specimen->verifiedBy;

    return [
      'specimen' => [
        'user' => [
          'full_name' => $user?->full_name ?? 'Unknown User',
          'email' => $user?->email ?? 'No email provided',
          'role_label' => $user?->role_label ?? $user?->role ?? 'Unknown Role',
        ],
        'signature_image_url' => $specimen->signature_image_url,
        'is_verified' => (bool) $specimen->is_verified,
        'status' => $specimen->status,
        'status_label' => $specimen->status_label,
        'status_color' => $specimen->status_color,
        'verified_at' => $specimen->verified_at?->toISOString(),
        'verification_notes' => $specimen->verification_notes,
        'verification_method' => $specimen->verification_method,
        'document_reference' => 'SIG-' . $specimen->id,
        'verified_by' => [
          'full_name' => $verifiedBy?->full_name ?? 'Unknown Verifier',
          'email' => $verifiedBy?->email ?? 'N/A',
        ],
      ],
      'qr_code' => [
        'data' => $specimen->qr_code_data,
        'image' => $specimen->qr_code_image,
        'hash' => $specimen->qr_code_hash,
      ],
    ];
  }

  /**
   * Helper to get public status data
   */
  protected function getPublicStatusData(SignatureSpecimen $specimen): array
  {
    $user = $specimen->user;

    return [
      'user' => [
        'id' => $user?->id,
        'full_name' => $user?->full_name ?? 'Unknown User',
        'email' => $user?->email ?? 'No email provided',
      ],
      'signature' => [
        'id' => $specimen->id,
        'status' => $specimen->status,
        'status_label' => $specimen->status_label,
        'status_color' => $specimen->status_color,
        'is_verified' => (bool) $specimen->is_verified,
        'verified_at' => $specimen->verified_at?->toISOString(),
        'verification_method' => $specimen->verification_method,
        'signature_image_url' => $specimen->signature_image_url,
        'created_at' => $specimen->created_at?->toISOString(),
        'updated_at' => $specimen->updated_at?->toISOString(),
      ],
    ];
  }

  // ============================================
  // AUTHENTICATED USER ENDPOINTS
  // ============================================

  /**
   * Get authenticated user's signature
   * @route GET /api/v1/signatures/my
   */
  public function mySignature(Request $request): JsonResponse
  {
    Log::info('📝 [mySignature] Authenticated user signature retrieval', [
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required',
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
      Log::error('❌ [mySignature] Error getting signature', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get signature: ' . $e->getMessage(),
        'data' => null,
      ], 500);
    }
  }

  /**
   * Get authenticated user's signature status
   * @route GET /api/v1/signatures/my/status
   */
  public function myStatus(Request $request): JsonResponse
  {
    Log::info('📋 [myStatus] Authenticated user status check', [
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required',
          'data' => null,
        ], 401);
      }

      $status = $this->signatureService->getUserSignatureStatus($user);

      return response()->json([
        'success' => true,
        'data' => $status,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [myStatus] Error getting status', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get signature status: ' . $e->getMessage(),
        'data' => null,
      ], 500);
    }
  }

  // ============================================
  // PUBLIC/UNAUTHENTICATED USER ENDPOINTS
  // ============================================

  /**
   * Get public signature by token
   * @route GET /api/v1/signatures/public/{token}
   */
  public function publicSignature(Request $request, string $token): JsonResponse
  {
    Log::info('🌐 [publicSignature] Public signature lookup by token', [
      'token_preview' => substr($token, 0, 10) . '...',
      'ip' => $request->ip(),
    ]);

    try {
      $specimen = SignatureSpecimen::where('qr_verification_token', $token)
        ->with(['user', 'verifiedBy'])
        ->first();

      if (!$specimen) {
        return response()->json([
          'success' => false,
          'message' => 'Invalid or expired signature token.',
          'data' => null,
        ], 404);
      }

      $publicData = $this->getPublicSignatureData($specimen);

      return response()->json([
        'success' => true,
        'message' => 'Signature found',
        'data' => $publicData,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [publicSignature] Error getting public signature', [
        'token_preview' => substr($token, 0, 10) . '...',
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get signature: ' . $e->getMessage(),
        'data' => null,
      ], 500);
    }
  }

  /**
   * Get public signature status by token
   * @route GET /api/v1/signatures/public/{token}/status
   */
  public function publicStatus(Request $request, string $token): JsonResponse
  {
    Log::info('🌐 [publicStatus] Public signature status by token', [
      'token_preview' => substr($token, 0, 10) . '...',
      'ip' => $request->ip(),
    ]);

    try {
      $specimen = SignatureSpecimen::where('qr_verification_token', $token)
        ->with(['user', 'verifiedBy'])
        ->first();

      if (!$specimen) {
        return response()->json([
          'success' => false,
          'message' => 'Invalid or expired signature token.',
          'data' => null,
        ], 404);
      }

      $statusData = $this->getPublicStatusData($specimen);

      return response()->json([
        'success' => true,
        'data' => $statusData,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [publicStatus] Error getting public status', [
        'token_preview' => substr($token, 0, 10) . '...',
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get signature status: ' . $e->getMessage(),
        'data' => null,
      ], 500);
    }
  }

  /**
   * Verify signature by Secure Token (For the clean QR URL flow)
   * PUBLIC endpoint - no authentication required
   * @route GET /api/v1/signatures/token/{token}
   */
  public function verifyByToken(Request $request, string $token): JsonResponse
  {
    Log::info('🔍 [verifyByToken] Starting token lookup', [
      'token_preview' => substr($token, 0, 10) . '...',
      'ip' => $request->ip(),
    ]);

    try {
      $specimen = SignatureSpecimen::where('qr_verification_token', $token)
        ->with(['user', 'verifiedBy'])
        ->first();

      if (!$specimen) {
        return response()->json([
          'success' => false,
          'message' => 'Invalid or expired verification token.',
        ], 404);
      }

      $publicData = $this->getPublicSignatureData($specimen);

      return response()->json([
        'success' => true,
        'message' => 'Signature found',
        'data' => $publicData,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [verifyByToken] Unexpected error occurred', [
        'token_preview' => substr($token, 0, 10) . '...',
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'An internal server error occurred while verifying the token.',
      ], 500);
    }
  }

  // ============================================
  // PROTECTED ENDPOINTS (Require Authentication)
  // ============================================

  /**
   * Upload a signature specimen
   * @route POST /api/v1/signatures/upload
   */
  public function upload(UploadSignatureRequest $request): JsonResponse
  {
    Log::info('📤 [upload] Signature upload request', [
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required to upload signature',
        ], 401);
      }

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
    } catch (\Exception $e) {
      Log::error('❌ [upload] Failed to upload signature', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to upload signature: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Verify a signature specimen (Admin/Manual verification)
   * @route POST /api/v1/signatures/verify/{specimenId}
   */
  public function verify(VerifySignatureRequest $request, int $specimenId): JsonResponse
  {
    Log::info('🔍 [verify] Signature verification request', [
      'specimen_id' => $specimenId,
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $verifier = $request->user();

      if (!$verifier) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required to verify signatures',
        ], 401);
      }

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
      Log::error('❌ [verify] Failed to verify signature', [
        'specimen_id' => $specimenId,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to verify signature: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Verify signature via QR Code (Legacy JSON payload scanning)
   * @route POST /api/v1/signatures/verify-qr
   */
  public function verifyByQR(VerifySignatureQRRequest $request): JsonResponse
  {
    Log::info('🔍 [verifyByQR] QR verification request', [
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $verifier = $request->user();

      if (!$verifier) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required to verify signatures via QR',
        ], 401);
      }

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
    } catch (\Exception $e) {
      Log::error('❌ [verifyByQR] Failed to verify via QR', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to verify via QR: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get signature QR code
   * PUBLIC - Works with or without authentication
   * @route GET /api/v1/signatures/qr/{specimenId}
   */
  public function getQR(Request $request, int $specimenId): JsonResponse
  {
    Log::debug('🔍 [getQR] Get QR code request', [
      'specimen_id' => $specimenId,
      'ip' => $request->ip(),
    ]);

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
      Log::error('❌ [getQR] Failed to get QR code', [
        'specimen_id' => $specimenId,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => $e->getMessage(),
        'data' => null,
      ], 404);
    }
  }

  /**
   * Regenerate QR Code
   * @route POST /api/v1/signatures/regenerate-qr/{specimenId}
   */
  public function regenerateQR(Request $request, int $specimenId): JsonResponse
  {
    Log::info('🔄 [regenerateQR] Regenerate QR request', [
      'specimen_id' => $specimenId,
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

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
      Log::error('❌ [regenerateQR] Failed to regenerate QR Code', [
        'specimen_id' => $specimenId,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to regenerate QR Code: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete signature
   * @route DELETE /api/v1/signatures/{specimenId}
   */
  public function destroy(Request $request, int $specimenId): JsonResponse
  {
    Log::info('🗑️ [destroy] Delete signature request', [
      'specimen_id' => $specimenId,
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

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
    } catch (\Exception $e) {
      Log::error('❌ [destroy] Failed to delete signature', [
        'specimen_id' => $specimenId,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to delete signature: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Reject a signature specimen (Admin only)
   * @route POST /api/v1/signatures/reject/{specimenId}
   */
  public function reject(Request $request, int $specimenId): JsonResponse
  {
    Log::info('🚫 [reject] Reject signature request', [
      'specimen_id' => $specimenId,
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $rejector = $request->user();

      if (!$rejector) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required to reject signatures',
        ], 401);
      }

      $rejected = $this->signatureService->rejectSignature(
        $specimenId,
        $rejector,
        $request->input('reason'),
        $request->ip(),
        $request->userAgent()
      );

      return response()->json([
        'success' => true,
        'message' => 'Signature rejected successfully',
        'data' => new SignatureResource($rejected),
      ]);
    } catch (SignatureNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Signature specimen not found.',
      ], 404);
    } catch (\Exception $e) {
      Log::error('❌ [reject] Failed to reject signature', [
        'specimen_id' => $specimenId,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to reject signature: ' . $e->getMessage(),
      ], 500);
    }
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Get all pending signatures (Admin only)
   * @route GET /api/v1/signatures/pending
   */
  public function pending(Request $request): JsonResponse
  {
    Log::info('📋 [pending] Get pending signatures request', [
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $user = $request->user();

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
    } catch (\Exception $e) {
      Log::error('❌ [pending] Failed to get pending signatures', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get pending signatures: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get all verified signatures (Admin only)
   * @route GET /api/v1/signatures/verified
   */
  public function verified(Request $request): JsonResponse
  {
    Log::info('📋 [verified] Get verified signatures request', [
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required',
        ], 401);
      }


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
    } catch (\Exception $e) {
      Log::error('❌ [verified] Failed to get verified signatures', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get verified signatures: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get signature statistics (Admin only)
   * @route GET /api/v1/signatures/stats
   */
  public function stats(Request $request): JsonResponse
  {
    Log::info('📊 [stats] Get signature stats request', [
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required',
        ], 401);
      }

      $stats = $this->signatureService->getStats();

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ [stats] Failed to get stats', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to get signature statistics: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get all signature verification logs (Admin only)
   * @route GET /api/v1/signatures/logs
   */
  public function logs(Request $request): JsonResponse
  {
    Log::info('📋 [logs] Get verification logs request', [
      'user_id' => $request->user()?->id,
      'ip' => $request->ip(),
    ]);

    try {
      $user = $request->user();

      if (!$user) {
        return response()->json([
          'success' => false,
          'message' => 'Authentication required',
        ], 401);
      }


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
      Log::error('❌ [logs] Failed to fetch verification logs', [
        'user_id' => $request->user()?->id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch verification logs: ' . $e->getMessage(),
      ], 500);
    }
  }

  // ============================================
  // DEPRECATED ENDPOINTS (Legacy support)
  // ============================================

  /**
   * @deprecated Use myStatus() or publicStatus() instead
   */
  public function status(Request $request): JsonResponse
  {
    Log::warning('⚠️ [status] DEPRECATED - Use myStatus() or publicStatus() instead');

    try {
      $user = $request->user();

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
}
