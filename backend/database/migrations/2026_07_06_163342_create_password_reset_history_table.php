<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('password_reset_history', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('ip_address', 45)->nullable();
      $table->text('user_agent')->nullable();
      $table->timestamp('requested_at')->useCurrent();
      $table->timestamp('completed_at')->nullable();
      $table->boolean('is_successful')->default(false);
      $table->text('failure_reason')->nullable();

      $table->index(['user_id', 'requested_at']);
      $table->index('is_successful');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('password_reset_history');
  }
};
