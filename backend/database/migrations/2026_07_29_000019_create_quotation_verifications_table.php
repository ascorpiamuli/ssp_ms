<?php
// database/migrations/2026_07_29_003018_create_quotation_verifications_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('quotation_verifications', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('supplier_quotation_id');
      $table->unsignedBigInteger('assigned_to');
      $table->unsignedBigInteger('completed_by')->nullable();
      $table->enum('status', ['pending', 'in_progress', 'verified', 'rejected', 'needs_more_info'])->default('pending');
      $table->text('verification_notes')->nullable();
      $table->text('rejection_reason')->nullable();
      $table->json('verification_checklist')->nullable();
      $table->json('verification_result')->nullable();
      $table->timestamp('assigned_at')->nullable();
      $table->timestamp('started_at')->nullable();
      $table->timestamp('completed_at')->nullable();
      $table->date('deadline')->nullable();
      $table->integer('attempts')->default(0);
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('supplier_quotation_id')
        ->references('id')
        ->on('supplier_quotations')
        ->onDelete('cascade');

      $table->foreign('assigned_to')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('completed_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('supplier_quotation_id');
      $table->index('assigned_to');
      $table->index('status');
      $table->index('deadline');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('quotation_verifications');
  }
};
