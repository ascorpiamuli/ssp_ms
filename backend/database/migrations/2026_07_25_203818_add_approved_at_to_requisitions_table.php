// database/migrations/2024_01_XX_add_approved_at_to_requisitions_table.php

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
    Schema::table('requisitions', function (Blueprint $table) {
      // Check if column doesn't exist before adding
      if (!Schema::hasColumn('requisitions', 'approved_at')) {
        $table->timestamp('approved_at')->nullable()->after('submitted_at');
      }
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('requisitions', function (Blueprint $table) {
      if (Schema::hasColumn('requisitions', 'approved_at')) {
        $table->dropColumn('approved_at');
      }
    });
  }
};
