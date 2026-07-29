<?php
// database/migrations/2026_07_29_003014_create_procurement_approvals_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('procurement_approvals', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('approvable_id');
      $table->string('approvable_type', 100);
      $table->enum('level', ['hod', 'accountant', 'principal', 'final', 'diocesan_accountant', 'procurement']);
      $table->unsignedBigInteger('approver_id');
      $table->unsignedBigInteger('delegate_id')->nullable();
      $table->enum('status', ['pending', 'approved', 'declined', 'returned'])->default('pending');
      $table->integer('order')->default(1);
      $table->text('comment')->nullable();
      $table->text('decline_reason')->nullable();
      $table->text('return_reason')->nullable();
      $table->timestamp('approved_at')->nullable();
      $table->timestamp('declined_at')->nullable();
      $table->timestamp('returned_at')->nullable();
      $table->timestamp('deadline')->nullable();
      $table->boolean('is_reminder_sent')->default(false);
      $table->timestamp('reminder_sent_at')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('requisition_id')
        ->references('id')
        ->on('requisitions')
        ->onDelete('cascade');

      $table->foreign('approver_id')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('delegate_id')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index(['approvable_id', 'approvable_type']);
      $table->index('requisition_id');
      $table->index('status');
      $table->index('level');
      $table->index('approver_id');
      $table->index('deadline');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('procurement_approvals');
  }
};
