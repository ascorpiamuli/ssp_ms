// database/migrations/2026_07_12_140000_create_uploads_table.php

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
    // Only create if the table doesn't exist
    if (!Schema::hasTable('uploads')) {
      Schema::create('uploads', function (Blueprint $table) {
        $table->id();

        // Polymorphic relationship
        $table->morphs('uploadable');

        // File information
        $table->string('file_name');
        $table->string('original_name');
        $table->string('file_path');
        $table->string('file_url')->nullable();
        $table->string('file_type')->nullable();
        $table->string('mime_type')->nullable();
        $table->string('extension', 20)->nullable();
        $table->bigInteger('file_size')->nullable();

        // Image specific fields
        $table->integer('width')->nullable();
        $table->integer('height')->nullable();
        $table->string('image_orientation')->nullable();

        // Upload metadata
        $table->string('disk')->default('public');
        $table->string('collection')->default('default');
        $table->string('title')->nullable();
        $table->text('description')->nullable();
        $table->json('meta_data')->nullable();

        // Status
        $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('completed');

        // User tracking
        $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
        $table->timestamp('uploaded_at')->nullable();

        $table->timestamps();

        // Add indexes
        $table->index(['uploadable_type', 'uploadable_id']);
        $table->index('collection');
        $table->index('file_type');
        $table->index('status');
        $table->index('uploaded_by');
        $table->index('created_at');
      });
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('uploads');
  }
};
