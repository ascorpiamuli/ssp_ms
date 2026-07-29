<?php
// database/migrations/2026_07_29_003019_create_procurement_settings_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('procurement_settings', function (Blueprint $table) {
      $table->id();
      $table->string('setting_key', 100)->unique();
      $table->string('setting_group', 50)->nullable();
      $table->text('setting_value')->nullable();
      $table->string('data_type', 20)->default('string');
      $table->boolean('is_encrypted')->default(false);
      $table->text('description')->nullable();
      $table->json('validation_rules')->nullable();
      $table->json('options')->nullable();
      $table->boolean('is_active')->default(true);
      $table->unsignedBigInteger('updated_by')->nullable();
      $table->json('metadata')->nullable();
      $table->timestamps();

      $table->foreign('updated_by')
        ->references('id')
        ->on('users')
        ->onDelete('set null');

      $table->index('setting_key');
      $table->index('setting_group');
      $table->index('is_active');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('procurement_settings');
  }
};
