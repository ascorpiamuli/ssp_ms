<?php
// database/migrations/2026_07_13_100010_create_requisition_notifications_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_notifications', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('user_id');
      $table->unsignedBigInteger('sent_by')->nullable();

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('sent_by')->references('id')->on('users')->nullOnDelete();

      // === NOTIFICATION DETAILS ===
      $table->enum('type', [
        'submitted',
        'approved',
        'declined',
        'returned',
        'reminder',
        'escalation',
        'comment',
        'mention',
        'status_change',
        'revision_requested',
        'revision_approved',
        'revision_rejected',
        'delegated'
      ]);

      $table->string('channel');
      $table->string('subject');
      $table->text('message');
      $table->json('data')->nullable();

      // === TIMESTAMPS ===
      $table->timestamp('sent_at')->nullable();
      $table->timestamp('read_at')->nullable();
      $table->timestamp('delivered_at')->nullable();

      // === STATUS ===
      $table->boolean('is_read')->default(false);
      $table->boolean('is_sent')->default(false);

      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'user_id', 'is_read']);
      $table->index('type');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_notifications');
  }
};
