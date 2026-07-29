<?php
// database/migrations/2026_07_29_003011_create_cheques_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('cheques', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('payment_voucher_id');
      $table->string('cheque_number', 50)->unique();
      $table->string('payee_name', 200);
      $table->string('payee_address', 255)->nullable();
      $table->decimal('amount', 15, 2);
      $table->string('amount_words', 255)->nullable();
      $table->date('issued_date');
      $table->enum('status', ['issued', 'cashed', 'cancelled', 'void', 'stopped'])->default('issued');
      $table->string('bank_name', 100)->nullable();
      $table->string('account_number', 50)->nullable();
      $table->string('bank_branch', 100)->nullable();
      $table->string('bank_sort_code', 20)->nullable();
      $table->unsignedBigInteger('recorded_by');
      $table->unsignedBigInteger('received_by')->nullable();
      $table->timestamp('received_at')->nullable();
      $table->timestamp('cashed_at')->nullable();
      $table->timestamp('cancelled_at')->nullable();
      $table->text('cancellation_reason')->nullable();
      $table->string('cancelled_by', 100)->nullable();
      $table->text('notes')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();
      $table->softDeletes();

      $table->foreign('payment_voucher_id')
        ->references('id')
        ->on('payment_vouchers')
        ->onDelete('cascade');

      $table->foreign('recorded_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('received_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('payment_voucher_id');
      $table->index('cheque_number');
      $table->index('status');
      $table->index('issued_date');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('cheques');
  }
};
