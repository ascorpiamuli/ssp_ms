<?php

namespace App\Services\Supplier;

use App\Services\BaseService;
use App\Models\Supplier;
use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class SupplierService extends BaseService
{
  /**
   * Get all suppliers with filters.
   */
  public function getAll(array $filters = [])
  {
    $query = Supplier::with(['user', 'creator', 'blacklistedBy']);

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
    return Supplier::with(['user', 'creator', 'blacklistedBy'])->find($id);
  }

  /**
   * Get supplier by user ID.
   */
  public function getByUserId(int $userId): ?Supplier
  {
    return Supplier::where('user_id', $userId)->first();
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
      // Create user account if not exists
      $userId = $data['user_id'] ?? null;

      if (!$userId) {
        $user = $this->createSupplierUser($data);
        $userId = $user->id;
      }

      $supplier = Supplier::create([
        'user_id' => $userId,
        'company_name' => $data['company_name'],
        'company_email' => $data['company_email'],
        'company_phone' => $data['company_phone'] ?? null,
        'company_registration' => $data['company_registration'],
        'company_address' => $data['company_address'],
        'company_website' => $data['company_website'] ?? null,
        'tax_id' => $data['tax_id'] ?? null,
        'category' => $data['category'],
        'status' => 'ACTIVE',
        'created_by' => auth()->id(),
      ]);

      // Log activity
      $this->logActivity($supplier, 'CREATED', 'Supplier created');

      return $supplier;
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
   */
  public function update(int $id, array $data): Supplier
  {
    $supplier = Supplier::findOrFail($id);

    $supplier->update([
      'company_name' => $data['company_name'] ?? $supplier->company_name,
      'company_email' => $data['company_email'] ?? $supplier->company_email,
      'company_phone' => $data['company_phone'] ?? $supplier->company_phone,
      'company_address' => $data['company_address'] ?? $supplier->company_address,
      'company_website' => $data['company_website'] ?? $supplier->company_website,
      'tax_id' => $data['tax_id'] ?? $supplier->tax_id,
      'category' => $data['category'] ?? $supplier->category,
    ]);

    // Update user if needed
    if (isset($data['contact_person_first_name']) || isset($data['contact_person_last_name'])) {
      $user = User::find($supplier->user_id);
      if ($user) {
        $user->update([
          'first_name' => $data['contact_person_first_name'] ?? $user->first_name,
          'last_name' => $data['contact_person_last_name'] ?? $user->last_name,
        ]);
      }
    }

    // Log activity
    $this->logActivity($supplier, 'UPDATED', 'Supplier updated');

    return $supplier->fresh();
  }

  /**
   * Blacklist a supplier.
   */
  public function blacklist(int $id, string $reason): Supplier
  {
    $supplier = Supplier::findOrFail($id);

    $supplier->update([
      'status' => 'BLACKLISTED',
      'blacklist_reason' => $reason,
      'blacklisted_by' => auth()->id(),
      'blacklisted_at' => now(),
    ]);

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

    $supplier->update([
      'status' => 'ACTIVE',
      'blacklist_reason' => null,
      'blacklisted_by' => null,
      'blacklisted_at' => null,
    ]);

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
    $supplier->update(['status' => 'INACTIVE']);

    $this->logActivity($supplier, 'DELETED', 'Supplier deactivated');
  }

  /**
   * Activate supplier.
   */
  public function activate(int $id): void
  {
    $supplier = Supplier::findOrFail($id);
    $supplier->update(['status' => 'ACTIVE']);

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
    UserActivityLog::create([
      'user_id' => auth()->id(),
      'action' => $action,
      'module' => 'SUPPLIER',
      'description' => $description . ' - Supplier: ' . $supplier->company_name,
      'data' => ['supplier_id' => $supplier->id],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
