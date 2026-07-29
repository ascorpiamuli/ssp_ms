<?php
// database/migrations/2026_07_29_003004_create_purchase_order_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('purchase_order_items', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('purchase_order_id');
      $table->unsignedBigInteger('requisition_item_id');
      $table->unsignedBigInteger('supplier_quotation_item_id')->nullable();
      $table->string('item_name', 255);
      $table->text('description')->nullable();
      $table->string('unit_of_measure', 50)->nullable();
      $table->decimal('quantity', 15, 2);
      $table->decimal('unit_price', 15, 2);
      $table->decimal('total_price', 15, 2);
      $table->decimal('tax_rate', 5, 2)->default(0);
      $table->decimal('tax_amount', 15, 2)->default(0);
      $table->decimal('discount_rate', 5, 2)->default(0);
      $table->decimal('discount_amount', 15, 2)->default(0);
      $table->decimal('net_price', 15, 2);
      $table->integer('delivery_days')->nullable();
      $table->integer('warranty_months')->nullable();
      $table->text('specifications')->nullable();
      $table->string('brand', 100)->nullable();
      $table->string('model', 100)->nullable();
      $table->string('catalog_number', 100)->nullable();
      $table->decimal('received_quantity', 15, 2)->default(0);
      $table->decimal('remaining_quantity', 15, 2)->virtualAs('quantity - received_quantity');
      $table->decimal('accepted_quantity', 15, 2)->default(0);
      $table->decimal('rejected_quantity', 15, 2)->default(0);
      $table->boolean('fully_received')->default(false);
      $table->timestamp('fully_received_at')->nullable();
      $table->enum('status', ['pending', 'partial', 'received', 'cancelled'])->default('pending');
      $table->text('notes')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('purchase_order_id')
        ->references('id')
        ->on('purchase_orders')
        ->onDelete('cascade');

      $table->foreign('requisition_item_id')
        ->references('id')
        ->on('requisition_items')
        ->onDelete('restrict');

      $table->foreign('supplier_quotation_item_id')
        ->references('id')
        ->on('supplier_quotation_items')
        ->onDelete('set null');

      $table->index('purchase_order_id');
      $table->index('requisition_item_id');
      $table->index('status');
      $table->index('fully_received');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('purchase_order_items');
  }
};
