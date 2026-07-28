<?php
// database/migrations/2026_07_13_100008_create_requisition_templates_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_templates', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('department_id');
      $table->unsignedBigInteger('created_by');

      // Foreign keys
      $table->foreign('department_id')->references('id')->on('departments')->cascadeOnDelete();
      $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();

      // === TEMPLATE DETAILS ===
      $table->string('name');
      $table->text('description')->nullable();
      $table->json('items');
      $table->json('metadata')->nullable();

      // === STATUS ===
      $table->boolean('is_active')->default(true);
      $table->boolean('is_public')->default(false);

      $table->softDeletes();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['department_id', 'is_active']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_templates');
  }
};
