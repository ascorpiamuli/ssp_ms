<?php
// database/migrations/2026_07_13_100004_create_approval_workflows_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('approval_workflows', function (Blueprint $table): void {
      $table->id();

      // === RELATIONSHIPS ===
      $table->unsignedBigInteger('department_id');
      $table->unsignedBigInteger('created_by');
      $table->unsignedBigInteger('updated_by')->nullable();

      // Foreign keys
      $table->foreign('department_id')->references('id')->on('departments')->cascadeOnDelete();
      $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();

      // === WORKFLOW DETAILS ===
      $table->string('name');
      $table->text('description')->nullable();
      $table->json('approval_levels')->nullable();
      $table->json('rules')->nullable();
      $table->json('conditions')->nullable();

      // === STATUS ===
      $table->boolean('is_active')->default(true);
      $table->boolean('is_default')->default(false);

      // === AMOUNT THRESHOLDS ===
      $table->decimal('min_amount', 15, 2)->default(0);
      $table->decimal('max_amount', 15, 2)->nullable();
      $table->decimal('threshold_level_1', 15, 2)->nullable();
      $table->decimal('threshold_level_2', 15, 2)->nullable();
      $table->decimal('threshold_level_3', 15, 2)->nullable();

      // === APPROVAL REQUIREMENTS ===
      $table->integer('required_approvals')->default(1);
      $table->boolean('require_all_approvals')->default(true);
      $table->boolean('allow_delegation')->default(false);
      $table->boolean('allow_parallel_approvals')->default(false);
      $table->boolean('require_sequential')->default(true);
      $table->integer('max_approvers')->nullable();

      // === SLA CONFIGURATION ===
      $table->integer('sla_hours')->default(48);
      $table->integer('reminder_hours')->default(24);
      $table->integer('escalation_hours')->default(72);

      // === FLEXIBILITY ===
      $table->boolean('allow_override')->default(false);
      $table->boolean('allow_reassignment')->default(false);
      $table->boolean('allow_skip')->default(false);
      $table->boolean('allow_revision')->default(true);

      // === REVISION CONFIGURATION ===
      $table->integer('max_revisions')->default(3);
      $table->boolean('require_justification_for_revision')->default(true);
      $table->boolean('auto_approve_after_revision')->default(false);

      // === TIMESTAMPS ===
      $table->softDeletes();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['department_id', 'is_active']);
      $table->index('is_default');
      $table->index(['min_amount', 'max_amount']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('approval_workflows');
  }
};
