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

// ============================================
// PROCUREMENT CONTROLLERS
// ============================================
use App\Http\Controllers\Api\QuotationController;
use App\Http\Controllers\Api\SupplierQuotationController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\GoodsReceivedController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\TenderController;
use App\Http\Controllers\Api\ProcurementController;
use App\Http\Controllers\Api\ProcurementApprovalController;

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
  // PUBLIC PROCUREMENT DROPDOWN ROUTES
  // ============================================
  Route::get('/quotation-statuses', function () {
    return response()->json([
      'success' => true,
      'data' => [
        ['value' => 'draft', 'label' => 'Draft'],
        ['value' => 'sent', 'label' => 'Sent'],
        ['value' => 'responded', 'label' => 'Responded'],
        ['value' => 'evaluating', 'label' => 'Evaluating'],
        ['value' => 'closed', 'label' => 'Closed'],
        ['value' => 'cancelled', 'label' => 'Cancelled'],
        ['value' => 'expired', 'label' => 'Expired'],
      ],
    ]);
  });

  Route::get('/purchase-order-statuses', function () {
    return response()->json([
      'success' => true,
      'data' => [
        ['value' => 'draft', 'label' => 'Draft'],
        ['value' => 'issued', 'label' => 'Issued'],
        ['value' => 'sent', 'label' => 'Sent to Supplier'],
        ['value' => 'acknowledged', 'label' => 'Acknowledged'],
        ['value' => 'delivered', 'label' => 'Delivered'],
        ['value' => 'partial', 'label' => 'Partially Delivered'],
        ['value' => 'completed', 'label' => 'Completed'],
        ['value' => 'cancelled', 'label' => 'Cancelled'],
        ['value' => 'closed', 'label' => 'Closed'],
      ],
    ]);
  });

  Route::get('/purchase-order-types', function () {
    return response()->json([
      'success' => true,
      'data' => [
        ['value' => 'lpo', 'label' => 'LPO (Goods)'],
        ['value' => 'lso', 'label' => 'LSO (Services)'],
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

    // ============================================
    // REQUISITION ROUTES
    // ============================================
    Route::prefix('requisitions')->group(function () {
      Route::post('/', [RequisitionController::class, 'store']);
      Route::get('/', [RequisitionController::class, 'index']);
      Route::get('/stats', [RequisitionController::class, 'stats']);
      Route::get('/my', [RequisitionController::class, 'userRequisitions']);
      Route::get('/my/stats', [RequisitionController::class, 'myStats']);
      Route::get('/pending', [RequisitionController::class, 'pendingApprovals']);
      Route::get('/{id}', [RequisitionController::class, 'show']);
      Route::get('/reference/{referenceNumber}', [RequisitionController::class, 'showByReference']);
      Route::put('/{id}', [RequisitionController::class, 'update']);
      Route::post('/{id}/submit', [RequisitionController::class, 'submit']);
      Route::post('/{id}/return', [RequisitionController::class, 'return']);
      Route::post('/{id}/cancel', [RequisitionController::class, 'cancel']);
      Route::delete('/{id}', [RequisitionController::class, 'destroy']);

      // Requisition Items
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

      // Requisition Attachments
      Route::prefix('{requisitionId}/attachments')->group(function () {
        Route::get('/', [RequisitionAttachmentController::class, 'index']);
        Route::post('/', [RequisitionAttachmentController::class, 'store']);
        Route::get('/{id}', [RequisitionAttachmentController::class, 'show']);
        Route::put('/{id}', [RequisitionAttachmentController::class, 'update']);
        Route::delete('/{id}', [RequisitionAttachmentController::class, 'destroy']);
        Route::get('/{id}/download', [RequisitionAttachmentController::class, 'download']);
      });

      // Requisition History
      Route::prefix('{requisitionId}/history')->group(function () {
        Route::get('/', [RequisitionHistoryController::class, 'index']);
        Route::get('/{id}', [RequisitionHistoryController::class, 'show']);
      });

      // Requisition Budgets
      Route::prefix('{requisitionId}/budgets')->group(function () {
        Route::get('/', [RequisitionBudgetController::class, 'index']);
        Route::post('/', [RequisitionBudgetController::class, 'store']);
        Route::get('/{id}', [RequisitionBudgetController::class, 'show']);
        Route::put('/{id}', [RequisitionBudgetController::class, 'update']);
        Route::post('/{id}/verify', [RequisitionBudgetController::class, 'verify']);
        Route::post('/{id}/approve', [RequisitionBudgetController::class, 'approve']);
        Route::post('/{id}/reject', [RequisitionBudgetController::class, 'reject']);
      });

      // Requisition Revisions
      Route::prefix('{requisitionId}/revisions')->group(function () {
        Route::get('/', [RequisitionRevisionController::class, 'index']);
        Route::post('/', [RequisitionRevisionController::class, 'store']);
        Route::get('/stats', [RequisitionRevisionController::class, 'stats']);
        Route::get('/{id}', [RequisitionRevisionController::class, 'show']);
        Route::post('/{id}/approve', [RequisitionRevisionController::class, 'approve']);
        Route::post('/{id}/reject', [RequisitionRevisionController::class, 'reject']);
      });
    });

    // ============================================
    // APPROVAL ROUTES
    // ============================================
    Route::prefix('approvals')->group(function () {
      Route::get('/pending', [ApprovalController::class, 'pending']);
      Route::get('/stats', [ApprovalController::class, 'stats']);
      Route::get('/role', [ApprovalController::class, 'byRole']);
      Route::get('/delegated', [ApprovalController::class, 'delegated']);

      Route::prefix('workflows')->group(function () {
        Route::get('/', [ApprovalWorkflowController::class, 'index']);
        Route::post('/', [ApprovalWorkflowController::class, 'store'])->middleware(['role:ADMIN']);
        Route::get('/default/{departmentId}', [ApprovalWorkflowController::class, 'default']);
        Route::get('/{id}', [ApprovalWorkflowController::class, 'show']);
        Route::put('/{id}', [ApprovalWorkflowController::class, 'update'])->middleware(['role:ADMIN']);
        Route::delete('/{id}', [ApprovalWorkflowController::class, 'destroy'])->middleware(['role:ADMIN']);
        Route::post('/{id}/clone', [ApprovalWorkflowController::class, 'clone'])->middleware(['role:ADMIN']);
      });

      Route::prefix('requisitions/{requisitionId}')->group(function () {
        Route::get('/', [ApprovalController::class, 'index']);
        Route::post('/{level}/process', [ApprovalController::class, 'process']);
      });

      Route::post('/{approvalId}/delegate', [ApprovalController::class, 'delegate']);
    });

    // ============================================
    // REQUISITION NOTIFICATION ROUTES
    // ============================================
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

    // ============================================
    // REQUISITION REPORT ROUTES
    // ============================================
    Route::prefix('reports')->group(function () {
      Route::get('/dashboard', [RequisitionReportController::class, 'dashboard']);
      Route::get('/summary', [RequisitionReportController::class, 'summary']);
      Route::get('/approval-performance', [RequisitionReportController::class, 'approvalPerformance']);
      Route::get('/budget-utilization', [RequisitionReportController::class, 'budgetUtilization']);
      Route::get('/department/{departmentId}', [RequisitionReportController::class, 'departmentReport']);
      Route::get('/export', [RequisitionReportController::class, 'export']);
    });

    // ============================================
    // BUDGET ROUTES (Global)
    // ============================================
    Route::prefix('budgets')->group(function () {
      Route::get('/stats', [RequisitionBudgetController::class, 'stats']);
      Route::get('/fiscal-years', [RequisitionBudgetController::class, 'fiscalYears']);
    });

    // ============================================
    // HISTORY ROUTES (Global)
    // ============================================
    Route::prefix('history')->group(function () {
      Route::get('/actions/{action}', [RequisitionHistoryController::class, 'byAction']);
      Route::get('/stats', [RequisitionHistoryController::class, 'stats']);
      Route::get('/recent/{userId}', [RequisitionHistoryController::class, 'recent']);
    });

    // ============================================
    // PROCUREMENT MODULE ROUTES
    // ============================================

    // --------------------------------------------
    // QUOTATION ROUTES
    // --------------------------------------------
    Route::prefix('quotations')->group(function () {
      Route::get('/', [QuotationController::class, 'index']);
      Route::post('/', [QuotationController::class, 'store']);
      Route::get('/stats', [QuotationController::class, 'statistics']);
      Route::get('/{id}', [QuotationController::class, 'show']);
      Route::put('/{id}', [QuotationController::class, 'update']);
      Route::post('/{id}/send', [QuotationController::class, 'send']);
      Route::post('/{id}/close', [QuotationController::class, 'close']);
      Route::post('/{id}/cancel', [QuotationController::class, 'cancel']);
      Route::post('/{id}/reminder', [QuotationController::class, 'sendReminder']);
      Route::get('/{id}/statistics', [QuotationController::class, 'statistics']);
      Route::post('/select-supplier', [QuotationController::class, 'selectSupplier']);
    });

    // --------------------------------------------
    // SUPPLIER QUOTATION ROUTES
    // --------------------------------------------
    Route::prefix('supplier-quotations')->group(function () {
      Route::get('/', [SupplierQuotationController::class, 'index']);
      Route::post('/', [SupplierQuotationController::class, 'store']);
      Route::get('/lowest/{qtnId}', [SupplierQuotationController::class, 'lowest']);
      Route::get('/{id}', [SupplierQuotationController::class, 'show']);
      Route::post('/{id}/verify', [SupplierQuotationController::class, 'verify']);
      Route::post('/{id}/evaluate', [SupplierQuotationController::class, 'evaluate']);
    });

    // --------------------------------------------
    // PURCHASE ORDER ROUTES
    // --------------------------------------------
    Route::prefix('purchase-orders')->group(function () {
      Route::get('/', [PurchaseOrderController::class, 'index']);
      Route::post('/', [PurchaseOrderController::class, 'store']);
      Route::get('/overdue', [PurchaseOrderController::class, 'overdue']);
      Route::get('/{id}', [PurchaseOrderController::class, 'show']);
      Route::get('/{id}/summary', [PurchaseOrderController::class, 'summary']);
      Route::get('/{id}/delivery-progress', [PurchaseOrderController::class, 'deliveryProgress']);
      Route::get('/{id}/pdf', [PurchaseOrderController::class, 'pdf']);
      Route::post('/{id}/approve', [PurchaseOrderController::class, 'approve']);
      Route::post('/{id}/issue', [PurchaseOrderController::class, 'issue']);
      Route::post('/{id}/send', [PurchaseOrderController::class, 'sendToSupplier']);
      Route::post('/{id}/acknowledge', [PurchaseOrderController::class, 'acknowledge']);
      Route::post('/{id}/deliver', [PurchaseOrderController::class, 'markDelivered']);
      Route::post('/{id}/complete', [PurchaseOrderController::class, 'complete']);
      Route::post('/{id}/cancel', [PurchaseOrderController::class, 'cancel']);
    });

    // --------------------------------------------
    // GOODS RECEIVED ROUTES
    // --------------------------------------------
    Route::prefix('goods-received')->group(function () {
      Route::get('/', [GoodsReceivedController::class, 'index']);
      Route::post('/', [GoodsReceivedController::class, 'store']);
      Route::get('/{id}', [GoodsReceivedController::class, 'show']);
      Route::get('/{id}/summary', [GoodsReceivedController::class, 'summary']);
      Route::get('/{id}/pdf', [GoodsReceivedController::class, 'pdf']);
      Route::post('/{id}/submit', [GoodsReceivedController::class, 'submit']);
      Route::post('/{id}/approve', [GoodsReceivedController::class, 'approve']);
      Route::post('/{id}/reject', [GoodsReceivedController::class, 'reject']);
      Route::post('/{id}/inspect', [GoodsReceivedController::class, 'inspect']);
    });

    // --------------------------------------------
    // SERVICE ACKNOWLEDGMENT ROUTES
    // --------------------------------------------
    Route::prefix('service-acknowledgments')->group(function () {
      Route::get('/', [GoodsReceivedController::class, 'index']);
      Route::post('/', [GoodsReceivedController::class, 'store']);
      Route::get('/{id}', [GoodsReceivedController::class, 'show']);
      Route::get('/{id}/summary', [GoodsReceivedController::class, 'sanSummary']);
      Route::get('/{id}/pdf', [GoodsReceivedController::class, 'pdfSan']);
      Route::post('/{id}/submit', [GoodsReceivedController::class, 'submitSan']);
      Route::post('/{id}/approve', [GoodsReceivedController::class, 'approveSan']);
      Route::post('/{id}/reject', [GoodsReceivedController::class, 'rejectSan']);
      Route::post('/{id}/rate', [GoodsReceivedController::class, 'rateService']);
    });

    // --------------------------------------------
    // INVOICE ROUTES
    // --------------------------------------------
    Route::prefix('invoices')->group(function () {
      Route::get('/', [InvoiceController::class, 'index']);
      Route::post('/', [InvoiceController::class, 'store']);
      Route::get('/overdue', [InvoiceController::class, 'overdue']);
      Route::get('/{id}', [InvoiceController::class, 'show']);
      Route::get('/{id}/summary', [InvoiceController::class, 'summary']);
      Route::get('/{id}/matching-status', [InvoiceController::class, 'matchingStatus']);
      Route::get('/{id}/pdf', [InvoiceController::class, 'pdf']);
      Route::post('/{id}/match', [InvoiceController::class, 'match']);
      Route::post('/{id}/verify', [InvoiceController::class, 'verify']);
      Route::post('/{id}/approve', [InvoiceController::class, 'approve']);
      Route::post('/{id}/pay', [InvoiceController::class, 'markPaid']);
      Route::post('/{id}/dispute', [InvoiceController::class, 'dispute']);
      Route::post('/{id}/cancel', [InvoiceController::class, 'cancel']);
      Route::post('/{id}/send-back', [InvoiceController::class, 'sendBack']);
    });

    // --------------------------------------------
    // PAYMENT ROUTES
    // --------------------------------------------
    Route::prefix('payments')->group(function () {
      // Payment Vouchers
      Route::get('/vouchers', [PaymentController::class, 'index']);
      Route::post('/vouchers', [PaymentController::class, 'store']);
      Route::get('/vouchers/{id}', [PaymentController::class, 'show']);
      Route::get('/vouchers/{id}/summary', [PaymentController::class, 'summary']);
      Route::get('/vouchers/{id}/pdf', [PaymentController::class, 'pdf']);
      Route::post('/vouchers/{id}/endorse', [PaymentController::class, 'endorse']);
      Route::post('/vouchers/{id}/approve', [PaymentController::class, 'approve']);
      Route::post('/vouchers/{id}/pay', [PaymentController::class, 'markPaid']);
      Route::post('/vouchers/{id}/cancel', [PaymentController::class, 'cancel']);

      // Cheques
      Route::post('/cheques', [PaymentController::class, 'recordCheque']);
      Route::get('/cheques/{id}', [PaymentController::class, 'chequeShow']);
      Route::get('/cheques/{id}/pdf', [PaymentController::class, 'chequePdf']);
      Route::post('/cheques/{id}/cash', [PaymentController::class, 'chequeCashed']);
      Route::post('/cheques/{id}/cancel', [PaymentController::class, 'chequeCancelled']);
      Route::post('/cheques/{id}/stop', [PaymentController::class, 'chequeStopped']);
    });

    // --------------------------------------------
    // CONTRACT ROUTES
    // --------------------------------------------
    Route::prefix('contracts')->group(function () {
      Route::get('/', [ContractController::class, 'index']);
      Route::post('/', [ContractController::class, 'store']);
      Route::get('/expiring', [ContractController::class, 'expiring']);
      Route::get('/renewable', [ContractController::class, 'renewable']);
      Route::get('/{id}', [ContractController::class, 'show']);
      Route::get('/{id}/summary', [ContractController::class, 'summary']);
      Route::get('/{id}/pdf', [ContractController::class, 'pdf']);
      Route::post('/{id}/approve', [ContractController::class, 'approve']);
      Route::post('/{id}/activate', [ContractController::class, 'activate']);
      Route::post('/{id}/complete', [ContractController::class, 'complete']);
      Route::post('/{id}/terminate', [ContractController::class, 'terminate']);
      Route::post('/{id}/suspend', [ContractController::class, 'suspend']);
      Route::post('/{id}/renew', [ContractController::class, 'renew']);
    });

    // --------------------------------------------
    // TENDER ROUTES
    // --------------------------------------------
    Route::prefix('tenders')->group(function () {
      Route::get('/', [TenderController::class, 'index']);
      Route::post('/', [TenderController::class, 'store']);
      Route::get('/{id}', [TenderController::class, 'show']);
      Route::get('/{id}/statistics', [TenderController::class, 'statistics']);
      Route::get('/{id}/bidders', [TenderController::class, 'bidders']);
      Route::get('/{id}/pdf', [TenderController::class, 'pdf']);
      Route::post('/{id}/publish', [TenderController::class, 'publish']);
      Route::post('/{id}/bidder', [TenderController::class, 'addBidder']);
      Route::delete('/{id}/bidder/{supplierId}', [TenderController::class, 'removeBidder']);
      Route::post('/{id}/evaluate', [TenderController::class, 'startEvaluation']);
      Route::post('/{id}/award', [TenderController::class, 'award']);
      Route::post('/{id}/cancel', [TenderController::class, 'cancel']);
    });

    // --------------------------------------------
    // PROCUREMENT WORKFLOW ROUTES
    // --------------------------------------------
    Route::prefix('procurement')->group(function () {
      Route::post('/start', [ProcurementController::class, 'start']);
      Route::post('/complete', [ProcurementController::class, 'complete']);
      Route::post('/cancel', [ProcurementController::class, 'cancel']);
      Route::get('/status/{requisitionId}', [ProcurementController::class, 'status']);
      Route::get('/summary/{requisitionId}', [ProcurementController::class, 'summary']);
      Route::get('/timeline/{requisitionId}', [ProcurementController::class, 'timeline']);
      Route::get('/metrics/{requisitionId}', [ProcurementController::class, 'metrics']);
      Route::get('/steps/{requisitionId}', [ProcurementController::class, 'steps']);
    });

    // --------------------------------------------
    // PROCUREMENT APPROVAL ROUTES
    // --------------------------------------------
    Route::prefix('procurement-approvals')->group(function () {
      Route::get('/', [ProcurementApprovalController::class, 'index']);
      Route::post('/', [ProcurementApprovalController::class, 'store']);
      Route::get('/statistics', [ProcurementApprovalController::class, 'statistics']);
      Route::get('/entity', [ProcurementApprovalController::class, 'entity']);
      Route::get('/timeline', [ProcurementApprovalController::class, 'timeline']);
      Route::get('/is-approved', [ProcurementApprovalController::class, 'isApproved']);
      Route::get('/current-level', [ProcurementApprovalController::class, 'currentLevel']);
      Route::get('/{id}', [ProcurementApprovalController::class, 'show']);
      Route::post('/{id}/approve', [ProcurementApprovalController::class, 'approve']);
      Route::post('/{id}/decline', [ProcurementApprovalController::class, 'decline']);
      Route::post('/{id}/return', [ProcurementApprovalController::class, 'return']);
      Route::post('/{id}/delegate', [ProcurementApprovalController::class, 'delegate']);
      Route::post('/{id}/reassign', [ProcurementApprovalController::class, 'reassign']);
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
