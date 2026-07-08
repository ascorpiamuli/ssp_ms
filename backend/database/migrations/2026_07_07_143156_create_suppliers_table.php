<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('suppliers', function (Blueprint $table) {
      $table->id();

      // Company information
      $table->foreignId('user_id')->constrained()->cascadeOnDelete();
      $table->string('company_name');
      $table->string('company_email')->unique();
      $table->string('company_phone')->nullable();
      $table->string('company_registration')->unique();
      $table->text('company_address');
      $table->string('company_website')->nullable();
      $table->string('tax_id')->nullable();
      $table->enum('category', ['goods', 'services', 'both'])->default('goods');

      // Supplier status
      $table->enum('status', ['ACTIVE', 'INACTIVE', 'BLACKLISTED'])->default('ACTIVE');
      $table->text('blacklist_reason')->nullable();
      $table->foreignId('blacklisted_by')->nullable()->constrained('users')->nullOnDelete();
      $table->timestamp('blacklisted_at')->nullable();

      // Metadata
      $table->foreignId('created_by')->constrained('users');
      $table->timestamps();

      // Indexes
      $table->index('company_email');
      $table->index('company_registration');
      $table->index('status');
      $table->index('category');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('suppliers');
  }
};
