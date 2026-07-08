<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\User\ProfileService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
  protected ProfileService $profileService;

  public function __construct(ProfileService $profileService)
  {
    $this->profileService = $profileService;
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
      'avatar' => 'required|image|max:2048|mimes:jpeg,png,jpg,gif,svg',
    ]);

    try {
      $path = $this->profileService->uploadPhoto(
        $request->user()->id,
        $request->file('avatar')
      );

      return response()->json([
        'success' => true,
        'message' => 'Profile photo uploaded successfully',
        'data' => [
          'avatar' => asset('storage/' . $path),
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
      $this->profileService->deletePhoto($request->user()->id);

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
}
