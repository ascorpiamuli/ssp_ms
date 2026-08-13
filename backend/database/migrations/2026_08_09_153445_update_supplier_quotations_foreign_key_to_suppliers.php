<?php
// database/migrations/2026_08_09_000001_update_supplier_quotations_foreign_key_to_suppliers.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    // Drop the existing foreign key constraint
    Schema::table('supplier_quotations', function (Blueprint $table) {
      $table->dropForeign(['supplier_id']);
    });

    // Change the column to reference suppliers table
    Schema::table('supplier_quotations', function (Blueprint $table) {
      $table->foreign('supplier_id')
        ->references('id')
        ->on('suppliers')
        ->onDelete('cascade');
    });
  }

  public function down(): void
  {
    // Drop the new foreign key
    Schema::table('supplier_quotations', function (Blueprint $table) {
      $table->dropForeign(['supplier_id']);
    });

    // Restore the original foreign key
    Schema::table('supplier_quotations', function (Blueprint $table) {
      $table->foreign('supplier_id')
        ->references('id')
        ->on('users')
        ->onDelete('restrict');
    });
  }
};
