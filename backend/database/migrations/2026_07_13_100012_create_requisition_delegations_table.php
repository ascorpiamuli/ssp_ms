<?php
// database/migrations/2026_07_13_100012_create_requisition_delegations_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_delegations', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('approver_id');
      $table->unsignedBigInteger('delegate_id');
      $table->unsignedBigInteger('department_id');
      $table->unsignedBigInteger('created_by')->nullable();

      // Foreign keys
      $table->foreign('approver_id')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('delegate_id')->references('id')->on('users')->cascadeOnDelete();
      $table->foreign('department_id')->references('id')->on('departments')->cascadeOnDelete();
      $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

      // === DELEGATION DETAILS ===
      $table->enum('level', ['hod', 'accountant', 'principal', 'final']);
      $table->date('start_date');
      $table->date('end_date');
      $table->text('reason')->nullable();

      // === STATUS ===
      $table->boolean('is_active')->default(true);
      $table->boolean('is_permanent')->default(false);

      // === METADATA ===
      $table->json('metadata')->nullable();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['approver_id', 'is_active']);
      $table->index(['delegate_id', 'is_active']);
      $table->index(['department_id', 'level']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_delegations');
  }
};
