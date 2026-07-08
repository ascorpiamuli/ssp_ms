<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolesAndPermissionsSeeder extends Seeder
{
  public function run(): void
  {
    // Reset cached roles and permissions
    app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

    // ============================================
    // CREATE PERMISSIONS
    // ============================================

    $permissions = [
      // ============================================
      // REQUISITION PERMISSIONS
      // ============================================
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

      // ============================================
      // SUPPLIER PERMISSIONS
      // ============================================
      'view_suppliers',
      'create_suppliers',
      'edit_suppliers',
      'delete_suppliers',
      'manage_suppliers',
      'blacklist_suppliers',

      // ============================================
      // QUOTATION PERMISSIONS
      // ============================================
      'view_quotations',
      'create_quotations',
      'edit_quotations',
      'delete_quotations',
      'send_quotations',
      'receive_quotations',
      'respond_quotations',
      'select_supplier',

      // ============================================
      // LPO/LSO PERMISSIONS
      // ============================================
      'view_purchase_orders',
      'create_lpo',
      'create_lso',
      'approve_lpo',
      'approve_lso',

      // ============================================
      // GRN/SAN PERMISSIONS
      // ============================================
      'view_grn_san',
      'create_grn',
      'create_san',
      'approve_grn',
      'approve_san',

      // ============================================
      // INVOICE PERMISSIONS
      // ============================================
      'view_invoices',
      'create_invoices',
      'verify_invoices',
      'send_back_invoices',

      // ============================================
      // PAYMENT VOUCHER PERMISSIONS
      // ============================================
      'view_payment_vouchers',
      'create_payment_vouchers',
      'endorse_payment_vouchers',
      'approve_payment_vouchers',

      // ============================================
      // CHEQUE PERMISSIONS
      // ============================================
      'view_cheques',
      'record_cheques',
      'update_cheque_status',

      // ============================================
      // USER & DEPARTMENT PERMISSIONS
      // ============================================
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

      // ============================================
      // SYSTEM PERMISSIONS
      // ============================================
      'view_reports',
      'export_reports',
      'view_audit_logs',
      'manage_settings',
      'manage_backup',
    ];

    foreach ($permissions as $permission) {
      Permission::create(['name' => $permission, 'guard_name' => 'api']);
    }

    // ============================================
    // CREATE ROLES AND ASSIGN PERMISSIONS
    // ============================================

    // 1. ADMIN - Full system access
    $adminRole = Role::create(['name' => 'ADMIN', 'guard_name' => 'api']);
    $adminRole->givePermissionTo(Permission::all());

    // 2. STAFF - Can create and view own requisitions
    $staffRole = Role::create(['name' => 'STAFF', 'guard_name' => 'api']);
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

    // 3. HOD - Department head with approval powers
    $hodRole = Role::create(['name' => 'HOD', 'guard_name' => 'api']);
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

    // 4. ACCOUNTANT - Budget authority
    $accountantRole = Role::create(['name' => 'ACCOUNTANT', 'guard_name' => 'api']);
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

    // 5. PRINCIPAL - Level 3 approval
    $principalRole = Role::create(['name' => 'PRINCIPAL', 'guard_name' => 'api']);
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

    // 6. FINAL_APPROVER - Level 4 approval
    $finalApproverRole = Role::create(['name' => 'FINAL_APPROVER', 'guard_name' => 'api']);
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

    // 7. PROCUREMENT - Supplier and quotation management
    $procurementRole = Role::create(['name' => 'PROCUREMENT', 'guard_name' => 'api']);
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

    // 8. SUPPLIER - External vendor
    $supplierRole = Role::create(['name' => 'SUPPLIER', 'guard_name' => 'api']);
    $supplierRole->givePermissionTo([
      'view_quotations',
      'respond_quotations',
      'receive_quotations',
      'create_invoices',
      'view_purchase_orders',
      'view_grn_san',
    ]);

    // 9. AUDITOR - Read-only access
    $auditorRole = Role::create(['name' => 'AUDITOR', 'guard_name' => 'api']);
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

    // ============================================
    // CREATE SUPER ADMIN USER
    // ============================================

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

    $adminUser->assignRole('ADMIN');
  }
}
