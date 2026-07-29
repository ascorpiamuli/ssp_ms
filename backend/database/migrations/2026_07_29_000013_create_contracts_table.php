<?php
// database/migrations/2026_07_29_003012_create_contracts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('contracts', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('purchase_order_id')->nullable();
      $table->unsignedBigInteger('supplier_id');
      $table->string('contract_number', 50)->unique();
      $table->string('title', 255);
      $table->text('description')->nullable();
      $table->date('start_date');
      $table->date('end_date');
      $table->decimal('contract_value', 15, 2);
      $table->text('terms_and_conditions')->nullable();
      $table->text('deliverables')->nullable();
      $table->text('scope_of_work')->nullable();
      $table->text('payment_schedule')->nullable();
      $table->text('penalty_clauses')->nullable();
      $table->text('termination_clauses')->nullable();
      $table->enum('status', ['draft', 'active', 'completed', 'expired', 'terminated', 'suspended'])->default('draft');
      $table->unsignedBigInteger('created_by');
      $table->unsignedBigInteger('approved_by')->nullable();
      $table->timestamp('approved_at')->nullable();
      $table->timestamp('completed_at')->nullable();
      $table->timestamp('terminated_at')->nullable();
      $table->text('termination_reason')->nullable();
      $table->boolean('is_renewable')->default(false);
      $table->integer('renewal_period_months')->nullable();
      $table->integer('renewal_count')->default(0);
      $table->date('last_renewal_date')->nullable();
      $table->date('next_renewal_date')->nullable();
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
        ->onDelete('set null');

      $table->foreign('supplier_id')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('created_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('approved_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('requisition_id');
      $table->index('purchase_order_id');
      $table->index('supplier_id');
      $table->index('contract_number');
      $table->index('status');
      $table->index('start_date');
      $table->index('end_date');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('contracts');
  }
};
