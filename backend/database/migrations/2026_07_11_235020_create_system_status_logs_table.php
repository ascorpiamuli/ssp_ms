<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('system_status_logs', function (Blueprint $table) {
      $table->id();
      $table->string('status'); // operational, degraded, maintenance, down
      $table->string('component'); // api, database, cache, queue, storage, authentication, services
      $table->string('environment')->default('production');
      $table->text('message')->nullable();
      $table->json('metrics')->nullable();
      $table->json('details')->nullable();
      $table->timestamp('checked_at');
      $table->timestamps();

      // Indexes
      $table->index('status');
      $table->index('component');
      $table->index('checked_at');
      $table->index(['component', 'status']);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('system_status_logs');
  }
};
