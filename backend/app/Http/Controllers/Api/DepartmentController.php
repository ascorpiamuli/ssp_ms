<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Services\Department\DepartmentService;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
  protected DepartmentService $departmentService;

  public function __construct(DepartmentService $departmentService)
  {
    $this->departmentService = $departmentService;
  }

  /**
   * List all departments.
   */
  public function index(Request $request)
  {
    $departments = $this->departmentService->getAll($request->all());

    return response()->json([
      'success' => true,
      'data' => DepartmentResource::collection($departments),
    ]);
  }

  /**
   * Get active departments (for dropdown).
   */
  public function active()
  {
    $departments = $this->departmentService->getActive();

    return response()->json([
      'success' => true,
      'data' => DepartmentResource::collection($departments),
    ]);
  }

  /**
   * Get single department.
   */
  public function show($id)
  {
    $department = $this->departmentService->getById($id);

    if (!$department) {
      return response()->json([
        'success' => false,
        'message' => 'Department not found',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'data' => new DepartmentResource($department),
    ]);
  }

  /**
   * Create department.
   */
  public function store(DepartmentRequest $request)
  {
    try {
      $department = $this->departmentService->create($request->validated());

      return response()->json([
        'success' => true,
        'message' => 'Department created successfully',
        'data' => new DepartmentResource($department),
      ], 201);
    } catch (\Exception $e) {
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
    try {
      $department = $this->departmentService->update($id, $request->validated());

      return response()->json([
        'success' => true,
        'message' => 'Department updated successfully',
        'data' => new DepartmentResource($department),
      ]);
    } catch (\Exception $e) {
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
    try {
      $this->departmentService->delete($id);

      return response()->json([
        'success' => true,
        'message' => 'Department deactivated successfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to deactivate department: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Activate department.
   */
  public function activate($id)
  {
    try {
      $this->departmentService->activate($id);

      return response()->json([
        'success' => true,
        'message' => 'Department activated successfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => 'Failed to activate department: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Assign HOD to department.
   */
  public function assignHOD(Request $request, $id)
  {
    $request->validate([
      'hod_id' => 'required|exists:users,id',
    ]);

    try {
      $this->departmentService->assignHOD($id, $request->hod_id);

      return response()->json([
        'success' => true,
        'message' => 'HOD assigned successfully',
      ]);
    } catch (\Exception $e) {
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
    try {
      $this->departmentService->removeHOD($id);

      return response()->json([
        'success' => true,
        'message' => 'HOD removed successfully',
      ]);
    } catch (\Exception $e) {
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
    $users = $this->departmentService->getDepartmentUsers($id);

    return response()->json([
      'success' => true,
      'data' => $users,
    ]);
  }

  /**
   * Get department statistics.
   */
  public function stats()
  {
    $stats = $this->departmentService->getStats();

    return response()->json([
      'success' => true,
      'data' => $stats,
    ]);
  }
}
