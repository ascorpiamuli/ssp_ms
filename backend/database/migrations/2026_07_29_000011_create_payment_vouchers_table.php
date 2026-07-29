<?php
// database/migrations/2026_07_29_003010_create_payment_vouchers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('payment_vouchers', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('invoice_id');
      $table->unsignedBigInteger('purchase_order_id');
      $table->unsignedBigInteger('supplier_id');
      $table->string('voucher_number', 50)->unique();
      $table->string('payee_name', 200);
      $table->string('payee_address', 255)->nullable();
      $table->string('payee_phone', 50)->nullable();
      $table->string('payee_email', 100)->nullable();
      $table->decimal('amount', 15, 2);
      $table->string('amount_words', 255)->nullable();
      $table->string('bank_name', 100)->nullable();
      $table->string('account_number', 50)->nullable();
      $table->string('bank_branch', 100)->nullable();
      $table->string('cheque_number', 50)->nullable();
      $table->date('payment_date')->nullable();
      $table->text('payment_description')->nullable();
      $table->enum('payment_method', ['cheque', 'bank_transfer', 'cash', 'mobile_money'])->default('cheque');
      $table->string('transaction_reference', 100)->nullable();
      $table->enum('status', ['draft', 'endorsed', 'approved', 'paid', 'cancelled'])->default('draft');
      $table->unsignedBigInteger('prepared_by');
      $table->unsignedBigInteger('endorsed_by')->nullable();
      $table->unsignedBigInteger('approved_by')->nullable();
      $table->timestamp('endorsed_at')->nullable();
      $table->timestamp('approved_at')->nullable();
      $table->timestamp('paid_at')->nullable();
      $table->text('digital_signature_endorsement')->nullable();
      $table->text('digital_signature_approval')->nullable();
      $table->text('digital_signature_preparer')->nullable();
      $table->text('notes')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('requisition_id')
        ->references('id')
        ->on('requisitions')
        ->onDelete('cascade');

      $table->foreign('invoice_id')
        ->references('id')
        ->on('invoices')
        ->onDelete('cascade');

      $table->foreign('purchase_order_id')
        ->references('id')
        ->on('purchase_orders')
        ->onDelete('cascade');

      $table->foreign('supplier_id')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('prepared_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('endorsed_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('approved_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('requisition_id');
      $table->index('invoice_id');
      $table->index('purchase_order_id');
      $table->index('supplier_id');
      $table->index('voucher_number');
      $table->index('status');
      $table->index('cheque_number');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('payment_vouchers');
  }
};
