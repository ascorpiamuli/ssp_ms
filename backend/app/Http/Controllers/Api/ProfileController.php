<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UploadResource;
use App\Services\User\ProfileService;
use App\Services\UploadService;
use App\Models\Upload;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
  protected ProfileService $profileService;
  protected UploadService $uploadService;

  public function __construct(ProfileService $profileService, UploadService $uploadService)
  {
    $this->profileService = $profileService;
    $this->uploadService = $uploadService;
  }

  /**
   * Get authenticated user profile.
   */
  public function show(Request $request)
  {
    $user = $this->profileService->getUserWithProfile($request->user()->id);

    return response()->json([
      'success' => true,
      'data' => new UserResource($user),
    ]);
  }

  /**
   * Get profile by user ID (admin only).
   */
  public function showByUser($userId)
  {
    $user = $this->profileService->getUserWithProfile($userId);

    if (!$user) {
      return response()->json([
        'success' => false,
        'message' => 'User not found',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'data' => new UserResource($user),
    ]);
  }

  /**
   * Update authenticated user profile.
   */
  public function update(UpdateProfileRequest $request)
  {
    try {
      $user = $this->profileService->updateUserAndProfile(
        $request->user()->id,
        $request->validated()
      );

      return response()->json([
        'success' => true,
        'message' => 'Profile updated successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update profile: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update user profile by admin.
   */
  public function updateByAdmin(UpdateProfileRequest $request, $userId)
  {
    try {
      $user = $this->profileService->updateUserAndProfile($userId, $request->validated());

      return response()->json([
        'success' => true,
        'message' => 'User profile updated successfully',
        'data' => new UserResource($user),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to update user profile: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Upload profile photo.
   */
  public function uploadPhoto(Request $request)
  {
    $request->validate([
      'avatar' => 'required|image|max:5120|mimes:jpeg,png,jpg,gif,svg,webp',
    ]);

    try {
      $user = $request->user();

      // Upload the file using the upload service
      $upload = $this->uploadService->upload(
        $request->file('avatar'),
        $user,
        'avatar',
        'Profile Avatar',
        'User profile avatar uploaded on ' . now()->toDateTimeString()
      );

      // Delete old avatar upload if exists
      if ($user->avatar_upload_id) {
        $oldUpload = Upload::find($user->avatar_upload_id);
        if ($oldUpload) {
          $this->uploadService->delete($oldUpload);
        }
      }

      // Update user's avatar references
      $user->avatar = $upload->file_url;
      $user->avatar_upload_id = $upload->id;
      $user->save();

      return response()->json([
        'success' => true,
        'message' => 'Profile photo uploaded successfully',
        'data' => [
          'avatar' => $upload->file_url,
          'upload' => new UploadResource($upload),
        ],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to upload photo: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete profile photo.
   */
  public function deletePhoto(Request $request)
  {
    try {
      $user = $request->user();

      if ($user->avatar_upload_id) {
        $upload = Upload::find($user->avatar_upload_id);
        if ($upload) {
          $this->uploadService->delete($upload);
        }
      }

      $user->avatar = null;
      $user->avatar_upload_id = null;
      $user->save();

      return response()->json([
        'success' => true,
        'message' => 'Profile photo deleted successfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete photo: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get profile completion status.
   */
  public function completionStatus(Request $request)
  {
    $status = $this->profileService->getProfileCompletion($request->user()->id);

    return response()->json([
      'success' => true,
      'data' => $status,
    ]);
  }

  /**
   * List all profiles (admin only).
   */
  public function index(Request $request)
  {
    $profiles = $this->profileService->getAllProfiles($request->all());

    return response()->json([
      'success' => true,
      'data' => UserResource::collection($profiles),
      'meta' => [
        'total' => $profiles->total(),
        'per_page' => $profiles->perPage(),
        'current_page' => $profiles->currentPage(),
        'last_page' => $profiles->lastPage(),
      ],
    ]);
  }

  /**
   * Get user's avatar upload history.
   */
  public function avatarHistory(Request $request)
  {
    $user = $request->user();

    $avatars = Upload::where('uploadable_type', get_class($user))
      ->where('uploadable_id', $user->id)
      ->where('collection', 'avatar')
      ->orderBy('created_at', 'desc')
      ->get();

    return response()->json([
      'success' => true,
      'data' => UploadResource::collection($avatars),
    ]);
  }

  /**
   * Set a specific upload as the primary avatar.
   */
  public function setPrimaryAvatar(Request $request, $uploadId)
  {
    try {
      $user = $request->user();
      $upload = Upload::where('id', $uploadId)
        ->where('uploadable_type', get_class($user))
        ->where('uploadable_id', $user->id)
        ->where('collection', 'avatar')
        ->first();

      if (!$upload) {
        return response()->json([
          'success' => false,
          'message' => 'Avatar not found',
        ], 404);
      }

      // Update user's avatar
      $user->avatar = $upload->file_url;
      $user->avatar_upload_id = $upload->id;
      $user->save();

      return response()->json([
        'success' => true,
        'message' => 'Primary avatar updated successfully',
        'data' => [
          'avatar' => $upload->file_url,
          'upload' => new UploadResource($upload),
        ],
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to set primary avatar: ' . $e->getMessage(),
      ], 500);
    }
  }
}
