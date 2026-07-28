<?php
// database/migrations/2026_07_13_100000_create_requisitions_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisitions', function (Blueprint $table): void {
      $table->id();

      // === RELATIONSHIPS ===
      $table->unsignedBigInteger('user_id');
      $table->unsignedBigInteger('department_id');
      $table->unsignedBigInteger('supplier_id')->nullable();

      // Foreign key constraints
      $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('department_id')->references('id')->on('departments')->cascadeOnDelete();
      $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();

      // === REQUISITION DETAILS ===
      $table->string('reference_number')->unique();
      $table->string('title');
      $table->text('description')->nullable();
      $table->decimal('total_amount', 15, 2)->default(0);

      // === STATUS WORKFLOW ===
      $table->enum('status', [
        'draft',
        'submitted',
        'hod_approved',
        'hod_declined',
        'accountant_approved',
        'accountant_declined',
        'principal_approved',
        'principal_declined',
        'final_approved',
        'final_declined',
        'returned',
        'cancelled',
        'revised'
      ])->default('draft');

      // === PRIORITY & TYPE ===
      $table->enum('priority', ['low', 'medium', 'high', 'emergency'])->default('medium');
      $table->enum('type', ['normal', 'emergency'])->default('normal');
      $table->enum('urgency', ['routine', 'urgent', 'critical'])->default('routine');

      // === JUSTIFICATION & DATES ===
      $table->text('justification')->nullable();
      $table->date('required_by_date')->nullable();
      $table->timestamp('required_delivery_date')->nullable();

      // === REVISION TRACKING ===
      $table->integer('revision_count')->default(0);
      $table->timestamp('last_revised_at')->nullable();
      $table->unsignedBigInteger('last_revised_by')->nullable();
      $table->text('revision_notes')->nullable();
      $table->enum('revision_status', ['pending', 'approved', 'rejected'])->nullable();

      // === HOD APPROVAL ===
      $table->timestamp('hod_approved_at')->nullable();
      $table->timestamp('hod_declined_at')->nullable();
      $table->text('hod_decline_reason')->nullable();
      $table->unsignedBigInteger('hod_approver_id')->nullable();

      // === ACCOUNTANT APPROVAL ===
      $table->timestamp('accountant_approved_at')->nullable();
      $table->timestamp('accountant_declined_at')->nullable();
      $table->text('accountant_decline_reason')->nullable();
      $table->unsignedBigInteger('accountant_approver_id')->nullable();

      // === PRINCIPAL APPROVAL ===
      $table->timestamp('principal_approved_at')->nullable();
      $table->timestamp('principal_declined_at')->nullable();
      $table->text('principal_decline_reason')->nullable();
      $table->unsignedBigInteger('principal_approver_id')->nullable();

      // === FINAL APPROVAL ===
      $table->timestamp('final_approved_at')->nullable();
      $table->timestamp('final_declined_at')->nullable();
      $table->text('final_decline_reason')->nullable();
      $table->unsignedBigInteger('final_approver_id')->nullable();

      // === RETURN TRACKING ===
      $table->timestamp('returned_at')->nullable();
      $table->text('return_reason')->nullable();
      $table->unsignedBigInteger('returned_by')->nullable();
      $table->integer('return_count')->default(0);
      $table->timestamp('last_returned_at')->nullable();

      // === CANCELLATION ===
      $table->timestamp('cancelled_at')->nullable();
      $table->text('cancellation_reason')->nullable();
      $table->unsignedBigInteger('cancelled_by')->nullable();

      // === SUBMISSION ===
      $table->timestamp('submitted_at')->nullable();
      $table->unsignedBigInteger('submitted_by')->nullable();

      // === BUDGET INFORMATION ===
      $table->decimal('budget_allocated', 15, 2)->nullable();
      $table->decimal('budget_utilized', 15, 2)->default(0);
      $table->string('budget_code')->nullable();
      $table->string('budget_source')->nullable();
      $table->string('funding_source')->nullable();
      $table->string('project_code')->nullable();

      // === PROCUREMENT DETAILS ===
      $table->boolean('is_procurement_created')->default(false);
      $table->timestamp('procurement_created_at')->nullable();
      $table->unsignedBigInteger('procurement_plan_id')->nullable();
      $table->enum('procurement_method', [
        'direct_purchase',
        'request_for_quotation',
        'tender',
        'framework_agreement',
        'emergency_procurement'
      ])->nullable();
      $table->boolean('is_framework_agreement')->default(false);
      $table->string('framework_agreement_id')->nullable();

      // === COMPLIANCE & RISK ===
      $table->enum('risk_level', ['low', 'medium', 'high', 'critical'])->default('low');
      $table->text('risk_mitigation')->nullable();
      $table->boolean('is_compliant')->default(true);
      $table->text('compliance_notes')->nullable();

      // === SLA TRACKING ===
      $table->timestamp('sla_started_at')->nullable();
      $table->timestamp('sla_target_at')->nullable();
      $table->enum('sla_status', ['on_track', 'at_risk', 'breached'])->nullable();

      // === APPROVAL METRICS ===
      $table->integer('approval_level_count')->default(0);
      $table->integer('total_approval_levels')->default(0);
      $table->timestamp('last_approval_at')->nullable();
      $table->timestamp('estimated_completion_date')->nullable();

      // === MULTI-CURRENCY ===
      $table->string('currency', 3)->default('KES');
      $table->decimal('exchange_rate', 10, 4)->default(1);
      $table->decimal('total_amount_usd', 15, 2)->nullable();

      // === DEPARTMENT BUDGET TRACKING ===
      $table->decimal('department_budget_balance', 15, 2)->nullable();
      $table->decimal('department_utilization_percentage', 5, 2)->nullable();

      // === AUDIT ===
      $table->timestamp('audit_trail_last_checked')->nullable();
      $table->string('audit_status')->nullable();
      $table->unsignedBigInteger('audited_by')->nullable();

      // === METADATA ===
      $table->json('metadata')->nullable();
      $table->json('custom_fields')->nullable();
      $table->string('ip_address')->nullable();
      $table->string('user_agent')->nullable();

      // === SOFT DELETE & TIMESTAMPS ===
      $table->softDeletes();
      $table->timestamps();

      // === ADDITIONAL FOREIGN KEYS ===
      $table->foreign('last_revised_by')->references('id')->on('users')->nullOnDelete();
      $table->foreign('hod_approver_id')->references('id')->on('users')->nullOnDelete();
      $table->foreign('accountant_approver_id')->references('id')->on('users')->nullOnDelete();
      $table->foreign('principal_approver_id')->references('id')->on('users')->nullOnDelete();
      $table->foreign('final_approver_id')->references('id')->on('users')->nullOnDelete();
      $table->foreign('returned_by')->references('id')->on('users')->nullOnDelete();
      $table->foreign('cancelled_by')->references('id')->on('users')->nullOnDelete();
      $table->foreign('submitted_by')->references('id')->on('users')->nullOnDelete();
      $table->foreign('audited_by')->references('id')->on('users')->nullOnDelete();

      // === INDEXES ===
      $table->index('status');
      $table->index(['user_id', 'status']);
      $table->index(['department_id', 'status']);
      $table->index('budget_code');
      $table->index('project_code');
      $table->index('created_at');
      $table->index('required_by_date');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisitions');
  }
};
