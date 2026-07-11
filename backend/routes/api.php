<?php

use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\BackupController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\SystemStatusController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| All API routes are prefixed with /api/v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

  // ============================================
  // PUBLIC ROUTES (No authentication required)
  // ============================================

  // Health Check
  Route::get('/health', function () {
    return response()->json([
      'status' => 'healthy',
      'service' => 'SSPMS API',
      'version' => '1.0.0',
      'timestamp' => now()->toIso8601String(),
      'environment' => app()->environment(),
    ]);
  });

  // ============================================
  // PUBLIC DROPDOWN DATA ROUTES
  // (Accessible without authentication for registration forms)
  // ============================================

  // Departments - for registration dropdown
  Route::get('/departments/active', [DepartmentController::class, 'active']);

  // Roles - for registration dropdown (filtered by guard)
  Route::get('/roles/available', [RoleController::class, 'index']);

  // Supplier categories - for registration dropdown
  Route::get('/supplier-categories', function () {
    return response()->json([
      'success' => true,
      'data' => [
        ['value' => 'goods', 'label' => 'Goods Supplier'],
        ['value' => 'services', 'label' => 'Services Provider'],
        ['value' => 'both', 'label' => 'Both Goods & Services'],
      ],
    ]);
  });

  // ============================================
  // AUTHENTICATION ROUTES (Public)
  // ============================================
  Route::prefix('auth')->group(function () {
    // Registration
    Route::post('/register', [AuthController::class, 'register']);

    // Login
    Route::post('/login', [AuthController::class, 'login']);

    // Password Reset
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/validate-reset-token', [AuthController::class, 'validateResetToken']);
  });

  // ============================================
  // PROTECTED ROUTES (Authentication required)
  // ============================================
  Route::middleware(['auth:sanctum'])->group(function () {

    // ============================================
    // AUTH ROUTES (Authenticated)
    // ============================================
    Route::prefix('auth')->group(function () {
      Route::post('/logout', [AuthController::class, 'logout']);
      Route::get('/me', [AuthController::class, 'me']);
      Route::get('/permissions', [AuthController::class, 'permissions']);
      Route::put('/profile', [AuthController::class, 'updateProfile']);
      Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // ============================================
    // PROFILE ROUTES
    // ============================================
    Route::prefix('profile')->group(function () {
      Route::get('/', [ProfileController::class, 'show']);
      Route::put('/', [ProfileController::class, 'update']);
      Route::post('/photo', [ProfileController::class, 'uploadPhoto']);
      Route::delete('/photo', [ProfileController::class, 'deletePhoto']);
      Route::get('/completion', [ProfileController::class, 'completionStatus']);
    });

    // ============================================
    // DEPARTMENT ROUTES
    // ============================================
    Route::prefix('departments')->group(function () {
      // Public (authenticated) routes
      Route::get('/', [DepartmentController::class, 'index']);
      Route::get('/stats', [DepartmentController::class, 'stats']);
      Route::get('/{id}', [DepartmentController::class, 'show']);
      Route::get('/{id}/users', [DepartmentController::class, 'users']);

      // Admin only routes - FIXED: Added deactivate route
      Route::middleware(['role:ADMIN'])->group(function () {
        Route::post('/', [DepartmentController::class, 'store']);
        Route::put('/{id}', [DepartmentController::class, 'update']);
        Route::delete('/{id}', [DepartmentController::class, 'destroy']);
        Route::post('/{id}/activate', [DepartmentController::class, 'activate']);
        Route::post('/{id}/deactivate', [DepartmentController::class, 'deactivate']); // ADDED THIS
        Route::post('/{id}/assign-hod', [DepartmentController::class, 'assignHOD']);
        Route::post('/{id}/remove-hod', [DepartmentController::class, 'removeHOD']);
      });
    });

    // ============================================
    // SUPPLIER ROUTES
    // ============================================
    Route::prefix('suppliers')->group(function () {
      Route::get('/', [SupplierController::class, 'index']);
      Route::get('/active', [SupplierController::class, 'active']);
      Route::get('/stats', [SupplierController::class, 'stats']);
      Route::get('/{id}', [SupplierController::class, 'show']);

      // Admin and Procurement can manage suppliers
      Route::middleware(['role:ADMIN,PROCUREMENT'])->group(function () {
        Route::post('/', [SupplierController::class, 'store']);
        Route::put('/{id}', [SupplierController::class, 'update']);
        Route::delete('/{id}', [SupplierController::class, 'destroy']);
        Route::post('/{id}/activate', [SupplierController::class, 'activate']);
        Route::post('/{id}/blacklist', [SupplierController::class, 'blacklist']);
        Route::post('/{id}/unblacklist', [SupplierController::class, 'unblacklist']);
      });
    });

    // ============================================
    // USER MANAGEMENT ROUTES (Admin only)
    // ============================================
    Route::prefix('admin')->middleware(['role:ADMIN'])->group(function () {

      // User Management - Using UserManagementController
      Route::prefix('users')->group(function () {
        Route::get('/', [UserManagementController::class, 'index']);
        Route::post('/', [UserManagementController::class, 'store']);
        Route::get('/pending', [UserManagementController::class, 'pending']);
        Route::get('/recent', [UserManagementController::class, 'recent']);
        Route::get('/stats', [UserManagementController::class, 'stats']);
        Route::post('/bulk', [UserManagementController::class, 'bulkAction']);
        Route::get('/{id}', [UserManagementController::class, 'show']);
        Route::put('/{id}', [UserManagementController::class, 'update']);
        Route::delete('/{id}', [UserManagementController::class, 'destroy']);

        // User Actions
        Route::post('/{id}/approve', [UserManagementController::class, 'approve']);
        Route::post('/{id}/reject', [UserManagementController::class, 'reject']);
        Route::post('/{id}/activate', [UserManagementController::class, 'activate']);
        Route::post('/{id}/deactivate', [UserManagementController::class, 'deactivate']);
        Route::post('/{id}/reset-password', [UserManagementController::class, 'resetPassword']);
      });

      // Role Management
      Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::get('/permissions', [RoleController::class, 'permissions']);
        Route::get('/permissions/grouped', [RoleController::class, 'permissionsGrouped']);
        Route::get('/stats', [RoleController::class, 'stats']);
        Route::get('/{id}', [RoleController::class, 'show']);
        Route::put('/{id}', [RoleController::class, 'update']);
        Route::delete('/{id}', [RoleController::class, 'destroy']);
        Route::post('/{id}/permissions', [RoleController::class, 'assignPermissions']);
        Route::get('/{id}/users', [RoleController::class, 'roleUsers']);
      });

      // Audit Log Routes
      Route::prefix('audit-logs')->group(function () {
        Route::get('/', [AuditLogController::class, 'index']);
        Route::get('/stats', [AuditLogController::class, 'stats']);
        Route::get('/modules', [AuditLogController::class, 'modules']);
        Route::get('/actions', [AuditLogController::class, 'actions']);
        Route::get('/export', [AuditLogController::class, 'export']);
        Route::get('/{id}', [AuditLogController::class, 'show']);
      });

      // User Role Assignment
      Route::prefix('assignments')->group(function () {
        Route::post('/assign-role', [RoleController::class, 'assignRoleToUser']);
        Route::post('/user-roles', [RoleController::class, 'userRoles']);
      });

      // System Status Routes
      Route::prefix('system-status')->group(function () {
        Route::get('/current', [SystemStatusController::class, 'current']);
        Route::get('/history', [SystemStatusController::class, 'history']);
        Route::get('/summary', [SystemStatusController::class, 'summary']);
        Route::get('/component/{component}', [SystemStatusController::class, 'component']);
        Route::post('/refresh', [SystemStatusController::class, 'refresh']);
      });


      // Backup Routes
      Route::prefix('backups')->group(function () {
        Route::get('/', [BackupController::class, 'index']);
        Route::post('/', [BackupController::class, 'store']);
        Route::get('/stats', [BackupController::class, 'stats']);
        Route::get('/{id}', [BackupController::class, 'show']);
        Route::delete('/{id}', [BackupController::class, 'destroy']);
        Route::get('/{id}/download', [BackupController::class, 'download']);
        Route::post('/{id}/restore', [BackupController::class, 'restore']);
        Route::post('/clean', [BackupController::class, 'clean']);
      });
    });

    // ============================================
    // 2FA ROUTES
    // ============================================
    Route::prefix('2fa')->group(function () {
      Route::post('/enable', [AuthController::class, 'enableTwoFactor']);
      Route::post('/disable', [AuthController::class, 'disableTwoFactor']);
      Route::post('/verify', [AuthController::class, 'verifyTwoFactor']);
      Route::post('/recovery-codes', [AuthController::class, 'generateRecoveryCodes']);
      Route::post('/verify-recovery', [AuthController::class, 'verifyRecoveryCode']);
      Route::get('/status', [AuthController::class, 'getTwoFactorStatus']);
    });
  });
});
