<?php
// database/migrations/2026_07_29_003016_create_procurement_notifications_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('procurement_notifications', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('user_id')->nullable();
      $table->unsignedBigInteger('supplier_id')->nullable();
      $table->unsignedBigInteger('sent_by');
      $table->string('type', 100);
      $table->enum('channel', ['email', 'in_app', 'sms', 'whatsapp'])->default('email');
      $table->string('subject', 255);
      $table->text('message')->nullable();
      $table->text('html_message')->nullable();
      $table->json('data')->nullable();
      $table->timestamp('sent_at')->nullable();
      $table->timestamp('read_at')->nullable();
      $table->timestamp('delivered_at')->nullable();
      $table->boolean('is_read')->default(false);
      $table->boolean('is_sent')->default(false);
      $table->boolean('is_delivered')->default(false);
      $table->integer('retry_count')->default(0);
      $table->timestamp('next_retry_at')->nullable();
      $table->text('error_message')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('requisition_id')
        ->references('id')
        ->on('requisitions')
        ->onDelete('cascade');

      $table->foreign('user_id')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('supplier_id')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->foreign('sent_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->index('requisition_id');
      $table->index('user_id');
      $table->index('supplier_id');
      $table->index('type');
      $table->index('is_read');
      $table->index('is_sent');
      $table->index('created_at');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('procurement_notifications');
  }
};
