<?php
// database/migrations/2026_07_13_100006_create_requisition_budgets_table.php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('requisition_budgets', function (Blueprint $table): void {
      $table->id();
      $table->unsignedBigInteger('requisition_id');
      $table->unsignedBigInteger('verified_by')->nullable();
      $table->unsignedBigInteger('authorized_by')->nullable();

      // Foreign keys
      $table->foreign('requisition_id')->references('id')->on('requisitions')->cascadeOnDelete();
      $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();
      $table->foreign('authorized_by')->references('id')->on('users')->nullOnDelete();

      // === BUDGET DETAILS ===
      $table->string('budget_code');
      $table->string('budget_line_item')->nullable();
      $table->string('budget_category')->nullable();
      $table->enum('budget_type', ['capital', 'recurrent', 'emergency', 'project'])->default('recurrent');

      // === PROJECT & GRANT ===
      $table->string('project_id')->nullable();
      $table->string('grant_code')->nullable();

      // === AMOUNTS ===
      $table->decimal('allocated_amount', 15, 2);
      $table->decimal('utilized_amount', 15, 2)->default(0);
      $table->decimal('remaining_amount', 15, 2)->storedAs('allocated_amount - utilized_amount');
      $table->decimal('requested_amount', 15, 2);

      // === FISCAL PERIOD ===
      $table->string('fiscal_year')->nullable();
      $table->string('fiscal_quarter')->nullable();
      $table->date('budget_start_date')->nullable();
      $table->date('budget_end_date')->nullable();

      // === BUDGET MOVEMENT ===
      $table->boolean('is_transferred')->default(false);
      $table->timestamp('transferred_at')->nullable();
      $table->string('transferred_from')->nullable();
      $table->string('transferred_to')->nullable();
      $table->boolean('is_carry_over')->default(false);
      $table->decimal('carry_over_amount', 15, 2)->nullable();

      // === VARIANCES ===
      $table->decimal('variance_amount', 15, 2)->nullable();
      $table->decimal('variance_percentage', 5, 2)->nullable();
      $table->text('variance_reason')->nullable();

      // === STATUS ===
      $table->enum('status', [
        'pending',
        'verified',
        'approved',
        'rejected',
        'exhausted'
      ])->default('pending');

      // === VERIFICATION ===
      $table->timestamp('verified_at')->nullable();
      $table->text('verification_notes')->nullable();

      // === AUTHORIZATION ===
      $table->timestamp('authorized_at')->nullable();
      $table->text('authorization_notes')->nullable();

      // === METADATA ===
      $table->json('metadata')->nullable();
      $table->softDeletes();
      $table->timestamps();

      // === INDEXES ===
      $table->index(['requisition_id', 'budget_code']);
      $table->index('fiscal_year');
      $table->index('status');
      $table->index('budget_type');
      $table->index('project_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('requisition_budgets');
  }
};
