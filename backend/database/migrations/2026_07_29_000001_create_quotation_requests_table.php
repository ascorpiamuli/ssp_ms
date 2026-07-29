<?php
// database/migrations/2026_07_29_003000_create_quotation_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('quotation_requests', function (Blueprint $table) {
      $table->id(); // BIGINT UNSIGNED AUTO_INCREMENT
      $table->unsignedBigInteger('requisition_id');
      $table->string('qtn_number', 50)->unique();
      $table->string('title', 255);
      $table->text('description')->nullable();
      $table->date('issue_date');
      $table->date('closing_date');
      $table->time('closing_time')->nullable();
      $table->text('delivery_terms')->nullable();
      $table->text('payment_terms')->nullable();
      $table->text('special_conditions')->nullable();
      $table->text('instructions')->nullable();
      $table->enum('status', ['draft', 'sent', 'responded', 'evaluating', 'closed', 'cancelled', 'expired'])->default('draft');
      $table->json('sent_to_suppliers')->nullable();
      $table->json('responded_suppliers')->nullable();
      $table->json('declined_suppliers')->nullable();
      $table->boolean('is_automated')->default(false);
      $table->boolean('is_tender')->default(false);
      $table->string('tender_number', 50)->nullable();
      $table->unsignedBigInteger('generated_by');
      $table->unsignedBigInteger('approved_by')->nullable();
      $table->timestamp('approved_at')->nullable();
      $table->timestamp('sent_at')->nullable();
      $table->timestamp('closed_at')->nullable();
      $table->timestamp('cancelled_at')->nullable();
      $table->text('cancellation_reason')->nullable();
      $table->integer('reminder_days')->default(2);
      $table->json('metadata')->nullable();
      $table->timestamps();
      $table->softDeletes();

      // Foreign Keys
      $table->foreign('requisition_id')
        ->references('id')
        ->on('requisitions')
        ->onDelete('cascade');

      $table->foreign('generated_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('approved_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      // Indexes
      $table->index('requisition_id');
      $table->index('qtn_number');
      $table->index('status');
      $table->index('is_tender');
      $table->index('closing_date');
      $table->index(['status', 'closing_date']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('quotation_requests');
  }
};
