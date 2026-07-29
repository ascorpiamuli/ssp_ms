<?php
// database/migrations/2026_07_29_003015_create_procurement_history_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('procurement_history', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('user_id');
      $table->string('action', 100);
      $table->string('entity_type', 100);
      $table->unsignedBigInteger('entity_id');
      $table->json('old_values')->nullable();
      $table->json('new_values')->nullable();
      $table->text('comment')->nullable();
      $table->string('ip_address', 45)->nullable();
      $table->text('user_agent')->nullable();
      $table->string('session_id', 100)->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('requisition_id')
        ->references('id')
        ->on('requisitions')
        ->onDelete('cascade');

      $table->foreign('user_id')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->index(['entity_type', 'entity_id']);
      $table->index('requisition_id');
      $table->index('user_id');
      $table->index('action');
      $table->index('created_at');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('procurement_history');
  }
};
