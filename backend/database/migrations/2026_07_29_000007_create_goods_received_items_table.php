<?php
// database/migrations/2026_07_29_003006_create_goods_received_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('goods_received_items', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('goods_received_note_id');
      $table->unsignedBigInteger('purchase_order_item_id');
      $table->unsignedBigInteger('requisition_item_id');
      $table->string('item_name', 255);
      $table->text('description')->nullable();
      $table->string('unit_of_measure', 50)->nullable();
      $table->decimal('ordered_quantity', 15, 2);
      $table->decimal('received_quantity', 15, 2);
      $table->decimal('accepted_quantity', 15, 2)->nullable();
      $table->decimal('rejected_quantity', 15, 2)->default(0);
      $table->decimal('unit_price', 15, 2);
      $table->decimal('total_value', 15, 2);
      $table->text('rejection_reason')->nullable();
      $table->text('condition_notes')->nullable();
      $table->enum('quality_status', ['pending', 'passed', 'failed', 'conditional'])->default('pending');
      $table->text('quality_notes')->nullable();
      $table->string('batch_number', 100)->nullable();
      $table->json('serial_numbers')->nullable();
      $table->date('expiry_date')->nullable();
      $table->date('manufacturing_date')->nullable();
      $table->date('warranty_start_date')->nullable();
      $table->date('warranty_end_date')->nullable();
      $table->string('storage_location', 255)->nullable();
      $table->string('bin_number', 100)->nullable();
      $table->string('rack_number', 50)->nullable();
      $table->boolean('is_quarantined')->default(false);
      $table->text('quarantine_reason')->nullable();
      $table->date('quarantine_end_date')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('goods_received_note_id')
        ->references('id')
        ->on('goods_received_notes')
        ->onDelete('cascade');

      $table->foreign('purchase_order_item_id')
        ->references('id')
        ->on('purchase_order_items')
        ->onDelete('cascade');

      $table->foreign('requisition_item_id')
        ->references('id')
        ->on('requisition_items')
        ->onDelete('restrict');

      $table->index('goods_received_note_id');
      $table->index('purchase_order_item_id');
      $table->index('requisition_item_id');
      $table->index('quality_status');
      $table->index('is_quarantined');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('goods_received_items');
  }
};
