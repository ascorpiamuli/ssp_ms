// database/migrations/2026_07_12_143000_add_avatar_upload_id_to_user_profiles_table.php

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
    Schema::table('user_profiles', function (Blueprint $table) {
      // Check if column doesn't exist before adding
      if (!Schema::hasColumn('user_profiles', 'avatar_upload_id')) {
        $table->foreignId('avatar_upload_id')->nullable()->after('avatar');

        // Only add foreign key constraint if the uploads table exists
        if (Schema::hasTable('uploads')) {
          $table->foreign('avatar_upload_id')
            ->references('id')
            ->on('uploads')
            ->nullOnDelete();
        }
      }
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('user_profiles', function (Blueprint $table) {
      // Drop foreign key first
      if (Schema::hasColumn('user_profiles', 'avatar_upload_id')) {
        $table->dropForeign(['avatar_upload_id']);
        $table->dropColumn('avatar_upload_id');
      }
    });
  }
};
