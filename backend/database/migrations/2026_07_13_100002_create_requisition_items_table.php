<?php
// database/migrations/2026_07_13_100001_create_requisition_items_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_items', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('supplier_id')->nullable();
      $table->unsignedBigInteger('purchase_order_id')->nullable();
      $table->unsignedBigInteger('quality_inspected_by')->nullable();

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('supplier_id')->references('id')->on('suppliers')->nullOnDelete();
      $table->foreign('quality_inspected_by')->references('id')->on('users')->nullOnDelete();

      // === ITEM DETAILS ===
      $table->string('item_name');
      $table->text('description')->nullable();
      $table->string('unit_of_measure', 50);
      $table->decimal('quantity', 15, 2);
      $table->decimal('estimated_unit_cost', 15, 2);
      $table->decimal('total_cost', 15, 2)->storedAs('quantity * estimated_unit_cost');

      // === SPECIFICATIONS ===
      $table->text('specifications')->nullable();
      $table->string('catalog_number')->nullable();
      $table->string('manufacturer')->nullable();
      $table->string('model_number')->nullable();

      // === TAX & PRICING ===
      $table->decimal('tax_rate', 5, 2)->default(0);
      $table->decimal('tax_amount', 15, 2)->default(0);
      $table->decimal('discount_percentage', 5, 2)->default(0);
      $table->decimal('discount_amount', 15, 2)->default(0);
      $table->decimal('net_amount', 15, 2)->storedAs('total_cost - discount_amount + tax_amount');

      // === BUDGET ALLOCATION ===
      $table->decimal('budget_allocated', 15, 2)->nullable();
      $table->string('budget_line_item')->nullable();

      // === INVENTORY ===
      $table->boolean('is_inventory_item')->default(false);
      $table->string('inventory_code')->nullable();
      $table->integer('current_stock')->nullable();
      $table->integer('reorder_level')->nullable();

      // === SUPPLIER INFORMATION ===
      $table->string('supplier_quotation_number')->nullable();
      $table->json('alternative_suppliers')->nullable();
      $table->json('alternative_quotations')->nullable();

      // === PROCUREMENT TRACKING ===
      $table->boolean('is_procured')->default(false);
      $table->timestamp('procured_at')->nullable();
      $table->decimal('actual_unit_cost', 15, 2)->nullable();
      $table->decimal('actual_total_cost', 15, 2)->nullable();

      // === DELIVERY ===
      $table->date('expected_delivery_date')->nullable();
      $table->date('actual_delivery_date')->nullable();
      $table->integer('delivery_lead_time_days')->nullable();
      $table->string('delivery_address')->nullable();
      $table->string('delivery_contact_person')->nullable();
      $table->string('delivery_contact_phone')->nullable();
      $table->boolean('is_delivered')->default(false);
      $table->timestamp('delivery_receipt_date')->nullable();
      $table->string('delivery_receipt_number')->nullable();

      // === QUALITY CONTROL ===
      $table->enum('quality_status', ['pending', 'inspected', 'accepted', 'rejected'])->default('pending');
      $table->text('quality_notes')->nullable();
      $table->timestamp('quality_inspected_at')->nullable();

      // === WARRANTY ===
      $table->integer('warranty_period_months')->nullable();
      $table->date('warranty_start_date')->nullable();
      $table->date('warranty_end_date')->nullable();
      $table->text('warranty_terms')->nullable();

      // === RECEIVING ===
      $table->decimal('received_quantity', 15, 2)->default(0);
      $table->decimal('remaining_quantity', 15, 2)->storedAs('quantity - received_quantity');
      $table->timestamp('fully_received_at')->nullable();

      // === PURCHASE ORDER ===
      $table->string('purchase_order_line_item')->nullable();

      // === STATUS ===
      $table->enum('status', [
        'pending',
        'approved',
        'procured',
        'delivered',
        'received',
        'cancelled'
      ])->default('pending');

      // === METADATA ===
      $table->json('metadata')->nullable();
      $table->softDeletes();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'status']);
      $table->index('item_name');
      $table->index('supplier_id');
      $table->index('inventory_code');
      $table->index('quality_status');
      $table->index('is_delivered');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_items');
  }
};
