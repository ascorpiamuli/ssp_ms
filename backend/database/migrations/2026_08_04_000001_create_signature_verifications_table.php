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
    Schema::create('signature_verifications', function (Blueprint $table) {
      $table->id();

      // Foreign keys
      $table->foreignId('signature_specimen_id')
        ->constrained('signature_specimens')
        ->onDelete('cascade')
        ->comment('The signature being verified');

      $table->foreignId('user_id')
        ->constrained('users')
        ->onDelete('cascade')
        ->comment('The user who signed');

      $table->foreignId('verified_by')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete()
        ->comment('Who performed the verification');

      // Document context
      $table->string('document_type')
        ->nullable()
        ->comment('Type of document');

      $table->unsignedBigInteger('document_id')
        ->nullable()
        ->comment('ID of the document being signed');

      $table->string('document_reference')
        ->nullable()
        ->comment('Reference number of the document');

      // Verification details
      $table->enum('verification_status', [
        'pending',
        'verified',
        'failed',
        'expired'
      ])->default('pending')
        ->comment('Status of this verification attempt');

      $table->string('verification_method')
        ->nullable()
        ->default('manual')
        ->comment('Method used (manual/automated/qr)');

      $table->text('verification_data')
        ->nullable()
        ->comment('Data used for verification');

      $table->text('failure_reason')
        ->nullable()
        ->comment('Reason if verification failed');

      // QR Code
      $table->text('qr_code_data')
        ->nullable()
        ->comment('QR code data for this verification');

      $table->text('qr_code_image')
        ->nullable()
        ->comment('QR code image for this verification');

      // Audit
      $table->timestamp('verified_at')
        ->nullable()
        ->comment('When verification occurred');

      $table->string('ip_address')
        ->nullable()
        ->comment('IP address of the request');

      $table->text('user_agent')
        ->nullable()
        ->comment('User agent of the request');

      $table->json('metadata')
        ->nullable()
        ->comment('Additional metadata');

      $table->timestamps();

      // Indexes
      $table->index('signature_specimen_id');
      $table->index('user_id');
      $table->index('verification_status');
      $table->index('document_type');
      $table->index('document_id');
      $table->index('document_reference');
      $table->index(['document_type', 'document_id']);
      $table->index('created_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('signature_verifications');
  }
};
