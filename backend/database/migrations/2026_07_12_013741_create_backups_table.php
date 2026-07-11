<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('backups', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('file_name');
      $table->string('disk')->default('local');
      $table->string('path');
      $table->unsignedBigInteger('size')->default(0);
      $table->string('status')->default('pending'); // pending, running, completed, failed
      $table->string('type')->default('manual'); // manual, scheduled, auto
      $table->json('metadata')->nullable();
      $table->text('error_message')->nullable();
      $table->timestamp('completed_at')->nullable();
      $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
      $table->timestamps();

      // Indexes
      $table->index('status');
      $table->index('type');
      $table->index('created_at');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('backups');
  }
};
