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
    Schema::table('signature_specimens', function (Blueprint $table) {
      // Add the token column.
      // We make it nullable because existing records won't have one yet.
      $table->string('qr_verification_token', 64)->nullable()->unique()->after('qr_code_hash');

      // Optional: Add an index for faster lookups when users scan the QR code
      $table->index('qr_verification_token');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('signature_specimens', function (Blueprint $table) {
      $table->dropColumn('qr_verification_token');
    });
  }
};
