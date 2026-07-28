<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Services\Supplier\SupplierService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SupplierController extends Controller
{
  protected SupplierService $supplierService;

  public function __construct(SupplierService $supplierService)
  {
    $this->supplierService = $supplierService;
  }

  /**
   * List all suppliers.
   */
  public function index(Request $request)
  {
    Log::info('[SupplierController] Fetching all suppliers', [
      'filters' => $request->all(),
      'user_id' => auth()->id(),
    ]);

    $suppliers = $this->supplierService->getAll($request->all());

    Log::info('[SupplierController] Suppliers fetched', [
      'count' => $suppliers->count(),
    ]);

    return response()->json([
      'success' => true,
      'data' => SupplierResource::collection($suppliers),
    ]);
  }

  /**
   * Get active suppliers (for dropdown).
   */
  public function active()
  {
    Log::info('[SupplierController] Fetching active suppliers', [
      'user_id' => auth()->id(),
    ]);

    $suppliers = $this->supplierService->getActive();

    Log::info('[SupplierController] Active suppliers fetched', [
      'count' => $suppliers->count(),
    ]);

    return response()->json([
      'success' => true,
      'data' => SupplierResource::collection($suppliers),
    ]);
  }

  /**
   * Get supplier by current authenticated user.
   */
  public function me()
  {
    Log::info('[SupplierController] Fetching supplier for current user', [
      'user_id' => auth()->id(),
    ]);

    try {
      $userId = auth()->id();

      if (!$userId) {
        Log::warning('[SupplierController] User not authenticated');
        return response()->json([
          'success' => false,
          'message' => 'User not authenticated',
        ], 401);
      }

      $supplier = $this->supplierService->getByUserId($userId);

      if (!$supplier) {
        Log::info('[SupplierController] Supplier profile not found for user', [
          'user_id' => $userId,
        ]);
        return response()->json([
          'success' => false,
          'message' => 'Supplier profile not found',
        ], 404);
      }

      Log::info('[SupplierController] Supplier profile found', [
        'supplier_id' => $supplier->id,
        'company_name' => $supplier->company_name,
      ]);

      return response()->json([
        'success' => true,
        'data' => new SupplierResource($supplier),
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error fetching supplier profile', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch supplier profile: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get single supplier.
   */
  public function show($id)
  {
    Log::info('[SupplierController] Fetching single supplier', [
      'supplier_id' => $id,
      'user_id' => auth()->id(),
    ]);

    try {
      $id = (int) $id;
      $supplier = $this->supplierService->getById($id);

      if (!$supplier) {
        Log::warning('[SupplierController] Supplier not found', [
          'supplier_id' => $id,
        ]);
        return response()->json([
          'success' => false,
          'message' => 'Supplier not found',
        ], 404);
      }

      Log::info('[SupplierController] Supplier found', [
        'supplier_id' => $supplier->id,
        'company_name' => $supplier->company_name,
      ]);

      return response()->json([
        'success' => true,
        'data' => new SupplierResource($supplier),
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error fetching supplier', [
        'supplier_id' => $id,
        'error' => $e->getMessage(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Create supplier.
   */
  public function store(SupplierRequest $request)
  {
    Log::info('[SupplierController] Creating new supplier', [
      'user_id' => auth()->id(),
      'request_data' => $request->all(),
      'has_file' => $request->hasFile('company_logo'),
    ]);

    try {
      $data = $request->validated();

      Log::info('[SupplierController] Validated data', [
        'data' => $data,
      ]);

      // Handle company logo upload - pass the file directly to the service
      if ($request->hasFile('company_logo')) {
        $logoFile = $request->file('company_logo');
        $data['company_logo'] = $logoFile;

        Log::info('[SupplierController] Company logo file received', [
          'file_name' => $logoFile->getClientOriginalName(),
          'file_size' => $logoFile->getSize(),
          'mime_type' => $logoFile->getMimeType(),
        ]);
      }

      $supplier = $this->supplierService->create($data);

      Log::info('[SupplierController] Supplier created successfully', [
        'supplier_id' => $supplier->id,
        'company_name' => $supplier->company_name,
        'has_logo' => !is_null($supplier->company_logo),
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Supplier created successfully',
        'data' => new SupplierResource($supplier),
      ], 201);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error creating supplier', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'request_data' => $request->all(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to create supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update supplier.
   */
  public function update(SupplierRequest $request, $id)
  {
    Log::info('[SupplierController] Updating supplier', [
      'supplier_id' => $id,
      'user_id' => auth()->id(),
      'request_data' => $request->all(),
      'has_file' => $request->hasFile('company_logo'),
    ]);

    try {
      $id = (int) $id;
      $data = $request->validated();

      Log::info('[SupplierController] Validated data for update', [
        'supplier_id' => $id,
        'data' => $data,
      ]);

      // Handle company logo upload - pass the file directly to the service
      if ($request->hasFile('company_logo')) {
        $logoFile = $request->file('company_logo');
        $data['company_logo'] = $logoFile;

        Log::info('[SupplierController] Company logo file received for update', [
          'supplier_id' => $id,
          'file_name' => $logoFile->getClientOriginalName(),
          'file_size' => $logoFile->getSize(),
          'mime_type' => $logoFile->getMimeType(),
        ]);
      }

      $supplier = $this->supplierService->update($id, $data);

      Log::info('[SupplierController] Supplier updated successfully', [
        'supplier_id' => $supplier->id,
        'company_name' => $supplier->company_name,
        'has_logo' => !is_null($supplier->company_logo),
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Supplier updated successfully',
        'data' => new SupplierResource($supplier),
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error updating supplier', [
        'supplier_id' => $id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
        'request_data' => $request->all(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to update supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Blacklist supplier.
   */
  public function blacklist(Request $request, $id)
  {
    Log::info('[SupplierController] Blacklisting supplier', [
      'supplier_id' => $id,
      'user_id' => auth()->id(),
      'reason' => $request->reason,
    ]);

    $request->validate([
      'reason' => 'required|string|max:500',
    ]);

    try {
      $id = (int) $id;
      $supplier = $this->supplierService->blacklist($id, $request->reason);

      Log::info('[SupplierController] Supplier blacklisted successfully', [
        'supplier_id' => $supplier->id,
        'company_name' => $supplier->company_name,
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Supplier blacklisted successfully',
        'data' => new SupplierResource($supplier),
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error blacklisting supplier', [
        'supplier_id' => $id,
        'error' => $e->getMessage(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to blacklist supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Remove from blacklist.
   */
  public function unblacklist($id)
  {
    Log::info('[SupplierController] Unblacklisting supplier', [
      'supplier_id' => $id,
      'user_id' => auth()->id(),
    ]);

    try {
      $id = (int) $id;
      $supplier = $this->supplierService->unblacklist($id);

      Log::info('[SupplierController] Supplier unblacklisted successfully', [
        'supplier_id' => $supplier->id,
        'company_name' => $supplier->company_name,
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Supplier removed from blacklist successfully',
        'data' => new SupplierResource($supplier),
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error unblacklisting supplier', [
        'supplier_id' => $id,
        'error' => $e->getMessage(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to remove from blacklist: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Delete supplier.
   */
  public function destroy($id)
  {
    Log::info('[SupplierController] Deleting supplier', [
      'supplier_id' => $id,
      'user_id' => auth()->id(),
    ]);

    try {
      $id = (int) $id;
      $this->supplierService->delete($id);

      Log::info('[SupplierController] Supplier deactivated successfully', [
        'supplier_id' => $id,
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Supplier deactivated successfully',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error deleting supplier', [
        'supplier_id' => $id,
        'error' => $e->getMessage(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to deactivate supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Activate supplier.
   */
  public function activate($id)
  {
    Log::info('[SupplierController] Activating supplier', [
      'supplier_id' => $id,
      'user_id' => auth()->id(),
    ]);

    try {
      $id = (int) $id;
      $this->supplierService->activate($id);

      Log::info('[SupplierController] Supplier activated successfully', [
        'supplier_id' => $id,
      ]);

      return response()->json([
        'success' => true,
        'message' => 'Supplier activated successfully',
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error activating supplier', [
        'supplier_id' => $id,
        'error' => $e->getMessage(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to activate supplier: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get supplier statistics.
   */
  public function stats()
  {
    Log::info('[SupplierController] Fetching supplier statistics', [
      'user_id' => auth()->id(),
    ]);

    try {
      $stats = $this->supplierService->getStats();

      Log::info('[SupplierController] Supplier statistics fetched', [
        'stats' => $stats,
      ]);

      return response()->json([
        'success' => true,
        'data' => $stats,
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error fetching supplier statistics', [
        'error' => $e->getMessage(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to fetch supplier statistics: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Export suppliers to CSV/Excel.
   */
  public function export(Request $request)
  {
    Log::info('[SupplierController] Exporting suppliers', [
      'user_id' => auth()->id(),
      'filters' => $request->all(),
    ]);

    try {
      $suppliers = $this->supplierService->getAll($request->all());

      // Prepare CSV data
      $headers = [
        'ID',
        'Company Name',
        'Company Email',
        'Company Phone',
        'Registration Number',
        'Tax ID',
        'Category',
        'Status',
        'Description',
        'Established Year',
        'Employee Count',
        'Annual Revenue',
        'Certifications',
        'Registration Date',
        'License Number',
        'Bank Name',
        'Bank Account',
        'Bank Branch',
        'Payment Terms',
        'Preferred Currency',
        'Contact Person Name',
        'Contact Person Email',
        'Contact Person Phone',
        'Created At',
        'Updated At'
      ];

      $rows = [];
      foreach ($suppliers as $supplier) {
        $rows[] = [
          $supplier->id,
          $supplier->company_name,
          $supplier->company_email,
          $supplier->company_phone,
          $supplier->company_registration,
          $supplier->tax_id,
          $supplier->category,
          $supplier->status,
          $supplier->description,
          $supplier->established_year,
          $supplier->employee_count,
          $supplier->annual_revenue,
          $supplier->certifications,
          $supplier->registration_date,
          $supplier->license_number,
          $supplier->bank_name,
          $supplier->bank_account,
          $supplier->bank_branch,
          $supplier->payment_terms,
          $supplier->preferred_currency,
          $supplier->contact_person_name,
          $supplier->contact_person_email,
          $supplier->contact_person_phone,
          $supplier->created_at,
          $supplier->updated_at,
        ];
      }

      Log::info('[SupplierController] Export data prepared', [
        'row_count' => count($rows),
      ]);

      // Generate CSV
      $callback = function () use ($headers, $rows) {
        $file = fopen('php://output', 'w');
        fputcsv($file, $headers);
        foreach ($rows as $row) {
          fputcsv($file, $row);
        }
        fclose($file);
      };

      return response()->stream(
        $callback,
        200,
        [
          'Content-Type' => 'text/csv',
          'Content-Disposition' => 'attachment; filename="suppliers_' . date('Y-m-d') . '.csv"',
        ]
      );
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error exporting suppliers', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to export suppliers: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Bulk import suppliers.
   */
  public function import(Request $request)
  {
    Log::info('[SupplierController] Importing suppliers', [
      'user_id' => auth()->id(),
      'has_file' => $request->hasFile('file'),
    ]);

    $request->validate([
      'file' => 'required|file|mimes:csv,txt|max:10240',
    ]);

    try {
      $file = $request->file('file');
      $filePath = $file->getRealPath();
      $fileHandle = fopen($filePath, 'r');

      // Get headers
      $headers = fgetcsv($fileHandle);
      Log::info('[SupplierController] CSV headers', [
        'headers' => $headers,
      ]);

      // Validate headers
      $requiredHeaders = ['company_name', 'company_email', 'company_registration', 'company_address', 'category'];
      $missingHeaders = array_diff($requiredHeaders, array_map('strtolower', $headers));

      if (!empty($missingHeaders)) {
        fclose($fileHandle);
        Log::warning('[SupplierController] Missing required headers', [
          'missing_headers' => $missingHeaders,
        ]);
        return response()->json([
          'success' => false,
          'message' => 'Missing required headers: ' . implode(', ', $missingHeaders),
        ], 422);
      }

      $imported = 0;
      $errors = [];

      while (($row = fgetcsv($fileHandle)) !== false) {
        $data = array_combine(array_map('strtolower', $headers), $row);

        try {
          // Map data to supplier fields
          $supplierData = [
            'company_name' => $data['company_name'] ?? null,
            'company_email' => $data['company_email'] ?? null,
            'company_phone' => $data['company_phone'] ?? null,
            'company_registration' => $data['company_registration'] ?? null,
            'company_address' => $data['company_address'] ?? null,
            'company_website' => $data['company_website'] ?? null,
            'tax_id' => $data['tax_id'] ?? null,
            'category' => $data['category'] ?? null,
            'description' => $data['description'] ?? null,
            'established_year' => $data['established_year'] ?? null,
            'employee_count' => $data['employee_count'] ?? null,
            'annual_revenue' => $data['annual_revenue'] ?? null,
            'certifications' => $data['certifications'] ?? null,
            'registration_date' => $data['registration_date'] ?? null,
            'license_number' => $data['license_number'] ?? null,
            'bank_name' => $data['bank_name'] ?? null,
            'bank_account' => $data['bank_account'] ?? null,
            'bank_branch' => $data['bank_branch'] ?? null,
            'payment_terms' => $data['payment_terms'] ?? null,
            'preferred_currency' => $data['preferred_currency'] ?? 'KES',
            'contact_person_name' => $data['contact_person_name'] ?? null,
            'contact_person_email' => $data['contact_person_email'] ?? null,
            'contact_person_phone' => $data['contact_person_phone'] ?? null,
          ];

          Log::debug('[SupplierController] Importing row', [
            'row_data' => $supplierData,
          ]);

          // Validate required fields
          if (
            empty($supplierData['company_name']) || empty($supplierData['company_email']) ||
            empty($supplierData['company_registration']) || empty($supplierData['company_address']) ||
            empty($supplierData['category'])
          ) {
            $errors[] = 'Missing required fields for row: ' . json_encode($data);
            Log::warning('[SupplierController] Missing required fields', [
              'row' => $data,
            ]);
            continue;
          }

          // Create the supplier
          $this->supplierService->create($supplierData);
          $imported++;
          Log::debug('[SupplierController] Row imported successfully', [
            'company_name' => $supplierData['company_name'],
          ]);
        } catch (\Exception $e) {
          $errors[] = 'Error importing row: ' . json_encode($data) . ' - ' . $e->getMessage();
          Log::error('[SupplierController] Error importing row', [
            'row' => $data,
            'error' => $e->getMessage(),
          ]);
        }
      }

      fclose($fileHandle);

      Log::info('[SupplierController] Import completed', [
        'imported' => $imported,
        'errors_count' => count($errors),
      ]);

      return response()->json([
        'success' => true,
        'message' => "Imported {$imported} suppliers successfully",
        'data' => [
          'imported' => $imported,
          'errors' => $errors,
        ],
      ]);
    } catch (\Exception $e) {
      Log::error('[SupplierController] Error importing suppliers', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Failed to import suppliers: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get supplier categories.
   */
  public function categories()
  {
    Log::info('[SupplierController] Fetching supplier categories', [
      'user_id' => auth()->id(),
    ]);

    $categories = [
      ['value' => 'goods', 'label' => 'Goods Supplier'],
      ['value' => 'services', 'label' => 'Services Provider'],
      ['value' => 'both', 'label' => 'Both Goods & Services'],
    ];

    Log::info('[SupplierController] Categories fetched', [
      'categories' => $categories,
    ]);

    return response()->json([
      'success' => true,
      'data' => $categories,
    ]);
  }
}
