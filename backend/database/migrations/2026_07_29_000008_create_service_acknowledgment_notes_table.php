<?php
// database/migrations/2026_07_29_003007_create_service_acknowledgment_notes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('service_acknowledgment_notes', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('purchase_order_id');
      $table->string('san_number', 50)->unique();
      $table->string('reference_number', 100)->nullable();
      $table->date('acknowledgment_date');
      $table->time('acknowledgment_time')->nullable();
      $table->unsignedBigInteger('acknowledged_by');
      $table->date('service_start_date')->nullable();
      $table->date('service_end_date')->nullable();
      $table->string('service_provider', 255)->nullable();
      $table->text('service_description')->nullable();
      $table->text('service_deliverables')->nullable();
      $table->decimal('total_value', 15, 2);
      $table->decimal('total_tax', 15, 2)->default(0);
      $table->decimal('total_discount', 15, 2)->default(0);
      $table->decimal('net_total', 15, 2);
      $table->text('quality_notes')->nullable();
      $table->text('performance_notes')->nullable();
      $table->enum('quality_rating', ['excellent', 'good', 'average', 'poor'])->nullable();
      $table->enum('status', ['draft', 'submitted', 'hod_approved', 'principal_approved', 'completed', 'rejected'])->default('draft');
      $table->enum('approval_level', ['hod', 'principal'])->default('hod');
      $table->unsignedBigInteger('hod_approved_by')->nullable();
      $table->timestamp('hod_approved_at')->nullable();
      $table->unsignedBigInteger('principal_approved_by')->nullable();
      $table->timestamp('principal_approved_at')->nullable();
      $table->timestamp('returned_at')->nullable();
      $table->text('return_reason')->nullable();
      $table->text('additional_notes')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('requisition_id')
        ->references('id')
        ->on('requisitions')
        ->onDelete('cascade');

      $table->foreign('purchase_order_id')
        ->references('id')
        ->on('purchase_orders')
        ->onDelete('cascade');

      $table->foreign('acknowledged_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('hod_approved_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('principal_approved_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('requisition_id');
      $table->index('purchase_order_id');
      $table->index('san_number');
      $table->index('status');
      $table->index('acknowledgment_date');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('service_acknowledgment_notes');
  }
};
