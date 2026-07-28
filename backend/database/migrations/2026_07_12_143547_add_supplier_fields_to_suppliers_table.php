// database/migrations/2026_07_12_150000_add_supplier_fields_to_suppliers_table.php

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
    Schema::table('suppliers', function (Blueprint $table) {
      // Company details
      $table->text('description')->nullable()->after('category');
      $table->string('established_year', 4)->nullable()->after('description');
      $table->string('employee_count')->nullable()->after('established_year');
      $table->string('annual_revenue')->nullable()->after('employee_count');
      $table->string('certifications')->nullable()->after('annual_revenue');
      $table->date('registration_date')->nullable()->after('certifications');
      $table->string('license_number')->nullable()->after('registration_date');

      // Banking information
      $table->string('bank_name')->nullable()->after('license_number');
      $table->string('bank_account')->nullable()->after('bank_name');
      $table->string('bank_branch')->nullable()->after('bank_account');
      $table->string('payment_terms')->nullable()->after('bank_branch');
      $table->string('preferred_currency')->default('KES')->after('payment_terms');

      // Contact person
      $table->string('contact_person_name')->nullable()->after('preferred_currency');
      $table->string('contact_person_email')->nullable()->after('contact_person_name');
      $table->string('contact_person_phone')->nullable()->after('contact_person_email');

      // Company logo
      $table->string('company_logo')->nullable()->after('contact_person_phone');
      $table->foreignId('company_logo_upload_id')->nullable()->after('company_logo')
        ->constrained('uploads')
        ->nullOnDelete();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('suppliers', function (Blueprint $table) {
      $table->dropForeign(['company_logo_upload_id']);
      $table->dropColumn([
        'description',
        'established_year',
        'employee_count',
        'annual_revenue',
        'certifications',
        'registration_date',
        'license_number',
        'bank_name',
        'bank_account',
        'bank_branch',
        'payment_terms',
        'preferred_currency',
        'contact_person_name',
        'contact_person_email',
        'contact_person_phone',
        'company_logo',
        'company_logo_upload_id',
      ]);
    });
  }
};
