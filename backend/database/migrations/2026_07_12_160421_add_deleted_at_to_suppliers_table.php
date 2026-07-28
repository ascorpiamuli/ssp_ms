// database/migrations/2026_07_12_160000_add_deleted_at_to_suppliers_table.php

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
    Schema::table('suppliers', function (Blueprint $table) {
      // Add deleted_at column for SoftDeletes
      if (!Schema::hasColumn('suppliers', 'deleted_at')) {
        $table->softDeletes()->after('updated_at');
      }
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('suppliers', function (Blueprint $table) {
      $table->dropSoftDeletes();
    });
  }
};
