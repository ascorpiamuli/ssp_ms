<?php
// app/Http/Controllers/Api/RequisitionNotificationController.php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Requisition\RequisitionNotificationResource;
use App\Services\Requisitions\RequisitionNotificationService;
use App\Exceptions\Requisitions\NotificationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RequisitionNotificationController extends Controller
{
  public function __construct(
    protected RequisitionNotificationService $notificationService
  ) {}

  /**
   * Display a listing of notifications for a user.
   */
  public function index(Request $request): JsonResponse
  {
    try {
      $userId = $request->input('user_id') ?? auth()->id();
      $filters = $request->all();
      $perPage = $request->input('per_page', 20);

      $notifications = $this->notificationService->getForUser($userId, $filters, $perPage);

      return response()->json([
        'success' => true,
        'data' => RequisitionNotificationResource::collection($notifications),
        'message' => 'Notifications retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve notifications: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display notifications for a specific requisition.
   */
  public function forRequisition(int $requisitionId, Request $request): JsonResponse
  {
    try {
      $userId = $request->input('user_id') ?? auth()->id();
      $filters = array_merge($request->all(), ['requisition_id' => $requisitionId]);
      $perPage = $request->input('per_page', 20);

      $notifications = $this->notificationService->getForUser($userId, $filters, $perPage);

      return response()->json([
        'success' => true,
        'data' => RequisitionNotificationResource::collection($notifications),
        'message' => 'Notifications retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve notifications: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Display the specified notification.
   */
  public function show(int $id): JsonResponse
  {
    try {
      $notification = \App\Models\RequisitionNotification::with(['requisition', 'sentBy'])->findOrFail($id);

      return response()->json([
        'success' => true,
        'data' => new RequisitionNotificationResource($notification),
        'message' => 'Notification retrieved successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Notification not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to retrieve notification: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Mark notification as read.
   */
  public function markAsRead(int $id): JsonResponse
  {
    try {
      $notification = $this->notificationService->markAsRead($id);

      return response()->json([
        'success' => true,
        'data' => new RequisitionNotificationResource($notification),
        'message' => 'Notification marked as read'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Notification not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to mark notification as read: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Mark all notifications as read for a user.
   */
  public function markAllAsRead(Request $request): JsonResponse
  {
    try {
      $userId = $request->input('user_id') ?? auth()->id();
      $count = $this->notificationService->markAllAsRead($userId);

      return response()->json([
        'success' => true,
        'data' => ['marked_count' => $count],
        'message' => "{$count} notifications marked as read"
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to mark notifications as read: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get unread count for a user.
   */
  public function unreadCount(Request $request): JsonResponse
  {
    try {
      $userId = $request->input('user_id') ?? auth()->id();
      $count = $this->notificationService->getUnreadCount($userId);

      return response()->json([
        'success' => true,
        'data' => ['unread_count' => $count],
        'message' => 'Unread count retrieved successfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to get unread count: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Delete a notification.
   */
  public function destroy(int $id): JsonResponse
  {
    try {
      $notification = \App\Models\RequisitionNotification::findOrFail($id);
      $notification->delete();

      return response()->json([
        'success' => true,
        'message' => 'Notification deleted successfully'
      ]);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
      return response()->json([
        'success' => false,
        'message' => 'Notification not found'
      ], 404);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete notification: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Delete all notifications for a user.
   */
  public function deleteAll(Request $request): JsonResponse
  {
    try {
      $userId = $request->input('user_id') ?? auth()->id();
      $count = \App\Models\RequisitionNotification::forUser($userId)->delete();

      return response()->json([
        'success' => true,
        'data' => ['deleted_count' => $count],
        'message' => "{$count} notifications deleted successfully"
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to delete notifications: ' . $e->getMessage()
      ], 500);
    }
  }
}
