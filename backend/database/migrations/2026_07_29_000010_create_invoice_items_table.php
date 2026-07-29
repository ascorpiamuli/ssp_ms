<?php
// database/migrations/2026_07_29_003009_create_invoice_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('invoice_items', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('invoice_id');
      $table->unsignedBigInteger('purchase_order_item_id')->nullable();
      $table->unsignedBigInteger('goods_received_item_id')->nullable();
      $table->unsignedBigInteger('requisition_item_id');
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
      $table->text('notes')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('invoice_id')
        ->references('id')
        ->on('invoices')
        ->onDelete('cascade');

      $table->foreign('purchase_order_item_id')
        ->references('id')
        ->on('purchase_order_items')
        ->onDelete('set null');

      $table->foreign('goods_received_item_id')
        ->references('id')
        ->on('goods_received_items')
        ->onDelete('set null');

      $table->foreign('requisition_item_id')
        ->references('id')
        ->on('requisition_items')
        ->onDelete('restrict');

      $table->index('invoice_id');
      $table->index('purchase_order_item_id');
      $table->index('goods_received_item_id');
      $table->index('requisition_item_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('invoice_items');
  }
};
