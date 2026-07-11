<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RolesAndPermissionsSeeder extends Seeder
{
  public function run(): void
  {
    // ============================================
    // CLEAR EXISTING DATA
    // ============================================

    $this->command->info('🧹 Clearing existing roles and permissions...');

    // Disable foreign key checks
    DB::statement('SET FOREIGN_KEY_CHECKS=0');

    // Truncate tables in correct order
    DB::table('role_has_permissions')->truncate();
    DB::table('model_has_roles')->truncate();
    DB::table('model_has_permissions')->truncate();
    DB::table('roles')->truncate();
    DB::table('permissions')->truncate();

    // Re-enable foreign key checks
    DB::statement('SET FOREIGN_KEY_CHECKS=1');

    $this->command->info('✅ All existing roles and permissions cleared.');

    // ============================================
    // CREATE PERMISSIONS WITH WEB GUARD
    // ============================================

    $this->command->info('📝 Creating permissions with web guard...');

    $permissions = [
      // REQUISITION PERMISSIONS
      'create_requisitions',
      'view_own_requisitions',
      'view_department_requisitions',
      'view_all_requisitions',
      'edit_requisitions',
      'delete_requisitions',
      'submit_requisitions',
      'cancel_requisitions',
      'approve_level_1_hod',
      'approve_level_2_accountant',
      'approve_level_3_principal',
      'approve_level_4_final',
      'decline_requisitions',
      'return_requisitions',
      'fast_track_emergency',

      // SUPPLIER PERMISSIONS
      'view_suppliers',
      'create_suppliers',
      'edit_suppliers',
      'delete_suppliers',
      'manage_suppliers',
      'blacklist_suppliers',

      // QUOTATION PERMISSIONS
      'view_quotations',
      'create_quotations',
      'edit_quotations',
      'delete_quotations',
      'send_quotations',
      'receive_quotations',
      'respond_quotations',
      'select_supplier',

      // LPO/LSO PERMISSIONS
      'view_purchase_orders',
      'create_lpo',
      'create_lso',
      'approve_lpo',
      'approve_lso',

      // GRN/SAN PERMISSIONS
      'view_grn_san',
      'create_grn',
      'create_san',
      'approve_grn',
      'approve_san',

      // INVOICE PERMISSIONS
      'view_invoices',
      'create_invoices',
      'verify_invoices',
      'send_back_invoices',

      // PAYMENT VOUCHER PERMISSIONS
      'view_payment_vouchers',
      'create_payment_vouchers',
      'endorse_payment_vouchers',
      'approve_payment_vouchers',

      // CHEQUE PERMISSIONS
      'view_cheques',
      'record_cheques',
      'update_cheque_status',

      // USER & DEPARTMENT PERMISSIONS
      'view_users',
      'create_users',
      'edit_users',
      'delete_users',
      'approve_users',
      'assign_roles',
      'view_departments',
      'create_departments',
      'edit_departments',
      'delete_departments',

      // SYSTEM PERMISSIONS
      'view_reports',
      'export_reports',
      'view_audit_logs',
      'manage_settings',
      'manage_backup',
    ];

    foreach ($permissions as $permission) {
      Permission::create(['name' => $permission, 'guard_name' => 'web']);
    }

    $this->command->info('✅ ' . count($permissions) . ' permissions created with web guard.');

    // ============================================
    // CREATE ROLES AND ASSIGN PERMISSIONS
    // ============================================

    $this->command->info('👤 Creating roles with web guard...');

    // 1. ADMIN
    $adminRole = Role::create(['name' => 'ADMIN', 'guard_name' => 'web']);
    $adminRole->givePermissionTo(Permission::all());
    $this->command->info('✅ ADMIN role created.');

    // 2. STAFF
    $staffRole = Role::create(['name' => 'STAFF', 'guard_name' => 'web']);
    $staffRole->givePermissionTo([
      'create_requisitions',
      'view_own_requisitions',
      'edit_requisitions',
      'delete_requisitions',
      'submit_requisitions',
      'cancel_requisitions',
      'create_grn',
      'view_grn_san',
    ]);
    $this->command->info('✅ STAFF role created.');

    // 3. HOD - IMPORTANT: This is the role we need!
    $hodRole = Role::create(['name' => 'HOD', 'guard_name' => 'web']);
    $hodRole->givePermissionTo([
      'create_requisitions',
      'view_own_requisitions',
      'view_department_requisitions',
      'edit_requisitions',
      'submit_requisitions',
      'approve_level_1_hod',
      'decline_requisitions',
      'return_requisitions',
      'view_reports',
      'create_grn',
      'view_grn_san',
      'approve_grn',
      'approve_san',
      'view_departments',
    ]);
    $this->command->info('✅ HOD role created.');

    // 4. ACCOUNTANT
    $accountantRole = Role::create(['name' => 'ACCOUNTANT', 'guard_name' => 'web']);
    $accountantRole->givePermissionTo([
      'view_own_requisitions',
      'view_department_requisitions',
      'view_all_requisitions',
      'approve_level_2_accountant',
      'decline_requisitions',
      'return_requisitions',
      'manage_suppliers',
      'view_suppliers',
      'view_quotations',
      'create_quotations',
      'view_purchase_orders',
      'create_lpo',
      'create_lso',
      'view_grn_san',
      'create_grn',
      'view_invoices',
      'verify_invoices',
      'send_back_invoices',
      'create_payment_vouchers',
      'view_payment_vouchers',
      'record_cheques',
      'view_cheques',
      'view_reports',
      'export_reports',
    ]);
    $this->command->info('✅ ACCOUNTANT role created.');

    // 5. PRINCIPAL
    $principalRole = Role::create(['name' => 'PRINCIPAL', 'guard_name' => 'web']);
    $principalRole->givePermissionTo([
      'view_own_requisitions',
      'view_department_requisitions',
      'view_all_requisitions',
      'approve_level_3_principal',
      'decline_requisitions',
      'return_requisitions',
      'fast_track_emergency',
      'manage_suppliers',
      'view_suppliers',
      'view_quotations',
      'create_quotations',
      'view_purchase_orders',
      'create_lpo',
      'create_lso',
      'approve_lpo',
      'approve_lso',
      'view_grn_san',
      'create_grn',
      'approve_grn',
      'approve_san',
      'view_invoices',
      'endorse_payment_vouchers',
      'view_reports',
      'export_reports',
    ]);
    $this->command->info('✅ PRINCIPAL role created.');

    // 6. FINAL_APPROVER
    $finalApproverRole = Role::create(['name' => 'FINAL_APPROVER', 'guard_name' => 'web']);
    $finalApproverRole->givePermissionTo([
      'view_department_requisitions',
      'view_all_requisitions',
      'approve_level_4_final',
      'decline_requisitions',
      'return_requisitions',
      'fast_track_emergency',
      'manage_suppliers',
      'view_suppliers',
      'view_quotations',
      'view_purchase_orders',
      'create_lpo',
      'create_lso',
      'approve_lpo',
      'approve_lso',
      'view_grn_san',
      'create_grn',
      'view_invoices',
      'endorse_payment_vouchers',
      'approve_payment_vouchers',
      'view_reports',
      'export_reports',
    ]);
    $this->command->info('✅ FINAL_APPROVER role created.');

    // 7. PROCUREMENT
    $procurementRole = Role::create(['name' => 'PROCUREMENT', 'guard_name' => 'web']);
    $procurementRole->givePermissionTo([
      'view_own_requisitions',
      'view_department_requisitions',
      'view_all_requisitions',
      'manage_suppliers',
      'view_suppliers',
      'create_suppliers',
      'edit_suppliers',
      'delete_suppliers',
      'blacklist_suppliers',
      'view_quotations',
      'create_quotations',
      'edit_quotations',
      'delete_quotations',
      'send_quotations',
      'receive_quotations',
      'select_supplier',
      'view_purchase_orders',
      'create_lpo',
      'create_lso',
      'approve_lpo',
      'approve_lso',
      'view_grn_san',
      'create_grn',
      'view_reports',
      'export_reports',
    ]);
    $this->command->info('✅ PROCUREMENT role created.');

    // 8. SUPPLIER
    $supplierRole = Role::create(['name' => 'SUPPLIER', 'guard_name' => 'web']);
    $supplierRole->givePermissionTo([
      'view_quotations',
      'respond_quotations',
      'receive_quotations',
      'create_invoices',
      'view_purchase_orders',
      'view_grn_san',
    ]);
    $this->command->info('✅ SUPPLIER role created.');

    // 9. AUDITOR
    $auditorRole = Role::create(['name' => 'AUDITOR', 'guard_name' => 'web']);
    $auditorRole->givePermissionTo([
      'view_all_requisitions',
      'view_suppliers',
      'view_quotations',
      'view_purchase_orders',
      'view_grn_san',
      'view_invoices',
      'view_payment_vouchers',
      'view_cheques',
      'view_reports',
      'export_reports',
      'view_audit_logs',
    ]);
    $this->command->info('✅ AUDITOR role created.');

    $this->command->info('✅ All 9 roles created with web guard.');

    // ============================================
    // CREATE SUPER ADMIN USER
    // ============================================

    $this->command->info('👤 Creating Super Admin user...');

    // Check if admin exists
    $adminUser = User::where('email', 'admin@sspms.com')->first();

    if ($adminUser) {
      $adminUser->update([
        'first_name' => 'System',
        'last_name' => 'Administrator',
        'phone' => '+254700000000',
        'is_active' => true,
        'is_approved' => true,
        'approved_at' => now(),
        'timezone' => 'Africa/Nairobi',
      ]);
      $this->command->info('✅ Existing admin user updated.');
    } else {
      $adminUser = User::create([
        'first_name' => 'System',
        'last_name' => 'Administrator',
        'email' => 'admin@sspms.com',
        'password' => bcrypt('Admin@2024'),
        'phone' => '+254700000000',
        'is_active' => true,
        'is_approved' => true,
        'approved_at' => now(),
        'timezone' => 'Africa/Nairobi',
      ]);
      $this->command->info('✅ New admin user created.');
    }

    $adminUser->assignRole('ADMIN');
    $this->command->info('✅ ADMIN role assigned to admin user.');

    // ============================================
    // SUMMARY
    // ============================================

    $this->command->info('============================================');
    $this->command->info('✅ Seeding completed successfully!');
    $this->command->info('📊 Summary:');
    $this->command->info('   - ' . count($permissions) . ' permissions created (web guard)');
    $this->command->info('   - 9 roles created (web guard)');
    $this->command->info('   - HOD role exists in web guard');
    $this->command->info('============================================');
  }
}
