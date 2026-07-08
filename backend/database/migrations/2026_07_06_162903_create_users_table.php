<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('users', function (Blueprint $table) {
      $table->id();
      $table->string('first_name');
      $table->string('last_name');
      $table->string('email')->unique();
      $table->timestamp('email_verified_at')->nullable();
      $table->string('password');
      $table->string('phone')->nullable();
      $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
      $table->boolean('is_active')->default(true);
      $table->boolean('is_approved')->default(false);
      $table->timestamp('approved_at')->nullable();
      $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
      $table->text('rejection_reason')->nullable();
      $table->timestamp('last_login_at')->nullable();
      $table->string('timezone')->default('Africa/Nairobi');
      $table->rememberToken();
      $table->timestamps();

      // Indexes
      $table->index(['is_active', 'is_approved']);
      $table->index('email');
      $table->index('phone');
      $table->index('department_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('users');
  }
};
