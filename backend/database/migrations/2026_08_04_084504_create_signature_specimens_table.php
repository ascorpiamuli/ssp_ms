<?php
// database/migrations/2026_08_04_000000_create_signature_specimens_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('signature_specimens', function (Blueprint $table) {
      $table->id();

      // Foreign key to users table
      $table->foreignId('user_id')
        ->constrained('users')
        ->onDelete('cascade')
        ->comment('The user who owns this signature');

      // Signature image storage
      $table->string('signature_image_path')
        ->nullable()
        ->comment('Path to the uploaded signature image');

      $table->string('signature_image_url')
        ->nullable()
        ->comment('URL of the signature image');

      // Signature metadata
      $table->string('signature_hash')
        ->nullable()
        ->comment('Hash of the signature image for verification');

      // QR Code for signature verification
      $table->text('qr_code_data')
        ->nullable()
        ->comment('JSON data encoded in the QR code');

      $table->text('qr_code_image')
        ->nullable()
        ->comment('Base64 or URL of the QR code image');

      $table->string('qr_code_hash')
        ->nullable()
        ->comment('Hash of the QR code for verification');

      // Verification status
      $table->boolean('is_verified')
        ->default(false)
        ->comment('Whether this signature has been verified');

      $table->timestamp('verified_at')
        ->nullable()
        ->comment('When the signature was verified');

      $table->foreignId('verified_by')
        ->nullable()
        ->constrained('users')
        ->nullOnDelete()
        ->comment('Who verified this signature');

      // Verification metadata
      $table->text('verification_notes')
        ->nullable()
        ->comment('Notes about the verification process');

      $table->string('verification_method')
        ->nullable()
        ->default('manual')
        ->comment('Method used for verification (manual/automated)');

      // Status
      $table->enum('status', [
        'pending',
        'approved',
        'rejected',
        'expired'
      ])->default('pending')
        ->comment('Status of the signature specimen');

      // Audit fields
      $table->string('ip_address')
        ->nullable()
        ->comment('IP address when signature was uploaded');

      $table->text('user_agent')
        ->nullable()
        ->comment('User agent when signature was uploaded');

      $table->json('metadata')
        ->nullable()
        ->comment('Additional metadata for the signature');

      // Soft delete
      $table->softDeletes();

      $table->timestamps();

      // Indexes for performance
      $table->index('user_id');
      $table->index('is_verified');
      $table->index('status');
      $table->index(['user_id', 'is_verified']);
      $table->index('created_at');

      // Ensure one verified signature per user
      // $table->unique(['user_id', 'is_verified'])->where('is_verified', true);
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('signature_specimens');
  }
};
