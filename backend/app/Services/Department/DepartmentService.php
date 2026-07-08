<?php

namespace App\Services\Department;

use App\Services\BaseService;
use App\Models\Department;
use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Support\Facades\DB;

class DepartmentService extends BaseService
{
  /**
   * Get all departments with filters.
   */
  public function getAll(array $filters = [])
  {
    $query = Department::with(['hod', 'users']);

    if (isset($filters['is_active'])) {
      $query->where('is_active', $filters['is_active']);
    }

    if (isset($filters['search'])) {
      $query->where(function ($q) use ($filters) {
        $q->where('name', 'LIKE', "%{$filters['search']}%")
          ->orWhere('code', 'LIKE', "%{$filters['search']}%");
      });
    }

    return $query->orderBy('name')->get();
  }

  /**
   * Get active departments for dropdown.
   */
  public function getActive()
  {
    return Department::with('hod')
      ->where('is_active', true)
      ->orderBy('name')
      ->get();
  }

  /**
   * Get department by ID.
   */
  public function getById(int $id): ?Department
  {
    return Department::with(['hod', 'users'])->find($id);
  }

  /**
   * Get department by code.
   */
  public function getByCode(string $code): ?Department
  {
    return Department::where('code', $code)->first();
  }

  /**
   * Create a new department.
   */
  public function create(array $data): Department
  {
    return DB::transaction(function () use ($data) {
      $department = Department::create([
        'name' => $data['name'],
        'code' => $data['code'],
        'description' => $data['description'] ?? null,
        'is_active' => true,
      ]);

      // Log activity
      $this->logActivity($department, 'CREATED', 'Department created');

      // If HOD is assigned
      if (isset($data['hod_id'])) {
        $this->assignHOD($department->id, $data['hod_id']);
      }

      return $department;
    });
  }

  /**
   * Update a department.
   */
  public function update(int $id, array $data): Department
  {
    $department = Department::findOrFail($id);

    $department->update([
      'name' => $data['name'] ?? $department->name,
      'code' => $data['code'] ?? $department->code,
      'description' => $data['description'] ?? $department->description,
    ]);

    // Log activity
    $this->logActivity($department, 'UPDATED', 'Department updated');

    if (isset($data['hod_id'])) {
      $this->assignHOD($id, $data['hod_id']);
    }

    return $department->fresh();
  }

  /**
   * Assign Head of Department.
   */
  public function assignHOD(int $departmentId, int $userId): void
  {
    DB::transaction(function () use ($departmentId, $userId) {
      // Remove HOD from other departments
      Department::where('hod_id', $userId)->update(['hod_id' => null]);

      // Assign HOD to this department
      $department = Department::find($departmentId);
      $department->update(['hod_id' => $userId]);

      // Assign HOD role to user
      $user = User::find($userId);
      if ($user) {
        $user->assignRole('HOD');
      }

      // Log activity
      $this->logActivity($department, 'HOD_ASSIGNED', "HOD assigned to user ID: {$userId}");
    });
  }

  /**
   * Remove HOD from department.
   */
  public function removeHOD(int $departmentId): void
  {
    $department = Department::findOrFail($departmentId);
    $department->update(['hod_id' => null]);

    $this->logActivity($department, 'HOD_REMOVED', 'HOD removed from department');
  }

  /**
   * Delete/Deactivate department.
   */
  public function delete(int $id): void
  {
    $department = Department::findOrFail($id);
    $department->update(['is_active' => false]);

    $this->logActivity($department, 'DELETED', 'Department deactivated');
  }

  /**
   * Activate department.
   */
  public function activate(int $id): void
  {
    $department = Department::findOrFail($id);
    $department->update(['is_active' => true]);

    $this->logActivity($department, 'ACTIVATED', 'Department activated');
  }

  /**
   * Get department statistics.
   */
  public function getStats(): array
  {
    return [
      'total' => Department::count(),
      'active' => Department::where('is_active', true)->count(),
      'inactive' => Department::where('is_active', false)->count(),
      'with_hod' => Department::whereNotNull('hod_id')->count(),
      'without_hod' => Department::whereNull('hod_id')->count(),
    ];
  }

  /**
   * Get department users.
   */
  public function getDepartmentUsers(int $departmentId)
  {
    return User::where('department_id', $departmentId)->get();
  }

  /**
   * Get departments with HOD information.
   */
  public function getWithHOD()
  {
    return Department::with('hod')
      ->where('is_active', true)
      ->get();
  }

  /**
   * Log activity.
   */
  protected function logActivity($department, string $action, string $description): void
  {
    UserActivityLog::create([
      'user_id' => auth()->id(),
      'action' => $action,
      'module' => 'DEPARTMENT',
      'description' => $description . ' - Department: ' . $department->name,
      'data' => ['department_id' => $department->id],
      'ip_address' => request()->ip(),
      'user_agent' => request()->userAgent(),
    ]);
  }
}
