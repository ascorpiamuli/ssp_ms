<?php
// database/migrations/2026_07_13_100009_create_requisition_comments_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_comments', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('user_id');
      $table->unsignedBigInteger('parent_id')->nullable();

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('parent_id')->references('id')->on('requisition_comments')->cascadeOnDelete();

      // === COMMENT DETAILS ===
      $table->text('comment');
      $table->enum('type', ['comment', 'question', 'suggestion', 'clarification'])->default('comment');

      // === MENTIONS ===
      $table->json('mentions')->nullable();
      $table->json('metadata')->nullable();

      $table->softDeletes();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'created_at']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_comments');
  }
};
