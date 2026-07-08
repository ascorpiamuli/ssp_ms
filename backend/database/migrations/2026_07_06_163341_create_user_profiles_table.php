<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('user_profiles', function (Blueprint $table) {
      $table->id();
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('avatar')->nullable();
      $table->date('date_of_birth')->nullable();
      $table->enum('gender', ['male', 'female', 'other'])->nullable();
      $table->string('address')->nullable();
      $table->string('city')->nullable();
      $table->string('state')->nullable();
      $table->string('postal_code')->nullable();
      $table->string('country')->default('Kenya');
      $table->text('bio')->nullable();
      $table->json('preferences')->nullable();
      $table->json('social_links')->nullable();
      $table->timestamps();

      $table->index('user_id');
      $table->index('gender');
      $table->index('country');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('user_profiles');
  }
};
