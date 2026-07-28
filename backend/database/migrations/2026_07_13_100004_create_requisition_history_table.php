<?php
// database/migrations/2026_07_13_100003_create_requisition_history_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_history', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('user_id');

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

      // === ACTION DETAILS ===
      $table->enum('action', [
        'created',
        'updated',
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
        'restored',
        'commented',
        'attachment_added',
        'attachment_removed',
        'item_added',
        'item_removed',
        'item_updated',
        'budget_updated',
        'revised',
        'revision_approved',
        'revision_rejected',
        'escalated',
        'delegated'
      ]);

      // === CHANGES TRACKING ===
      $table->json('old_values')->nullable();
      $table->json('new_values')->nullable();
      $table->text('comment')->nullable();

      // === REVISION SPECIFIC ===
      $table->integer('revision_number')->nullable();
      $table->text('revision_reason')->nullable();

      // === METADATA ===
      $table->string('ip_address')->nullable();
      $table->string('user_agent')->nullable();
      $table->json('metadata')->nullable();

      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'action']);
      $table->index(['user_id', 'created_at']);
      $table->index('created_at');
      $table->index('revision_number');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_history');
  }
};
