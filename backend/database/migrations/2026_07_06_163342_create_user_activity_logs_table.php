<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('user_activity_logs', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('action');
      $table->string('module')->nullable();
      $table->text('description')->nullable();
      $table->json('data')->nullable();
      $table->string('ip_address', 45)->nullable();
      $table->text('user_agent')->nullable();
      $table->timestamps();

      $table->index(['user_id', 'action']);
      $table->index('created_at');
      $table->index('module');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('user_activity_logs');
  }
};
