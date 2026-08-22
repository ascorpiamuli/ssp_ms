<?php
// database/migrations/2026_08_14_093240_add_download_tracking_to_procurement_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    // 1. Supplier Quotations Table
    Schema::table('supplier_quotations', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 2. Quotation Requests (RFQ) Table
    Schema::table('quotation_requests', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 3. Purchase Orders Table
    Schema::table('purchase_orders', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 4. Goods Received Notes Table
    Schema::table('goods_received_notes', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 5. Service Acknowledgment Notes Table
    Schema::table('service_acknowledgment_notes', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 6. Invoices Table
    Schema::table('invoices', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 7. Payment Vouchers Table
    Schema::table('payment_vouchers', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 8. Cheques Table
    Schema::table('cheques', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 9. Contracts Table
    Schema::table('contracts', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });

    // 10. Tenders Table
    Schema::table('tenders', function (Blueprint $table) {
      $table->integer('download_count')->default(0);
      $table->timestamp('last_downloaded_at')->nullable();
      $table->string('pdf_storage_path')->nullable();
      $table->string('pdf_filename')->nullable();
      $table->unsignedBigInteger('pdf_upload_id')->nullable();

      $table->foreign('pdf_upload_id')
        ->references('id')
        ->on('uploads')
        ->onDelete('set null');
    });
  }

  public function down(): void
  {
    // Drop foreign keys and columns for all tables
    $tables = [
      'supplier_quotations',
      'quotation_requests',
      'purchase_orders',
      'goods_received_notes',
      'service_acknowledgment_notes',
      'invoices',
      'payment_vouchers',
      'cheques',
      'contracts',
      'tenders',
    ];

    foreach ($tables as $tableName) {
      // ✅ FIX: Use different variable name to avoid conflict
      Schema::table($tableName, function (Blueprint $table) {
        $table->dropForeign(['pdf_upload_id']);
        $table->dropColumn([
          'download_count',
          'last_downloaded_at',
          'pdf_storage_path',
          'pdf_filename',
          'pdf_upload_id',
        ]);
      });
    }
  }
};
