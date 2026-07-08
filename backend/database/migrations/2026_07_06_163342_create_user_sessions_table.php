<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('user_sessions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('session_id')->unique();
      $table->string('ip_address', 45)->nullable();
      $table->text('user_agent')->nullable();
      $table->timestamp('last_activity');
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      $table->index(['user_id', 'last_activity']);
      $table->index('session_id');
      $table->index('is_active');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('user_sessions');
  }
};
