<?php
// database/migrations/2026_07_25_XXXXXX_modify_department_id_in_approval_workflows.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('approval_workflows', function (Blueprint $table) {
      // Make department_id nullable
      $table->unsignedBigInteger('department_id')->nullable()->change();
    });
  }

  public function down(): void
  {
    Schema::table('approval_workflows', function (Blueprint $table) {
      // Revert to not nullable
      $table->unsignedBigInteger('department_id')->nullable(false)->change();
    });
  }
};
