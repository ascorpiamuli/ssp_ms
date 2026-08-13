<?php
// database/migrations/2026_08_04_000003_alter_signature_verification_logs_make_verification_id_nullable.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('signature_verification_logs', function (Blueprint $table) {
      // Drop the existing foreign key constraint first
      $table->dropForeign(['signature_verification_id']);

      // Make the column nullable
      $table->foreignId('signature_verification_id')
        ->nullable()
        ->change();

      // Re-add the foreign key constraint with null on delete
      $table->foreign('signature_verification_id')
        ->references('id')
        ->on('signature_verifications')
        ->nullOnDelete();
    });
  }

  public function down(): void
  {
    Schema::table('signature_verification_logs', function (Blueprint $table) {
      $table->dropForeign(['signature_verification_id']);

      $table->foreignId('signature_verification_id')
        ->nullable(false)
        ->change();

      $table->foreign('signature_verification_id')
        ->references('id')
        ->on('signature_verifications')
        ->onDelete('cascade');
    });
  }
};
