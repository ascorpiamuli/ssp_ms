<?php

namespace App\Services\Supplier;

use App\Services\BaseService;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Upload;
use App\Models\UserActivityLog;
use App\Services\UploadService;
use App\Services\Admin\AuditLogService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class SupplierService extends BaseService
{
  protected UploadService $uploadService;
  protected AuditLogService $auditLogService;

  public function __construct(
    UploadService $uploadService,
    AuditLogService $auditLogService
  ) {
    $this->uploadService = $uploadService;
    $this->auditLogService = $auditLogService;
  }

  /**
   * Get all suppliers with filters.
   */
  public function getAll(array $filters = [])
  {
    $query = Supplier::with(['user', 'creator', 'blacklistedBy', 'companyLogoUpload']);

    if (isset($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (isset($filters['category'])) {
      $query->where('category', $filters['category']);
    }

    if (isset($filters['search'])) {
      $query->where(function ($q) use ($filters) {
        $q->where('company_name', 'LIKE', "%{$filters['search']}%")
          ->orWhere('company_email', 'LIKE', "%{$filters['search']}%")
          ->orWhere('company_registration', 'LIKE', "%{$filters['search']}%");
      });
    }

    return $query->orderBy('company_name')->get();
  }

  /**
   * Get active suppliers.
   */
  public function getActive()
  {
    return Supplier::with('user')
      ->where('status', 'ACTIVE')
      ->orderBy('company_name')
      ->get();
  }

  /**
   * Get supplier by ID.
   */
  public function getById(int $id): ?Supplier
  {
    return Supplier::with(['user', 'creator', 'blacklistedBy', 'companyLogoUpload'])->find($id);
  }

  /**
   * Get supplier by user ID.
   */
  public function getByUserId(int $userId): ?Supplier
  {
    return Supplier::with(['user', 'creator', 'blacklistedBy', 'companyLogoUpload'])
      ->where('user_id', $userId)
      ->first();
  }

  /**
   * Get supplier by email.
   */
  public function getByEmail(string $email): ?Supplier
  {
    return Supplier::where('company_email', $email)->first();
  }

  /**
   * Create a new supplier.
   */
  public function create(array $data): Supplier
  {
    return DB::transaction(function () use ($data) {
      Log::info('[SupplierService] Creating supplier', [
        'data' => $data,
        'has_logo' => isset($data['company_logo']) && $data['company_logo'] instanceof UploadedFile,
      ]);

      // Create user account if not exists
      $userId = $data['user_id'] ?? null;

      if (!$userId) {
        // Check if user already exists by email
        $existingUser = User::where('email', $data['company_email'])->first();

        if ($existingUser) {
          $userId = $existingUser->id;
          Log::info('[SupplierService] Using existing user', [
            'user_id' => $userId,
            'email' => $data['company_email'],
          ]);
        } else {
          $user = $this->createSupplierUser($data);
          $userId = $user->id;
          Log::info('[SupplierService] Created new user', [
            'user_id' => $userId,
            'email' => $data['company_email'],
          ]);
        }
      }

      // Prepare supplier data with proper null handling
      $supplierData = [
        'user_id' => $userId,
        'company_name' => $data['company_name'],
        'company_email' => $data['company_email'],
        'company_phone' => $this->nullIfEmpty($data['company_phone'] ?? null),
        'company_registration' => $data['company_registration'],
        'company_address' => $data['company_address'],
        'company_website' => $this->nullIfEmpty($data['company_website'] ?? null),
        'tax_id' => $this->nullIfEmpty($data['tax_id'] ?? null),
        'category' => $data['category'],
        'status' => 'ACTIVE',
        'created_by' => auth()->id(),
        'description' => $this->nullIfEmpty($data['description'] ?? null),
        'established_year' => $this->nullIfEmpty($data['established_year'] ?? null),
        'employee_count' => $this->nullIfEmpty($data['employee_count'] ?? null),
        'annual_revenue' => $this->nullIfEmpty($data['annual_revenue'] ?? null),
        'certifications' => $this->nullIfEmpty($data['certifications'] ?? null),
        'registration_date' => $this->nullIfEmpty($data['registration_date'] ?? null),
        'license_number' => $this->nullIfEmpty($data['license_number'] ?? null),
        'bank_name' => $this->nullIfEmpty($data['bank_name'] ?? null),
        'bank_account' => $this->nullIfEmpty($data['bank_account'] ?? null),
        'bank_branch' => $this->nullIfEmpty($data['bank_branch'] ?? null),
        'payment_terms' => $this->nullIfEmpty($data['payment_terms'] ?? null),
        'preferred_currency' => $data['preferred_currency'] ?? 'KES',
        'contact_person_name' => $this->nullIfEmpty($data['contact_person_name'] ?? null),
        'contact_person_email' => $this->nullIfEmpty($data['contact_person_email'] ?? null),
        'contact_person_phone' => $this->nullIfEmpty($data['contact_person_phone'] ?? null),
      ];

      // Handle company logo upload - similar to avatar upload
      $upload = null;
      if (isset($data['company_logo']) && $data['company_logo'] instanceof UploadedFile) {
        Log::info('[SupplierService] Uploading company logo', [
          'file_name' => $data['company_logo']->getClientOriginalName(),
          'file_size' => $data['company_logo']->getSize(),
        ]);

        // Upload the logo using UploadService
        $upload = $this->uploadService->upload(
          $data['company_logo'],                              // File
          null,                                               // Model (will be attached after creation)
          'company_logo',                                     // Collection
          $data['company_name'] . ' Logo',                   // Title
          'Company logo for ' . $data['company_name'],       // Description
          [                                                   // Metadata
            'uploaded_from' => 'supplier_creation',
            'company_id' => $data['company_name'],
          ]
        );

        // Set the logo URL and upload ID
        $supplierData['company_logo'] = $upload->file_url;
        $supplierData['company_logo_upload_id'] = $upload->id;

        Log::info('[SupplierService] Logo uploaded successfully', [
          'upload_id' => $upload->id,
          'file_url' => $upload->file_url,
        ]);
      }

      Log::info('[SupplierService] Supplier data prepared', [
        'supplier_data' => $supplierData,
      ]);

      // Create the supplier
      $supplier = Supplier::create($supplierData);

      // Audit: Log supplier creation
      $this->auditLogService->logModelCreated(
        $supplier,
        "Supplier created: {$supplier->company_name}"
      );

      // Associate the upload with the supplier
      if ($upload) {
        $this->uploadService->attachToModel($upload, $supplier);
        Log::info('[SupplierService] Logo attached to supplier', [
          'supplier_id' => $supplier->id,
          'upload_id' => $upload->id,
        ]);
      }

      // Log activity
      $this->logActivity($supplier, 'CREATED', 'Supplier created');

      return $supplier->fresh();
    });
  }

  /**
   * Create supplier user account.
   */
  protected function createSupplierUser(array $data): User
  {
    $password = $data['password'] ?? 'Supplier@123';

    $user = User::create([
      'first_name' => $data['contact_person_first_name'] ?? 'Supplier',
      'last_name' => $data['contact_person_last_name'] ?? 'Account',
      'email' => $data['company_email'],
      'phone' => $data['company_phone'] ?? null,
      'password' => Hash::make($password),
      'role' => 'SUPPLIER',
      'is_active' => true,
      'is_approved' => true,
      'approved_at' => now(),
      'timezone' => 'Africa/Nairobi',
    ]);

    $user->assignRole('SUPPLIER');

    return $user;
  }

  /**
   * Update a supplier.
   * Now properly handles all fields including null values and company logo.
   */
  public function update(int $id, array $data): Supplier
  {
    $supplier = Supplier::findOrFail($id);

    Log::info('[SupplierService] Updating supplier', [
      'supplier_id' => $id,
      'data_received' => $data,
      'has_logo' => isset($data['company_logo']) && $data['company_logo'] instanceof UploadedFile,
    ]);

    // Build update array with proper null handling
    $updateData = [];

    // Use array_key_exists to properly handle null values
    $fieldMapping = [
      'company_name' => null,
      'company_email' => null,
      'company_phone' => null,
      'company_registration' => null,
      'company_address' => null,
      'company_website' => null,
      'tax_id' => null,
      'category' => null,
      'description' => null,
      'established_year' => null,
      'employee_count' => null,
      'annual_revenue' => null,
      'certifications' => null,
      'registration_date' => null,
      'license_number' => null,
      'bank_name' => null,
      'bank_account' => null,
      'bank_branch' => null,
      'payment_terms' => null,
      'preferred_currency' => null,
      'contact_person_name' => null,
      'contact_person_email' => null,
      'contact_person_phone' => null,
    ];

    foreach ($fieldMapping as $field => $default) {
      if (array_key_exists($field, $data)) {
        $value = $data[$field];
        // Convert empty strings to null
        $updateData[$field] = $this->nullIfEmpty($value);
        Log::info("[SupplierService] Setting field: {$field} = " . ($updateData[$field] ?? 'null'));
      }
    }

    Log::info('[SupplierService] Update data prepared', [
      'supplier_id' => $id,
      'update_data' => $updateData,
    ]);

    // Handle company logo upload - similar to avatar upload
    if (isset($data['company_logo']) && $data['company_logo'] instanceof UploadedFile) {
      Log::info('[SupplierService] Updating company logo', [
        'supplier_id' => $id,
        'file_name' => $data['company_logo']->getClientOriginalName(),
        'file_size' => $data['company_logo']->getSize(),
      ]);

      // Delete old logo if exists
      if ($supplier->company_logo_upload_id) {
        $oldUpload = Upload::find($supplier->company_logo_upload_id);
        if ($oldUpload) {
          $this->uploadService->delete($oldUpload);
          Log::info('[SupplierService] Deleted old logo', [
            'upload_id' => $oldUpload->id,
            'file_url' => $oldUpload->file_url,
          ]);
        }
      }

      // Upload the new logo
      $upload = $this->uploadService->upload(
        $data['company_logo'],                                      // File
        $supplier,                                                 // Model (attach directly)
        'company_logo',                                            // Collection
        ($data['company_name'] ?? $supplier->company_name) . ' Logo', // Title
        'Company logo for ' . ($data['company_name'] ?? $supplier->company_name), // Description
        [                                                          // Metadata
          'uploaded_from' => 'supplier_update',
          'company_id' => $supplier->id,
          'previous_logo_upload_id' => $supplier->company_logo_upload_id,
        ]
      );

      // Set the new logo data
      $updateData['company_logo'] = $upload->file_url;
      $updateData['company_logo_upload_id'] = $upload->id;

      Log::info('[SupplierService] New logo uploaded successfully', [
        'upload_id' => $upload->id,
        'file_url' => $upload->file_url,
      ]);
    }

    // Perform the update
    $oldValues = $supplier->toArray();
    $supplier->update($updateData);

    // Audit: Log supplier update
    $this->auditLogService->logModelUpdated(
      $supplier,
      $oldValues,
      "Supplier updated: {$supplier->company_name}"
    );

    Log::info('[SupplierService] Supplier updated successfully', [
      'supplier_id' => $supplier->id,
      'updated_fields' => array_keys($updateData),
    ]);

    // Update user if needed (for contact person)
    if (array_key_exists('contact_person_first_name', $data) || array_key_exists('contact_person_last_name', $data)) {
      $user = User::find($supplier->user_id);
      if ($user) {
        $userUpdateData = [];
        if (array_key_exists('contact_person_first_name', $data)) {
          $userUpdateData['first_name'] = $data['contact_person_first_name'];
        }
        if (array_key_exists('contact_person_last_name', $data)) {
          $userUpdateData['last_name'] = $data['contact_person_last_name'];
        }
        if (!empty($userUpdateData)) {
          $user->update($userUpdateData);
          Log::info('[SupplierService] User updated', [
            'user_id' => $user->id,
            'update_data' => $userUpdateData,
          ]);
        }
      }
    }

    // Log activity
    $this->logActivity($supplier, 'UPDATED', 'Supplier updated');

    return $supplier->fresh();
  }

  /**
   * Helper function to convert empty strings to null.
   */
  protected function nullIfEmpty($value)
  {
    if ($value === '' || $value === 'null') {
      return null;
    }
    return $value;
  }

  /**
   * Blacklist a supplier.
   */
  public function blacklist(int $id, string $reason): Supplier
  {
    $supplier = Supplier::findOrFail($id);

    $oldValues = $supplier->toArray();
    $supplier->update([
      'status' => 'BLACKLISTED',
      'blacklist_reason' => $reason,
      'blacklisted_by' => auth()->id(),
      'blacklisted_at' => now(),
    ]);

    // Audit: Log supplier blacklist
    $this->auditLogService->logModelUpdated(
      $supplier,
      $oldValues,
      "Supplier blacklisted: {$supplier->company_name} - Reason: {$reason}"
    );

    // Deactivate user account
    $user = User::find($supplier->user_id);
    if ($user) {
      $user->update(['is_active' => false]);
    }

    $this->logActivity($supplier, 'BLACKLISTED', "Supplier blacklisted: {$reason}");

    return $supplier;
  }

  /**
   * Remove from blacklist.
   */
  public function unblacklist(int $id): Supplier
  {
    $supplier = Supplier::findOrFail($id);

    $oldValues = $supplier->toArray();
    $supplier->update([
      'status' => 'ACTIVE',
      'blacklist_reason' => null,
      'blacklisted_by' => null,
      'blacklisted_at' => null,
    ]);

    // Audit: Log supplier unblacklist
    $this->auditLogService->logModelUpdated(
      $supplier,
      $oldValues,
      "Supplier removed from blacklist: {$supplier->company_name}"
    );

    // Reactivate user account
    $user = User::find($supplier->user_id);
    if ($user) {
      $user->update(['is_active' => true]);
    }

    $this->logActivity($supplier, 'UNBLACKLISTED', 'Supplier removed from blacklist');

    return $supplier;
  }

  /**
   * Delete/Deactivate supplier.
   */
  public function delete(int $id): void
  {
    $supplier = Supplier::findOrFail($id);

    $oldValues = $supplier->toArray();
    $supplier->update(['status' => 'INACTIVE']);

    // Audit: Log supplier deactivation
    $this->auditLogService->logModelUpdated(
      $supplier,
      $oldValues,
      "Supplier deactivated: {$supplier->company_name}"
    );

    $this->logActivity($supplier, 'DELETED', 'Supplier deactivated');
  }

  /**
   * Activate supplier.
   */
  public function activate(int $id): void
  {
    $supplier = Supplier::findOrFail($id);

    $oldValues = $supplier->toArray();
    $supplier->update(['status' => 'ACTIVE']);

    // Audit: Log supplier activation
    $this->auditLogService->logModelUpdated(
      $supplier,
      $oldValues,
      "Supplier activated: {$supplier->company_name}"
    );

    $this->logActivity($supplier, 'ACTIVATED', 'Supplier activated');
  }

  /**
   * Get supplier statistics.
   */
  public function getStats(): array
  {
    return [
      'total' => Supplier::count(),
      'active' => Supplier::where('status', 'ACTIVE')->count(),
      'inactive' => Supplier::where('status', 'INACTIVE')->count(),
      'blacklisted' => Supplier::where('status', 'BLACKLISTED')->count(),
      'by_category' => Supplier::selectRaw('category, count(*) as count')
        ->groupBy('category')
        ->get()
        ->pluck('count', 'category')
        ->toArray(),
    ];
  }

  /**
   * Log activity.
   */
  protected function logActivity($supplier, string $action, string $description): void
  {
    // This method is now deprecated - using AuditLogService
    // Keeping for backward compatibility
    try {
      $this->auditLogService->logUserAction(
        auth()->id(),
        $action,
        'SUPPLIER',
        $description . ' - Supplier: ' . $supplier->company_name,
        ['supplier_id' => $supplier->id]
      );
    } catch (\Exception $e) {
      Log::warning('Failed to log supplier activity: ' . $e->getMessage());
    }
  }
}
