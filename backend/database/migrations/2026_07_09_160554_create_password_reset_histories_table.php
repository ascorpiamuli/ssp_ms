<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('password_reset_histories', function (Blueprint $table) {
      $table->id();
      $table->unsignedBigInteger('user_id');
      $table->string('email');
      $table->string('ip_address')->nullable();
      $table->text('user_agent')->nullable();
      $table->timestamp('requested_at')->nullable();
      $table->boolean('is_successful')->default(false);
      $table->text('error_message')->nullable();
      $table->timestamps();

      $table->foreign('user_id')
        ->references('id')
        ->on('users')
        ->onDelete('cascade');

      // Add index for faster queries
      $table->index('email');
      $table->index('user_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('password_reset_histories');
  }
};
