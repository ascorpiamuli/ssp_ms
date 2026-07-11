<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\BackupService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class BackupController extends Controller
{
  protected BackupService $backupService;

  public function __construct(BackupService $backupService)
  {
    $this->backupService = $backupService;
  }

  /**
   * Get all backups
   */
  public function index(Request $request): JsonResponse
  {
    Log::info('📋 BackupController::index - Fetching backups', [
      'filters' => $request->all(),
      'user_id' => auth()->id(),
    ]);

    try {
      $filters = $request->only([
        'status',
        'type',
        'search',
        'sort_by',
        'sort_order',
        'per_page',
        'page',
      ]);

      $backups = $this->backupService->getAllBackups($filters);

      return response()->json([
        'success' => true,
        'data' => $backups->items(),
        'meta' => [
          'current_page' => $backups->currentPage(),
          'per_page' => $backups->perPage(),
          'total' => $backups->total(),
          'last_page' => $backups->lastPage(),
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ BackupController::index - Error fetching backups', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch backups: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Create a new backup
   */
  public function store(Request $request): JsonResponse
  {
    Log::info('📋 BackupController::store - Creating new backup', [
      'data' => $request->all(),
      'user_id' => auth()->id(),
    ]);

    try {
      $data = $request->validate([
        'name' => 'nullable|string|max:255',
        'type' => 'nullable|string|in:manual,scheduled,auto',
        'disk' => 'nullable|string|in:local,s3',
        'metadata' => 'nullable|array',
      ]);

      $backup = $this->backupService->createBackup($data);

      // Run the backup asynchronously (in production, you'd use a queue)
      // For now, we'll run it synchronously
      $this->backupService->runBackup($backup);

      return response()->json([
        'success' => true,
        'message' => 'Backup created successfully',
        'data' => $backup->fresh(),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ BackupController::store - Error creating backup', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to create backup: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get a single backup
   */
  public function show(int $id): JsonResponse
  {
    Log::info('🔍 BackupController::show - Fetching backup', [
      'backup_id' => $id,
      'user_id' => auth()->id(),
    ]);

    try {
      $backup = $this->backupService->getBackup($id);

      return response()->json([
        'success' => true,
        'data' => $backup,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ BackupController::show - Error fetching backup', [
        'backup_id' => $id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch backup: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete a backup
   */
  public function destroy(int $id): JsonResponse
  {
    Log::info('🗑️ BackupController::destroy - Deleting backup', [
      'backup_id' => $id,
      'user_id' => auth()->id(),
    ]);

    try {
      $this->backupService->deleteBackup($id);

      return response()->json([
        'success' => true,
        'message' => 'Backup deleted successfully',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ BackupController::destroy - Error deleting backup', [
        'backup_id' => $id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to delete backup: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Download a backup
   * This method returns a file download, not JSON
   */
  public function download(int $id)
  {
    Log::info('📥 BackupController::download - Downloading backup', [
      'backup_id' => $id,
      'user_id' => auth()->id(),
    ]);

    try {
      return $this->backupService->downloadBackup($id);
    } catch (\Exception $e) {
      Log::error('❌ BackupController::download - Error downloading backup', [
        'backup_id' => $id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to download backup: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get backup statistics
   */
  public function stats(): JsonResponse
  {
    Log::info('📊 BackupController::stats - Fetching backup statistics', [
      'user_id' => auth()->id(),
    ]);

    try {
      $stats = $this->backupService->getStats();

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ BackupController::stats - Error fetching statistics', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch statistics: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Restore from backup
   */
  public function restore(int $id): JsonResponse
  {
    Log::info('🔄 BackupController::restore - Restoring backup', [
      'backup_id' => $id,
      'user_id' => auth()->id(),
    ]);

    try {
      $this->backupService->restoreBackup($id);

      return response()->json([
        'success' => true,
        'message' => 'Backup restored successfully',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ BackupController::restore - Error restoring backup', [
        'backup_id' => $id,
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to restore backup: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Clean old backups
   */
  public function clean(Request $request): JsonResponse
  {
    Log::info('🧹 BackupController::clean - Cleaning old backups', [
      'user_id' => auth()->id(),
      'days' => $request->input('days', 30),
    ]);

    try {
      $days = $request->input('days', 30);
      $count = $this->backupService->cleanOldBackups($days);

      return response()->json([
        'success' => true,
        'message' => "{$count} old backups cleaned successfully",
        'data' => ['deleted_count' => $count],
      ]);
    } catch (\Exception $e) {
      Log::error('❌ BackupController::clean - Error cleaning backups', [
        'error' => $e->getMessage(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to clean backups: ' . $e->getMessage(),
      ], 500);
    }
  }
}
