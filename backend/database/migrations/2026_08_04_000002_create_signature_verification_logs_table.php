<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('signature_verification_logs', function (Blueprint $table) {
      $table->id();

      // Foreign key to signature_verifications
      $table->foreignId('signature_verification_id')
        ->constrained('signature_verifications')
        ->onDelete('cascade');

      // Action details
      $table->string('action');
      $table->string('status')->default('pending');
      $table->text('message')->nullable();
      $table->json('data')->nullable();

      // Audit fields
      $table->string('ip_address')->nullable();
      $table->text('user_agent')->nullable();
      $table->foreignId('created_by')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete();

      $table->timestamps();

      // Short index names to avoid MySQL identifier length limit (64 chars)
      $table->index('signature_verification_id', 'svl_verification_id_idx');
      $table->index('action', 'svl_action_idx');
      $table->index('status', 'svl_status_idx');
      $table->index('created_at', 'svl_created_idx');
      $table->index(['signature_verification_id', 'action'], 'svl_ver_action_idx');
      $table->index(['status', 'created_at'], 'svl_status_created_idx');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('signature_verification_logs');
  }
};
