<?php
// database/migrations/2026_07_13_100007_create_requisition_revisions_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_revisions', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('requested_by');
      $table->unsignedBigInteger('approved_by')->nullable();
      $table->unsignedBigInteger('rejected_by')->nullable();

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('requested_by')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
      $table->foreign('rejected_by')->references('id')->on('users')->nullOnDelete();

      // === REVISION DETAILS ===
      $table->integer('revision_number');
      $table->text('revision_reason');
      $table->text('revision_notes')->nullable();
      $table->json('changes')->nullable();

      // === STATUS ===
      $table->enum('status', [
        'pending',
        'approved',
        'rejected',
        'cancelled'
      ])->default('pending');

      // === DECISION ===
      $table->text('approval_notes')->nullable();
      $table->text('rejection_reason')->nullable();

      // === TIMESTAMPS ===
      $table->timestamp('requested_at')->useCurrent();
      $table->timestamp('approved_at')->nullable();
      $table->timestamp('rejected_at')->nullable();
      $table->timestamp('cancelled_at')->nullable();

      // === METADATA ===
      $table->json('metadata')->nullable();
      $table->softDeletes();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'status']);
      $table->index('revision_number');
      $table->index('requested_by');
      $table->index('requested_at');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_revisions');
  }
};
