<?php
// database/migrations/2026_07_29_003017_create_suppliers_blacklist_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('suppliers_blacklist', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('supplier_id');
      $table->text('reason');
      $table->text('evidence')->nullable();
      $table->unsignedBigInteger('blacklisted_by');
      $table->date('blacklisted_date');
      $table->date('expiry_date')->nullable();
      $table->enum('status', ['active', 'removed', 'expired'])->default('active');
      $table->unsignedBigInteger('removed_by')->nullable();
      $table->date('removed_date')->nullable();
      $table->text('removal_reason')->nullable();
      $table->integer('blacklist_count')->default(1);
      $table->json('previous_incidents')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('supplier_id')
        ->references('id')
        ->on('users')
        ->onDelete('cascade');

      $table->foreign('blacklisted_by')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');

      $table->foreign('removed_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('supplier_id');
      $table->index('status');
      $table->index('blacklisted_date');
      $table->index('expiry_date');
      $table->unique(['supplier_id', 'status']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('suppliers_blacklist');
  }
};
