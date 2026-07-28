// database/migrations/2026_07_12_141000_add_avatar_fields_to_users_table.php

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
    Schema::table('users', function (Blueprint $table) {
      // Add avatar column if it doesn't exist
      if (!Schema::hasColumn('users', 'avatar')) {
        $table->string('avatar')->nullable()->after('timezone');
      }

      // Add avatar_upload_id column if it doesn't exist
      if (!Schema::hasColumn('users', 'avatar_upload_id')) {
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
    Schema::table('users', function (Blueprint $table) {
      // Drop foreign key first
      if (Schema::hasColumn('users', 'avatar_upload_id')) {
        $table->dropForeign(['avatar_upload_id']);
      }

      $table->dropColumn(['avatar', 'avatar_upload_id']);
    });
  }
};
