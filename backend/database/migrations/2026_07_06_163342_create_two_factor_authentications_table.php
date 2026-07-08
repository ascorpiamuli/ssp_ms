<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('two_factor_authentications', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('secret_key')->nullable();
      $table->json('recovery_codes')->nullable();
      $table->boolean('is_enabled')->default(false);
      $table->timestamp('confirmed_at')->nullable();
      $table->timestamps();

      $table->index('user_id');
      $table->index('is_enabled');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('two_factor_authentications');
  }
};
