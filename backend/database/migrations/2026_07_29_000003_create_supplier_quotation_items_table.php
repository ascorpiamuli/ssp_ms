<?php
// database/migrations/2026_07_29_003002_create_supplier_quotation_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('supplier_quotation_items', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('supplier_quotation_id');
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
      $table->integer('delivery_days')->nullable();
      $table->integer('warranty_months')->nullable();
      $table->text('specifications')->nullable();
      $table->string('brand', 100)->nullable();
      $table->string('model', 100)->nullable();
      $table->boolean('is_alternative')->default(false);
      $table->text('alternative_notes')->nullable();
      $table->text('notes')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('supplier_quotation_id')
        ->references('id')
        ->on('supplier_quotations')
        ->onDelete('cascade');

      $table->foreign('requisition_item_id')
        ->references('id')
        ->on('requisition_items')
        ->onDelete('restrict');

      $table->index('supplier_quotation_id');
      $table->index('requisition_item_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('supplier_quotation_items');
  }
};
