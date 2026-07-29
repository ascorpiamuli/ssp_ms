<?php
// database/migrations/2026_07_29_003013_create_tenders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('tenders', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->string('tender_number', 50)->unique();
      $table->string('title', 255);
      $table->text('description')->nullable();
      $table->date('issue_date');
      $table->date('closing_date');
      $table->time('closing_time')->nullable();
      $table->string('tender_document_path', 500)->nullable();
      $table->text('evaluation_criteria')->nullable();
      $table->decimal('estimated_value', 15, 2)->nullable();
      $table->enum('status', ['draft', 'published', 'evaluating', 'awarded', 'cancelled', 'expired'])->default('draft');
      $table->unsignedBigInteger('published_by')->nullable();
      $table->timestamp('published_at')->nullable();
      $table->unsignedBigInteger('awarded_to')->nullable();
      $table->timestamp('awarded_at')->nullable();
      $table->decimal('awarded_amount', 15, 2)->nullable();
      $table->text('award_notes')->nullable();
      $table->unsignedBigInteger('cancelled_by')->nullable();
      $table->timestamp('cancelled_at')->nullable();
      $table->text('cancellation_reason')->nullable();
      $table->json('bidders')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('requisition_id')
        ->references('id')
        ->on('requisitions')
        ->onDelete('cascade');

      $table->foreign('published_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('awarded_to')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('cancelled_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('requisition_id');
      $table->index('tender_number');
      $table->index('status');
      $table->index('closing_date');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('tenders');
  }
};
