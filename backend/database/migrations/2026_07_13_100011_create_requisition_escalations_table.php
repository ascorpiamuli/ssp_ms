<?php
// database/migrations/2026_07_13_100011_create_requisition_escalations_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_escalations', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('escalated_by');
      $table->unsignedBigInteger('escalated_to');
      $table->unsignedBigInteger('resolved_by')->nullable();

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('escalated_by')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('escalated_to')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('resolved_by')->references('id')->on('users')->nullOnDelete();

      // === ESCALATION DETAILS ===
      $table->enum('reason', [
        'delayed_approval',
        'budget_issue',
        'emergency',
        'exception',
        'policy_violation',
        'revision_dispute'
      ]);

      $table->text('remarks');
      $table->text('resolution_notes')->nullable();
      $table->enum('status', ['pending', 'resolved', 'rejected'])->default('pending');

      // === TIMESTAMPS ===
      $table->timestamp('escalated_at')->useCurrent();
      $table->timestamp('resolved_at')->nullable();
      $table->timestamp('acknowledged_at')->nullable();

      // === METADATA ===
      $table->json('metadata')->nullable();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'status']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_escalations');
  }
};
