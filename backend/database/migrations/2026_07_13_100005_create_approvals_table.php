<?php
// database/migrations/2026_07_13_100005_create_approvals_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('approvals', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('approver_id');
      $table->unsignedBigInteger('delegate_id')->nullable();
      $table->unsignedBigInteger('original_approver_id')->nullable();

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('approver_id')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('delegate_id')->references('id')->on('users')->nullOnDelete();
      $table->foreign('original_approver_id')->references('id')->on('users')->nullOnDelete();

      // === APPROVAL LEVEL ===
      $table->enum('level', ['hod', 'accountant', 'principal', 'final']);

      // === STATUS ===
      $table->enum('status', [
        'pending',
        'approved',
        'declined',
        'returned',
        'delegated',
        'escalated',
        'revised'
      ])->default('pending');

      // === DECISION ===
      $table->text('comment')->nullable();
      $table->text('decline_reason')->nullable();
      $table->text('return_reason')->nullable();
      $table->text('revision_notes')->nullable();

      // === REVISION TRACKING ===
      $table->integer('revision_count')->default(0);
      $table->timestamp('last_revised_at')->nullable();

      // === TIMESTAMPS ===
      $table->timestamp('approved_at')->nullable();
      $table->timestamp('declined_at')->nullable();
      $table->timestamp('returned_at')->nullable();
      $table->timestamp('delegated_at')->nullable();
      $table->timestamp('reminded_at')->nullable();
      $table->timestamp('escalated_at')->nullable();
      $table->timestamp('viewed_at')->nullable();

      // === DURATION ===
      $table->integer('response_time_hours')->nullable();
      $table->timestamp('received_at')->useCurrent();

      // === NOTIFICATIONS ===
      $table->boolean('notification_sent')->default(false);
      $table->timestamp('notification_sent_at')->nullable();
      $table->integer('notification_count')->default(0);
      $table->integer('reminder_count')->default(0);

      // === ORDER & PRIORITY ===
      $table->integer('order')->default(0);
      $table->boolean('is_required')->default(true);

      // === APPROVAL CONDITIONS ===
      $table->json('conditions')->nullable();
      $table->text('condition_notes')->nullable();

      // === USER ACTIONS ===
      $table->enum('action_taken', ['online', 'offline', 'delegated', 'escalated'])->nullable();
      $table->string('device_info')->nullable();
      $table->string('ip_address')->nullable();

      // === SIGNATURE ===
      $table->string('digital_signature')->nullable();
      $table->boolean('is_signed')->default(false);
      $table->timestamp('signed_at')->nullable();

      // === GROUP APPROVAL ===
      $table->boolean('is_group_approval')->default(false);
      $table->string('approval_group')->nullable();
      $table->integer('group_order')->nullable();

      // === METADATA ===
      $table->json('metadata')->nullable();
      $table->softDeletes();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'level', 'status']);
      $table->index(['approver_id', 'status']);
      $table->index(['delegate_id', 'status']);
      $table->index('created_at');
      $table->index('revision_count');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('approvals');
  }
};
