<?php
// database/migrations/2026_07_29_003005_create_goods_received_notes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('goods_received_notes', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('purchase_order_id');
      $table->string('grn_number', 50)->unique();
      $table->string('reference_number', 100)->nullable();
      $table->date('received_date');
      $table->time('received_time')->nullable();
      $table->unsignedBigInteger('received_by');
      $table->unsignedBigInteger('inspected_by')->nullable();
      $table->timestamp('inspected_at')->nullable();
      $table->text('inspection_notes')->nullable();
      $table->enum('inspection_result', ['pending', 'passed', 'failed', 'partial'])->default('pending');
      $table->decimal('total_quantity', 15, 2);
      $table->decimal('total_value', 15, 2);
      $table->decimal('total_tax', 15, 2)->default(0);
      $table->decimal('total_discount', 15, 2)->default(0);
      $table->decimal('net_total', 15, 2);
      $table->string('delivery_note_number', 100)->nullable();
      $table->string('carrier', 100)->nullable();
      $table->string('waybill_number', 100)->nullable();
      $table->string('vehicle_number', 50)->nullable();
      $table->text('delivery_condition')->nullable();
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

      $table->foreign('received_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('inspected_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

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
      $table->index('grn_number');
      $table->index('status');
      $table->index('received_date');
      $table->index(['status', 'approval_level']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('goods_received_notes');
  }
};
