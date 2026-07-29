<?php
// database/migrations/2026_07_29_003001_create_supplier_quotations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('supplier_quotations', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('quotation_request_id');
      $table->unsignedBigInteger('supplier_id');
      $table->string('quotation_number', 50)->unique();
      $table->string('supplier_reference_no', 100)->nullable();
      $table->date('submission_date');
      $table->date('validity_date');
      $table->string('delivery_time', 100)->nullable();
      $table->text('payment_terms')->nullable();
      $table->text('delivery_terms')->nullable();
      $table->text('warranty_terms')->nullable();
      $table->decimal('total_amount', 15, 2);
      $table->decimal('tax_amount', 15, 2)->default(0);
      $table->decimal('discount_amount', 15, 2)->default(0);
      $table->decimal('net_amount', 15, 2);
      $table->string('currency', 3)->default('KES');
      $table->decimal('exchange_rate', 10, 4)->default(1);
      $table->decimal('total_amount_base_currency', 15, 2)->nullable();
      $table->enum('status', ['pending', 'submitted', 'evaluated', 'accepted', 'rejected', 'cancelled'])->default('pending');
      $table->text('notes')->nullable();
      $table->boolean('is_lowest')->default(false);
      $table->enum('submission_method', ['system', 'upload', 'manual'])->default('system');
      $table->string('uploaded_file_path', 500)->nullable();
      $table->string('original_filename', 255)->nullable();
      $table->string('file_hash', 64)->nullable();
      $table->boolean('is_data_extracted')->default(false);
      $table->json('extracted_data')->nullable();
      $table->text('manual_entry_notes')->nullable();
      $table->unsignedBigInteger('verified_by')->nullable();
      $table->timestamp('verified_at')->nullable();
      $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
      $table->text('verification_notes')->nullable();
      $table->unsignedBigInteger('evaluated_by')->nullable();
      $table->timestamp('evaluated_at')->nullable();
      $table->text('evaluation_notes')->nullable();
      $table->integer('evaluation_score')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('quotation_request_id')
        ->references('id')
        ->on('quotation_requests')
        ->onDelete('cascade');

      $table->foreign('supplier_id')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('verified_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('evaluated_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('quotation_request_id');
      $table->index('supplier_id');
      $table->index('status');
      $table->index('is_lowest');
      $table->index('quotation_number');
      $table->index('submission_method');
      $table->index('verification_status');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('supplier_quotations');
  }
};
