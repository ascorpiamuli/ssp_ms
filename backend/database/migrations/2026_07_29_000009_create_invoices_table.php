<?php
// database/migrations/2026_07_29_003008_create_invoices_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('invoices', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('purchase_order_id');
      $table->unsignedBigInteger('goods_received_note_id')->nullable();
      $table->unsignedBigInteger('service_acknowledgment_note_id')->nullable();
      $table->unsignedBigInteger('supplier_id');
      $table->string('invoice_number', 100)->unique();
      $table->string('customer_invoice_no', 100);
      $table->date('invoice_date');
      $table->date('due_date');
      $table->text('description')->nullable();
      $table->decimal('subtotal', 15, 2);
      $table->decimal('tax_amount', 15, 2)->default(0);
      $table->decimal('discount_amount', 15, 2)->default(0);
      $table->decimal('total_amount', 15, 2);
      $table->string('currency', 3)->default('KES');
      $table->decimal('exchange_rate', 10, 4)->default(1);
      $table->decimal('total_amount_base_currency', 15, 2)->nullable();
      $table->string('payment_reference', 100)->nullable();
      $table->string('bank_name', 100)->nullable();
      $table->string('bank_account', 50)->nullable();
      $table->enum('status', ['pending', 'verified', 'approved', 'paid', 'disputed', 'cancelled'])->default('pending');
      $table->enum('matching_status', ['pending', 'matched', 'partial', 'mismatch', 'not_applicable'])->default('pending');
      $table->text('matching_notes')->nullable();
      $table->unsignedBigInteger('matched_by')->nullable();
      $table->timestamp('matched_at')->nullable();
      $table->unsignedBigInteger('verified_by')->nullable();
      $table->timestamp('verified_at')->nullable();
      $table->unsignedBigInteger('approved_by')->nullable();
      $table->timestamp('approved_at')->nullable();
      $table->boolean('is_credit_note')->default(false);
      $table->string('credit_note_reference', 100)->nullable();
      $table->text('payment_terms')->nullable();
      $table->text('notes')->nullable();
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

      $table->foreign('goods_received_note_id')
        ->references('id')
        ->on('goods_received_notes')
        ->onDelete('set null');

      $table->foreign('service_acknowledgment_note_id')
        ->references('id')
        ->on('service_acknowledgment_notes')
        ->onDelete('set null');

      $table->foreign('supplier_id')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('matched_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('verified_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('approved_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('requisition_id');
      $table->index('purchase_order_id');
      $table->index('supplier_id');
      $table->index('invoice_number');
      $table->index('customer_invoice_no');
      $table->index('status');
      $table->index('matching_status');
      $table->index('invoice_date');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('invoices');
  }
};
