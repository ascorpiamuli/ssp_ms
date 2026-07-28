<?php
// routes/api.php

use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\BackupController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\SystemStatusController;

// ============================================
// REQUISITION CONTROLLERS
// ============================================
use App\Http\Controllers\Api\RequisitionController;
use App\Http\Controllers\Api\RequisitionItemController;
use App\Http\Controllers\Api\RequisitionAttachmentController;
use App\Http\Controllers\Api\RequisitionHistoryController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\ApprovalWorkflowController;
use App\Http\Controllers\Api\RequisitionBudgetController;
use App\Http\Controllers\Api\RequisitionRevisionController;
use App\Http\Controllers\Api\RequisitionNotificationController;
use App\Http\Controllers\Api\RequisitionReportController;

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
  // ============================================

  Route::get('/departments/active', [DepartmentController::class, 'active']);
  Route::get('/roles/available', [RoleController::class, 'index']);

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
  // PUBLIC REQUISITION ROUTES (No auth - for dropdowns)
  // ============================================
  Route::get('/approval-workflows/public', [ApprovalWorkflowController::class, 'index']);
  Route::get('/requisition-statuses', function () {
    return response()->json([
      'success' => true,
      'data' => [
        ['value' => 'draft', 'label' => 'Draft'],
        ['value' => 'submitted', 'label' => 'Submitted'],
        ['value' => 'hod_approved', 'label' => 'HOD Approved'],
        ['value' => 'hod_declined', 'label' => 'HOD Declined'],
        ['value' => 'accountant_approved', 'label' => 'Accountant Approved'],
        ['value' => 'accountant_declined', 'label' => 'Accountant Declined'],
        ['value' => 'principal_approved', 'label' => 'Principal Approved'],
        ['value' => 'principal_declined', 'label' => 'Principal Declined'],
        ['value' => 'final_approved', 'label' => 'Final Approved'],
        ['value' => 'final_declined', 'label' => 'Final Declined'],
        ['value' => 'returned', 'label' => 'Returned'],
        ['value' => 'cancelled', 'label' => 'Cancelled'],
        ['value' => 'revised', 'label' => 'Revised'],
      ],
    ]);
  });

  Route::get('/requisition-priorities', function () {
    return response()->json([
      'success' => true,
      'data' => [
        ['value' => 'low', 'label' => 'Low'],
        ['value' => 'medium', 'label' => 'Medium'],
        ['value' => 'high', 'label' => 'High'],
        ['value' => 'emergency', 'label' => 'Emergency'],
      ],
    ]);
  });

  Route::get('/procurement-methods', function () {
    return response()->json([
      'success' => true,
      'data' => [
        ['value' => 'direct_purchase', 'label' => 'Direct Purchase'],
        ['value' => 'request_for_quotation', 'label' => 'Request for Quotation'],
        ['value' => 'tender', 'label' => 'Tender'],
        ['value' => 'framework_agreement', 'label' => 'Framework Agreement'],
        ['value' => 'emergency_procurement', 'label' => 'Emergency Procurement'],
      ],
    ]);
  });

  // ============================================
  // AUTHENTICATION ROUTES (Public)
  // ============================================
  Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
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
      Route::get('/', [DepartmentController::class, 'index']);
      Route::get('/stats', [DepartmentController::class, 'stats']);
      Route::get('/{id}', [DepartmentController::class, 'show']);
      Route::get('/{id}/users', [DepartmentController::class, 'users']);

      Route::middleware(['role:ADMIN'])->group(function () {
        Route::post('/', [DepartmentController::class, 'store']);
        Route::put('/{id}', [DepartmentController::class, 'update']);
        Route::delete('/{id}', [DepartmentController::class, 'destroy']);
        Route::post('/{id}/activate', [DepartmentController::class, 'activate']);
        Route::post('/{id}/deactivate', [DepartmentController::class, 'deactivate']);
        Route::post('/{id}/assign-hod', [DepartmentController::class, 'assignHOD']);
        Route::post('/{id}/remove-hod', [DepartmentController::class, 'removeHOD']);
      });
    });

    // ============================================
    // SUPPLIER ROUTES
    // ============================================
    Route::prefix('suppliers')->group(function () {
      Route::get('/me', [SupplierController::class, 'me']);

      Route::middleware(['role:ADMIN,PROCUREMENT,HOD,ACCOUNTANT,PRINCIPAL,FINAL APPROVER,HEAD OF INSTITUTION'])->group(function () {
        Route::get('/', [SupplierController::class, 'index']);
        Route::get('/active', [SupplierController::class, 'active']);
        Route::get('/stats', [SupplierController::class, 'stats']);
        Route::get('/{id}', [SupplierController::class, 'show']);
        Route::post('/', [SupplierController::class, 'store']);
        Route::put('/{id}', [SupplierController::class, 'update']);
        Route::delete('/{id}', [SupplierController::class, 'destroy']);
        Route::post('/{id}/activate', [SupplierController::class, 'activate']);
        Route::post('/{id}/blacklist', [SupplierController::class, 'blacklist']);
        Route::post('/{id}/unblacklist', [SupplierController::class, 'unblacklist']);
      });
    });

    Route::prefix('requisitions')->group(function () {
      Route::post('/', [RequisitionController::class, 'store']);
      // All authenticated users can view requisitions
      Route::get('/', [RequisitionController::class, 'index']);
      Route::get('/stats', [RequisitionController::class, 'stats']);
      Route::get('/my', [RequisitionController::class, 'userRequisitions']);
      Route::get('/my/stats', [RequisitionController::class, 'myStats']);
      Route::get('/pending', [RequisitionController::class, 'pendingApprovals']);
      Route::get('/{id}', [RequisitionController::class, 'show']);
      Route::get('/reference/{referenceNumber}', [RequisitionController::class, 'showByReference']);

      // Create requisition (authenticated users)


      // Update requisition (only draft/returned/revised)
      Route::put('/{id}', [RequisitionController::class, 'update']);

      // Submit requisition for approval
      Route::post('/{id}/submit', [RequisitionController::class, 'submit']);

      // Return requisition for revision
      Route::post('/{id}/return', [RequisitionController::class, 'return']);

      // Cancel requisition
      Route::post('/{id}/cancel', [RequisitionController::class, 'cancel']);

      // Delete requisition (only draft)
      Route::delete('/{id}', [RequisitionController::class, 'destroy']);

      // --------------------------------------------
      // REQUISITION ITEMS ROUTES
      // --------------------------------------------
      Route::prefix('{requisitionId}/items')->group(function () {
        Route::get('/', [RequisitionItemController::class, 'index']);
        Route::get('/stats', [RequisitionItemController::class, 'stats']);
        Route::post('/', [RequisitionItemController::class, 'store']);
        Route::post('/bulk', [RequisitionItemController::class, 'bulkStore']);
        Route::get('/{id}', [RequisitionItemController::class, 'show']);
        Route::put('/{id}', [RequisitionItemController::class, 'update']);
        Route::delete('/{id}', [RequisitionItemController::class, 'destroy']);
        Route::post('/{id}/receive', [RequisitionItemController::class, 'receiveItem']);
        Route::post('/{id}/quality', [RequisitionItemController::class, 'updateQualityStatus']);
      });

      // --------------------------------------------
      // REQUISITION ATTACHMENT ROUTES
      // --------------------------------------------
      Route::prefix('{requisitionId}/attachments')->group(function () {
        Route::get('/', [RequisitionAttachmentController::class, 'index']);
        Route::post('/', [RequisitionAttachmentController::class, 'store']);
        Route::get('/{id}', [RequisitionAttachmentController::class, 'show']);
        Route::put('/{id}', [RequisitionAttachmentController::class, 'update']);
        Route::delete('/{id}', [RequisitionAttachmentController::class, 'destroy']);
        Route::get('/{id}/download', [RequisitionAttachmentController::class, 'download']);
      });

      // --------------------------------------------
      // REQUISITION HISTORY ROUTES
      // --------------------------------------------
      Route::prefix('{requisitionId}/history')->group(function () {
        Route::get('/', [RequisitionHistoryController::class, 'index']);
        Route::get('/{id}', [RequisitionHistoryController::class, 'show']);
      });

      // --------------------------------------------
      // REQUISITION BUDGET ROUTES
      // --------------------------------------------
      Route::prefix('{requisitionId}/budgets')->group(function () {
        Route::get('/', [RequisitionBudgetController::class, 'index']);
        Route::post('/', [RequisitionBudgetController::class, 'store']);
        Route::get('/{id}', [RequisitionBudgetController::class, 'show']);
        Route::put('/{id}', [RequisitionBudgetController::class, 'update']);
        Route::post('/{id}/verify', [RequisitionBudgetController::class, 'verify']);
        Route::post('/{id}/approve', [RequisitionBudgetController::class, 'approve']);
        Route::post('/{id}/reject', [RequisitionBudgetController::class, 'reject']);
      });

      // --------------------------------------------
      // REQUISITION REVISION ROUTES
      // --------------------------------------------
      Route::prefix('{requisitionId}/revisions')->group(function () {
        Route::get('/', [RequisitionRevisionController::class, 'index']);
        Route::post('/', [RequisitionRevisionController::class, 'store']);
        Route::get('/stats', [RequisitionRevisionController::class, 'stats']);
        Route::get('/{id}', [RequisitionRevisionController::class, 'show']);
        Route::post('/{id}/approve', [RequisitionRevisionController::class, 'approve']);
        Route::post('/{id}/reject', [RequisitionRevisionController::class, 'reject']);
      });
    });

    // --------------------------------------------
    // APPROVAL ROUTES
    // --------------------------------------------
    Route::prefix('approvals')->group(function () {

      // Get pending approvals for current user
      Route::get('/pending', [ApprovalController::class, 'pending'])->middleware(['auth:sanctum']);
      Route::get('/stats', [ApprovalController::class, 'stats'])->middleware(['auth:sanctum']);
      Route::get('/role', [ApprovalController::class, 'byRole'])->middleware(['auth:sanctum']);
      Route::get('/delegated', [ApprovalController::class, 'delegated'])->middleware(['auth:sanctum']);


      // Approval workflows
      Route::prefix('workflows')->group(function () {
        Route::get('/', [ApprovalWorkflowController::class, 'index']);
        Route::post('/', [ApprovalWorkflowController::class, 'store'])->middleware(['role:ADMIN']);
        Route::get('/default/{departmentId}', [ApprovalWorkflowController::class, 'default']);
        Route::get('/{id}', [ApprovalWorkflowController::class, 'show']);
        Route::put('/{id}', [ApprovalWorkflowController::class, 'update'])->middleware(['role:ADMIN']);
        Route::delete('/{id}', [ApprovalWorkflowController::class, 'destroy'])->middleware(['role:ADMIN']);
        Route::post('/{id}/clone', [ApprovalWorkflowController::class, 'clone'])->middleware(['role:ADMIN']);
      });

      // Process approvals for a requisition
      Route::prefix('requisitions/{requisitionId}')->group(function () {
        Route::get('/', [ApprovalController::class, 'index']);
        Route::post('/{level}/process', [ApprovalController::class, 'process']);
      });

      // Delegate approval
      Route::post('/{approvalId}/delegate', [ApprovalController::class, 'delegate']);
    });

    // --------------------------------------------
    // REQUISITION NOTIFICATION ROUTES
    // --------------------------------------------
    Route::prefix('notifications')->group(function () {
      Route::get('/', [RequisitionNotificationController::class, 'index']);
      Route::get('/unread-count', [RequisitionNotificationController::class, 'unreadCount']);
      Route::post('/mark-all-read', [RequisitionNotificationController::class, 'markAllAsRead']);
      Route::delete('/delete-all', [RequisitionNotificationController::class, 'deleteAll']);
      Route::get('/requisition/{requisitionId}', [RequisitionNotificationController::class, 'forRequisition']);
      Route::get('/{id}', [RequisitionNotificationController::class, 'show']);
      Route::post('/{id}/mark-read', [RequisitionNotificationController::class, 'markAsRead']);
      Route::delete('/{id}', [RequisitionNotificationController::class, 'destroy']);
    });

    // --------------------------------------------
    // REQUISITION REPORT ROUTES
    // --------------------------------------------
    Route::prefix('reports')->group(function () {
      Route::get('/dashboard', [RequisitionReportController::class, 'dashboard']);
      Route::get('/summary', [RequisitionReportController::class, 'summary']);
      Route::get('/approval-performance', [RequisitionReportController::class, 'approvalPerformance']);
      Route::get('/budget-utilization', [RequisitionReportController::class, 'budgetUtilization']);
      Route::get('/department/{departmentId}', [RequisitionReportController::class, 'departmentReport']);
      Route::get('/export', [RequisitionReportController::class, 'export']);
    });

    // --------------------------------------------
    // BUDGET ROUTES (Global)
    // --------------------------------------------
    Route::prefix('budgets')->group(function () {
      Route::get('/stats', [RequisitionBudgetController::class, 'stats']);
      Route::get('/fiscal-years', [RequisitionBudgetController::class, 'fiscalYears']);
    });

    // --------------------------------------------
    // HISTORY ROUTES (Global)
    // --------------------------------------------
    Route::prefix('history')->group(function () {
      Route::get('/actions/{action}', [RequisitionHistoryController::class, 'byAction']);
      Route::get('/stats', [RequisitionHistoryController::class, 'stats']);
      Route::get('/recent/{userId}', [RequisitionHistoryController::class, 'recent']);
    });

    // ============================================
    // USER MANAGEMENT ROUTES (Admin only)
    // ============================================
    Route::prefix('admin')->middleware(['role:ADMIN'])->group(function () {

      // User Management
      Route::prefix('users')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->withoutMiddleware('role:ADMIN');
        Route::post('/', [UserManagementController::class, 'store']);
        Route::get('/pending', [UserManagementController::class, 'pending']);
        Route::get('/recent', [UserManagementController::class, 'recent']);
        Route::get('/stats', [UserManagementController::class, 'stats']);
        Route::post('/bulk', [UserManagementController::class, 'bulkAction']);
        Route::get('/{id}', [UserManagementController::class, 'show']);
        Route::put('/{id}', [UserManagementController::class, 'update']);
        Route::delete('/{id}', [UserManagementController::class, 'destroy']);
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

      // Admin Requisition Management
      Route::prefix('requisitions')->group(function () {
        Route::get('/all', [RequisitionController::class, 'adminIndex']);
        Route::get('/stats', [RequisitionController::class, 'adminStats']);
        Route::get('/department/{departmentId}', [RequisitionController::class, 'departmentRequisitions']);
        Route::post('/{id}/force-approve', [RequisitionController::class, 'forceApprove']);
        Route::post('/{id}/force-decline', [RequisitionController::class, 'forceDecline']);
        Route::post('/{id}/force-return', [RequisitionController::class, 'forceReturn']);
        Route::post('/{id}/assign-approver', [RequisitionController::class, 'assignApprover']);
      });

      // Admin Approval Management
      Route::prefix('approvals')->group(function () {
        Route::get('/all-pending', [ApprovalController::class, 'adminPending']);
        Route::get('/delayed', [ApprovalController::class, 'delayedApprovals']);
        Route::post('/{id}/escalate', [ApprovalController::class, 'escalate']);
        Route::post('/{id}/reassign', [ApprovalController::class, 'reassign']);
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
