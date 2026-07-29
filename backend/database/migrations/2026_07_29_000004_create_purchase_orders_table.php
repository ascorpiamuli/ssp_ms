<?php
// database/migrations/2026_07_29_003003_create_purchase_orders_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('purchase_orders', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('supplier_id');
      $table->unsignedBigInteger('supplier_quotation_id')->nullable();
      $table->string('po_number', 50)->unique();
      $table->enum('type', ['lpo', 'lso']);
      $table->string('title', 255)->nullable();
      $table->text('description')->nullable();
      $table->decimal('total_amount', 15, 2);
      $table->decimal('tax_amount', 15, 2)->default(0);
      $table->decimal('total_with_tax', 15, 2);
      $table->string('currency', 3)->default('KES');
      $table->date('issue_date');
      $table->date('expected_delivery_date');
      $table->date('actual_delivery_date')->nullable();
      $table->text('delivery_address')->nullable();
      $table->string('delivery_contact', 255)->nullable();
      $table->string('delivery_phone', 50)->nullable();
      $table->string('delivery_email', 100)->nullable();
      $table->text('payment_terms')->nullable();
      $table->text('delivery_terms')->nullable();
      $table->text('special_conditions')->nullable();
      $table->text('terms_and_conditions')->nullable();
      $table->integer('validity_period_days')->default(30);
      $table->string('contract_number', 50)->nullable();
      $table->date('contract_start_date')->nullable();
      $table->date('contract_end_date')->nullable();
      $table->enum('status', ['draft', 'issued', 'sent', 'acknowledged', 'delivered', 'partial', 'completed', 'cancelled', 'closed'])->default('draft');

      $table->unsignedBigInteger('generated_by');
      $table->unsignedBigInteger('checked_by')->nullable();
      $table->unsignedBigInteger('endorsed_by')->nullable();
      $table->unsignedBigInteger('approved_by')->nullable();
      $table->timestamp('checked_at')->nullable();
      $table->timestamp('endorsed_at')->nullable();
      $table->timestamp('approved_at')->nullable();
      $table->timestamp('issued_at')->nullable();
      $table->timestamp('sent_at')->nullable();
      $table->timestamp('acknowledged_at')->nullable();
      $table->timestamp('completed_at')->nullable();
      $table->timestamp('cancelled_at')->nullable();
      $table->text('cancellation_reason')->nullable();

      $table->text('digital_signature_generator')->nullable();
      $table->text('digital_signature_checker')->nullable();
      $table->text('digital_signature_endorser')->nullable();
      $table->text('digital_signature_approver')->nullable();

      $table->json('metadata')->nullable();
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('requisition_id')
        ->references('id')
        ->on('requisitions')
        ->onDelete('cascade');

      $table->foreign('supplier_id')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('supplier_quotation_id')
        ->references('id')
        ->on('supplier_quotations')
        ->onDelete('set null');

      $table->foreign('generated_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('checked_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('endorsed_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('approved_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('requisition_id');
      $table->index('supplier_id');
      $table->index('po_number');
      $table->index('type');
      $table->index('status');
      $table->index('contract_number');
      $table->index('issue_date');
      $table->index(['status', 'type']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('purchase_orders');
  }
};
