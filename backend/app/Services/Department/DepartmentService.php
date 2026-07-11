<?php

namespace App\Services\Department;

use App\Services\BaseService;
use App\Models\Department;
use App\Models\User;
use App\Models\UserActivityLog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DepartmentService extends BaseService
{
  /**
   * Get all departments with filters.
   */
  public function getAll(array $filters = [])
  {
    Log::info('🔍 DepartmentService::getAll - Fetching departments', ['filters' => $filters]);

    $query = Department::with(['hod', 'users']);

    // Status filter
    if (isset($filters['is_active'])) {
      $query->where('is_active', $filters['is_active']);
      Log::info('✅ Applied status filter', ['is_active' => $filters['is_active']]);
    }

    // Search filter
    if (isset($filters['search']) && !empty($filters['search'])) {
      $search = $filters['search'];
      $query->where(function ($q) use ($search) {
        $q->where('name', 'LIKE', "%{$search}%")
          ->orWhere('code', 'LIKE', "%{$search}%")
          ->orWhere('description', 'LIKE', "%{$search}%");
      });
      Log::info('✅ Applied search filter', ['search' => $search]);
    }

    // Sort
    $sortField = $filters['sort_by'] ?? 'name';
    $sortDirection = $filters['sort_direction'] ?? 'asc';
    $query->orderBy($sortField, $sortDirection);

    $departments = $query->get();

    Log::info('✅ DepartmentService::getAll - Departments fetched', [
      'count' => $departments->count(),
      'total' => $departments->count()
    ]);

    return $departments;
  }

  /**
   * Get active departments for dropdown.
   */
  public function getActive()
  {
    Log::info('🔍 DepartmentService::getActive - Fetching active departments');

    $departments = Department::with('hod')
      ->where('is_active', true)
      ->orderBy('name')
      ->get();

    Log::info('✅ DepartmentService::getActive - Active departments fetched', [
      'count' => $departments->count()
    ]);

    return $departments;
  }

  /**
   * Get department by ID.
   */
  public function getById(int $id): ?Department
  {
    Log::info('🔍 DepartmentService::getById - Fetching department', ['id' => $id]);

    $department = Department::with(['hod', 'users'])->find($id);

    if (!$department) {
      Log::warning('⚠️ DepartmentService::getById - Department not found', ['id' => $id]);
    } else {
      Log::info('✅ DepartmentService::getById - Department found', [
        'id' => $id,
        'name' => $department->name,
        'code' => $department->code
      ]);
    }

    return $department;
  }

  /**
   * Get department by code.
   */
  public function getByCode(string $code): ?Department
  {
    Log::info('🔍 DepartmentService::getByCode - Fetching department by code', ['code' => $code]);

    $department = Department::where('code', $code)->first();

    if (!$department) {
      Log::warning('⚠️ DepartmentService::getByCode - Department not found', ['code' => $code]);
    } else {
      Log::info('✅ DepartmentService::getByCode - Department found', [
        'id' => $department->id,
        'name' => $department->name
      ]);
    }

    return $department;
  }

  /**
   * Create a new department.
   */
  public function create(array $data): Department
  {
    Log::info('🔍 DepartmentService::create - Creating department', ['data' => $data]);

    return DB::transaction(function () use ($data) {
      $department = Department::create([
        'name' => $data['name'],
        'code' => $data['code'],
        'description' => $data['description'] ?? null,
        'is_active' => true,
      ]);

      Log::info('✅ DepartmentService::create - Department created', [
        'id' => $department->id,
        'name' => $department->name,
        'code' => $department->code
      ]);

      // Log activity
      $this->logActivity($department, 'CREATED', 'Department created');

      // If HOD is assigned
      if (isset($data['hod_id']) && $data['hod_id']) {
        Log::info('🔍 DepartmentService::create - Assigning HOD', [
          'department_id' => $department->id,
          'hod_id' => $data['hod_id']
        ]);
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
    Log::info('🔍 DepartmentService::update - Updating department', [
      'id' => $id,
      'data' => $data
    ]);

    $department = Department::findOrFail($id);

    $department->update([
      'name' => $data['name'] ?? $department->name,
      'code' => $data['code'] ?? $department->code,
      'description' => $data['description'] ?? $department->description,
    ]);

    Log::info('✅ DepartmentService::update - Department updated', [
      'id' => $id,
      'name' => $department->name,
      'code' => $department->code
    ]);

    // Log activity
    $this->logActivity($department, 'UPDATED', 'Department updated');

    // If HOD is assigned
    if (isset($data['hod_id']) && $data['hod_id']) {
      Log::info('🔍 DepartmentService::update - Assigning HOD', [
        'department_id' => $id,
        'hod_id' => $data['hod_id']
      ]);
      $this->assignHOD($id, $data['hod_id']);
    }

    return $department->fresh();
  }

  /**
   * Assign Head of Department.
   */
  public function assignHOD(int $departmentId, int $userId): void
  {
    Log::info('🔍 DepartmentService::assignHOD - Assigning HOD', [
      'department_id' => $departmentId,
      'user_id' => $userId
    ]);

    DB::transaction(function () use ($departmentId, $userId) {
      // Remove HOD from other departments
      $updated = Department::where('hod_id', $userId)->update(['hod_id' => null]);
      Log::info('✅ Removed HOD from other departments', ['affected' => $updated]);

      // Assign HOD to this department
      $department = Department::find($departmentId);
      if ($department) {
        $department->update(['hod_id' => $userId]);
        Log::info('✅ DepartmentService::assignHOD - HOD assigned', [
          'department_id' => $departmentId,
          'department_name' => $department->name,
          'user_id' => $userId
        ]);

        // Assign HOD role to user
        $user = User::find($userId);
        if ($user) {
          $user->assignRole('HOD');
          Log::info('✅ HOD role assigned to user', [
            'user_id' => $userId,
            'user_name' => $user->full_name
          ]);
        }

        // Log activity
        $this->logActivity($department, 'HOD_ASSIGNED', "HOD assigned to user ID: {$userId}");
      } else {
        Log::warning('⚠️ DepartmentService::assignHOD - Department not found', [
          'department_id' => $departmentId
        ]);
      }
    });
  }

  /**
   * Remove HOD from department.
   */
  public function removeHOD(int $departmentId): void
  {
    Log::info('🔍 DepartmentService::removeHOD - Removing HOD', [
      'department_id' => $departmentId
    ]);

    $department = Department::findOrFail($departmentId);
    $department->update(['hod_id' => null]);

    Log::info('✅ DepartmentService::removeHOD - HOD removed', [
      'department_id' => $departmentId,
      'department_name' => $department->name
    ]);

    $this->logActivity($department, 'HOD_REMOVED', 'HOD removed from department');
  }

  /**
   * Delete/Deactivate department.
   */
  public function delete(int $id): void
  {
    Log::info('🔍 DepartmentService::delete - Deactivating department', ['id' => $id]);

    $department = Department::findOrFail($id);
    $department->update(['is_active' => false]);

    Log::info('✅ DepartmentService::delete - Department deactivated', [
      'id' => $id,
      'name' => $department->name,
      'code' => $department->code
    ]);

    $this->logActivity($department, 'DELETED', 'Department deactivated');
  }

  /**
   * Activate department.
   */
  public function activate(int $id)
  {
    Log::info('🔍 DepartmentService::activate - Activating department', ['id' => $id]);

    $department = Department::find($id);

    if (!$department) {
      Log::warning('⚠️ DepartmentService::activate - Department not found', ['id' => $id]);
      return null;
    }

    $department->update(['is_active' => true]);

    Log::info('✅ DepartmentService::activate - Department activated', [
      'id' => $id,
      'name' => $department->name,
      'code' => $department->code
    ]);

    $this->logActivity($department, 'ACTIVATED', 'Department activated');

    return $department;
  }

  /**
   * Deactivate department.
   */
  public function deactivate(int $id)
  {
    Log::info('🔍 DepartmentService::deactivate - Deactivating department', ['id' => $id]);

    $department = Department::find($id);

    if (!$department) {
      Log::warning('⚠️ DepartmentService::deactivate - Department not found', ['id' => $id]);
      return null;
    }

    $department->update(['is_active' => false]);

    Log::info('✅ DepartmentService::deactivate - Department deactivated', [
      'id' => $id,
      'name' => $department->name,
      'code' => $department->code
    ]);

    $this->logActivity($department, 'DEACTIVATED', 'Department deactivated');

    return $department;
  }

  /**
   * Get department statistics.
   */
  public function getStats(): array
  {
    Log::info('🔍 DepartmentService::getStats - Fetching department statistics');

    $stats = [
      'total_departments' => Department::count(),
      'active_departments' => Department::where('is_active', true)->count(),
      'inactive_departments' => Department::where('is_active', false)->count(),
      'total_users' => User::whereNotNull('department_id')->count(),
      'with_hod' => Department::whereNotNull('hod_id')->count(),
      'without_hod' => Department::whereNull('hod_id')->count(),
    ];

    Log::info('✅ DepartmentService::getStats - Statistics fetched', $stats);

    return $stats;
  }

  /**
   * Get department users.
   */
  public function getDepartmentUsers(int $departmentId)
  {
    Log::info('🔍 DepartmentService::getDepartmentUsers - Fetching department users', [
      'department_id' => $departmentId
    ]);

    $users = User::where('department_id', $departmentId)->get();

    Log::info('✅ DepartmentService::getDepartmentUsers - Users fetched', [
      'department_id' => $departmentId,
      'count' => $users->count()
    ]);

    return $users;
  }

  /**
   * Get departments with HOD information.
   */
  public function getWithHOD()
  {
    Log::info('🔍 DepartmentService::getWithHOD - Fetching departments with HOD');

    $departments = Department::with('hod')
      ->where('is_active', true)
      ->get();

    Log::info('✅ DepartmentService::getWithHOD - Departments fetched', [
      'count' => $departments->count()
    ]);

    return $departments;
  }

  /**
   * Log activity.
   */
  protected function logActivity($department, string $action, string $description): void
  {
    try {
      UserActivityLog::create([
        'user_id' => auth()->id(),
        'action' => $action,
        'module' => 'DEPARTMENT',
        'description' => $description . ' - Department: ' . $department->name,
        'data' => ['department_id' => $department->id],
        'ip_address' => request()->ip(),
        'user_agent' => request()->userAgent(),
      ]);
      Log::info('✅ Activity logged', [
        'action' => $action,
        'department_id' => $department->id
      ]);
    } catch (\Exception $e) {
      Log::error('❌ Failed to log activity', [
        'error' => $e->getMessage(),
        'department_id' => $department->id
      ]);
    }
  }
}
