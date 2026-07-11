<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Services\Department\DepartmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DepartmentController extends Controller
{
  protected DepartmentService $departmentService;

  public function __construct(DepartmentService $departmentService)
  {
    $this->departmentService = $departmentService;

    Log::info('🏗️ DepartmentController initialized');
  }

  /**
   * List all departments.
   */
  public function index(Request $request)
  {
    Log::info('📋 DepartmentController::index - Fetching all departments', [
      'filters' => $request->all(),
      'user_id' => auth()->id(),
      'ip' => $request->ip()
    ]);

    try {
      $departments = $this->departmentService->getAll($request->all());

      // Check if it's a paginator or collection
      if (method_exists($departments, 'total')) {
        // It's a paginator
        Log::info('✅ DepartmentController::index - Departments fetched successfully (paginated)', [
          'count' => $departments->count(),
          'total' => $departments->total(),
          'per_page' => $departments->perPage(),
          'current_page' => $departments->currentPage()
        ]);

        return response()->json([
          'success' => true,
          'data' => DepartmentResource::collection($departments),
          'meta' => [
            'total' => $departments->total(),
            'per_page' => $departments->perPage(),
            'current_page' => $departments->currentPage(),
            'last_page' => $departments->lastPage(),
          ],
        ]);
      } else {
        // It's a collection
        Log::info('✅ DepartmentController::index - Departments fetched successfully (collection)', [
          'count' => $departments->count()
        ]);

        return response()->json([
          'success' => true,
          'data' => DepartmentResource::collection($departments),
        ]);
      }
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::index - Failed to fetch departments', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'filters' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch departments: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get active departments (for dropdown).
   */
  public function active()
  {
    Log::info('📋 DepartmentController::active - Fetching active departments', [
      'user_id' => auth()->id()
    ]);

    try {
      $departments = $this->departmentService->getActive();

      Log::info('✅ DepartmentController::active - Active departments fetched', [
        'count' => $departments->count()
      ]);

      return response()->json([
        'success' => true,
        'data' => DepartmentResource::collection($departments),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::active - Failed to fetch active departments', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch active departments: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single department.
   */
  public function show($id)
  {
    Log::info('📋 DepartmentController::show - Fetching department', [
      'department_id' => $id,
      'user_id' => auth()->id()
    ]);

    try {
      $department = $this->departmentService->getById($id);

      if (!$department) {
        Log::warning('⚠️ DepartmentController::show - Department not found', [
          'department_id' => $id
        ]);

        return response()->json([
          'success' => false,
          'message' => 'Department not found',
        ], 404);
      }

      Log::info('✅ DepartmentController::show - Department fetched', [
        'department_id' => $id,
        'department_name' => $department->name,
        'department_code' => $department->code
      ]);

      return response()->json([
        'success' => true,
        'data' => new DepartmentResource($department),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::show - Failed to fetch department', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'department_id' => $id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch department: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Create department.
   */
  public function store(DepartmentRequest $request)
  {
    Log::info('📋 DepartmentController::store - Creating new department', [
      'data' => $request->validated(),
      'user_id' => auth()->id(),
      'ip' => $request->ip()
    ]);

    try {
      $department = $this->departmentService->create($request->validated());

      Log::info('✅ DepartmentController::store - Department created successfully', [
        'department_id' => $department->id,
        'department_name' => $department->name,
        'department_code' => $department->code,
        'created_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Department created successfully',
        'data' => new DepartmentResource($department),
      ], 201);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ DepartmentController::store - Validation failed', [
        'errors' => $e->errors(),
        'data' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::store - Failed to create department', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'data' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to create department: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update department.
   */
  public function update(DepartmentRequest $request, $id)
  {
    Log::info('📋 DepartmentController::update - Updating department', [
      'department_id' => $id,
      'data' => $request->validated(),
      'user_id' => auth()->id()
    ]);

    try {
      $department = $this->departmentService->update($id, $request->validated());

      Log::info('✅ DepartmentController::update - Department updated successfully', [
        'department_id' => $id,
        'department_name' => $department->name,
        'department_code' => $department->code,
        'updated_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Department updated successfully',
        'data' => new DepartmentResource($department),
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ DepartmentController::update - Validation failed', [
        'errors' => $e->errors(),
        'data' => $request->all(),
        'department_id' => $id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::update - Failed to update department', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'department_id' => $id,
        'data' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to update department: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete/Deactivate department.
   */
  public function destroy($id)
  {
    Log::info('📋 DepartmentController::destroy - Deleting department', [
      'department_id' => $id,
      'user_id' => auth()->id()
    ]);

    try {
      $this->departmentService->delete($id);

      Log::info('✅ DepartmentController::destroy - Department deactivated successfully', [
        'department_id' => $id,
        'deleted_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Department deactivated successfully',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::destroy - Failed to deactivate department', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'department_id' => $id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to deactivate department: ' . $e->getMessage(),
      ], 500);
    }
  }

// app/Http/Controllers/Api/DepartmentController.php

  /**
   * Activate department.
   */
  public function activate($id)
  {
    Log::info('📋 DepartmentController::activate - Activating department', [
      'department_id' => $id,
      'user_id' => auth()->id()
    ]);

    try {
      $department = $this->departmentService->activate($id);

      if (!$department) {
        Log::warning('⚠️ DepartmentController::activate - Department not found', [
          'department_id' => $id
        ]);

        return response()->json([
          'success' => false,
          'message' => 'Department not found',
        ], 404);
      }

      Log::info('✅ DepartmentController::activate - Department activated successfully', [
        'department_id' => $id,
        'department_name' => $department->name,
        'is_active' => $department->is_active,
        'activated_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Department activated successfully',
        'data' => new DepartmentResource($department),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::activate - Failed to activate department', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'department_id' => $id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to activate department: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Deactivate department.
   */
  public function deactivate($id)
  {
    Log::info('📋 DepartmentController::deactivate - Deactivating department', [
      'department_id' => $id,
      'user_id' => auth()->id()
    ]);

    try {
      $department = $this->departmentService->deactivate($id);

      if (!$department) {
        Log::warning('⚠️ DepartmentController::deactivate - Department not found', [
          'department_id' => $id
        ]);

        return response()->json([
          'success' => false,
          'message' => 'Department not found',
        ], 404);
      }

      Log::info('✅ DepartmentController::deactivate - Department deactivated successfully', [
        'department_id' => $id,
        'department_name' => $department->name,
        'is_active' => $department->is_active,
        'deactivated_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Department deactivated successfully',
        'data' => new DepartmentResource($department),
      ]);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::deactivate - Failed to deactivate department', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'department_id' => $id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to deactivate department: ' . $e->getMessage(),
      ], 500);
    }
  }
  /**
   * Assign HOD to department.
   */
  public function assignHOD(Request $request, $id)
  {
    Log::info('📋 DepartmentController::assignHOD - Assigning HOD to department', [
      'department_id' => $id,
      'hod_id' => $request->hod_id,
      'user_id' => auth()->id()
    ]);

    try {
      $request->validate([
        'hod_id' => 'required|exists:users,id',
      ]);

      $this->departmentService->assignHOD($id, $request->hod_id);

      Log::info('✅ DepartmentController::assignHOD - HOD assigned successfully', [
        'department_id' => $id,
        'hod_id' => $request->hod_id,
        'assigned_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'HOD assigned successfully',
      ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
      Log::warning('⚠️ DepartmentController::assignHOD - Validation failed', [
        'errors' => $e->errors(),
        'data' => $request->all()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $e->errors(),
      ], 422);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::assignHOD - Failed to assign HOD', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'department_id' => $id,
        'hod_id' => $request->hod_id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to assign HOD: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Remove HOD from department.
   */
  public function removeHOD($id)
  {
    Log::info('📋 DepartmentController::removeHOD - Removing HOD from department', [
      'department_id' => $id,
      'user_id' => auth()->id()
    ]);

    try {
      $this->departmentService->removeHOD($id);

      Log::info('✅ DepartmentController::removeHOD - HOD removed successfully', [
        'department_id' => $id,
        'removed_by' => auth()->id()
      ]);

      return response()->json([
        'success' => true,
        'message' => 'HOD removed successfully',
      ]);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::removeHOD - Failed to remove HOD', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'department_id' => $id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to remove HOD: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get department users.
   */
  public function users($id)
  {
    Log::info('📋 DepartmentController::users - Fetching department users', [
      'department_id' => $id,
      'user_id' => auth()->id()
    ]);

    try {
      $users = $this->departmentService->getDepartmentUsers($id);

      Log::info('✅ DepartmentController::users - Department users fetched', [
        'department_id' => $id,
        'count' => $users->count()
      ]);

      return response()->json([
        'success' => true,
        'data' => $users,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::users - Failed to fetch department users', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'department_id' => $id
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch department users: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get department statistics.
   */
  public function stats()
  {
    Log::info('📋 DepartmentController::stats - Fetching department statistics', [
      'user_id' => auth()->id()
    ]);

    try {
      $stats = $this->departmentService->getStats();

      Log::info('✅ DepartmentController::stats - Department statistics fetched', [
        'total_departments' => $stats['total_departments'] ?? 0,
        'active_departments' => $stats['active_departments'] ?? 0,
        'inactive_departments' => $stats['inactive_departments'] ?? 0,
        'total_users' => $stats['total_users'] ?? 0
      ]);

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      Log::error('❌ DepartmentController::stats - Failed to fetch department statistics', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch department statistics: ' . $e->getMessage(),
      ], 500);
    }
  }
}
