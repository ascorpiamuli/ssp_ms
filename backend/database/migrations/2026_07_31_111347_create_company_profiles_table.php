<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_company_profiles_table.php

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
    Schema::create('company_profiles', function (Blueprint $table) {
      $table->id();

      // Company Basic Information
      $table->string('company_name');
      $table->string('company_email')->unique();
      $table->string('company_phone')->nullable();
      $table->text('company_address')->nullable();
      $table->string('company_website')->nullable();

      // Registration & Identification
      $table->string('registration_number')->nullable();
      $table->string('tax_id')->nullable();
      $table->string('license_number')->nullable();

      // Company Details
      $table->string('industry')->nullable();
      $table->string('company_size')->nullable(); // Small, Medium, Large, Enterprise
      $table->integer('employee_count')->nullable();
      $table->string('annual_revenue')->nullable();
      $table->string('established_year')->nullable();
      $table->text('description')->nullable();

      // Branding & Design
      $table->string('company_logo')->nullable();
      $table->unsignedBigInteger('company_logo_upload_id')->nullable();
      $table->string('favicon')->nullable();
      $table->string('primary_color')->default('#1a237e');
      $table->string('secondary_color')->default('#3498db');
      $table->string('accent_color')->default('#ffc107');
      $table->string('font_family')->default('Inter');

      // Contact Information
      $table->string('contact_person_name')->nullable();
      $table->string('contact_person_email')->nullable();
      $table->string('contact_person_phone')->nullable();

      // Social Media Links
      $table->string('facebook_url')->nullable();
      $table->string('twitter_url')->nullable();
      $table->string('linkedin_url')->nullable();
      $table->string('instagram_url')->nullable();
      $table->string('youtube_url')->nullable();

      // System Settings
      $table->string('timezone')->default('Africa/Nairobi');
      $table->string('currency')->default('KES');
      $table->string('date_format')->default('d M Y');
      $table->string('time_format')->default('H:i');
      $table->boolean('is_active')->default(true);

      // Metadata
      $table->json('metadata')->nullable();
      $table->timestamps();
      $table->softDeletes();

      // Indexes
      $table->index('company_name');
      $table->index('company_email');
      $table->index('industry');
      $table->index('is_active');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('company_profiles');
  }
};
