<?php
// app/Http/Resources/Procurement/SupplierQuotationResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class SupplierQuotationResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    // Debug logging
    Log::info('SupplierQuotationResource - Processing', [
      'quotation_id' => $this->id,
      'supplier_id' => $this->supplier_id,
      'relation_loaded' => $this->relationLoaded('supplier'),
      'supplier_exists' => $this->supplier ? true : false,
      'pdf_upload_id' => $this->pdf_upload_id ?? null,
      'has_pdf_upload' => !empty($this->pdf_upload_id),
    ]);

    // Get supplier data - try multiple approaches
    $supplierData = null;

    // Approach 1: Check if supplier is loaded via relationship
    if ($this->relationLoaded('supplier') && $this->supplier) {
      $supplierData = $this->formatSupplierData($this->supplier);
      Log::info('SupplierQuotationResource - Supplier loaded via relationship', [
        'quotation_id' => $this->id,
        'supplier_id' => $this->supplier->id,
        'company_name' => $this->supplier->company_name,
      ]);
    }
    // Approach 2: If supplier_id exists but relationship failed, try direct query
    else if ($this->supplier_id) {
      Log::warning('SupplierQuotationResource - Supplier not loaded via relationship, trying direct query', [
        'quotation_id' => $this->id,
        'supplier_id' => $this->supplier_id,
      ]);

      // Direct query to get supplier
      $supplier = \App\Models\Supplier::withTrashed()->find($this->supplier_id);
      if ($supplier) {
        $supplierData = $this->formatSupplierData($supplier);
        Log::info('SupplierQuotationResource - Supplier loaded via direct query', [
          'quotation_id' => $this->id,
          'supplier_id' => $supplier->id,
          'company_name' => $supplier->company_name,
        ]);
      } else {
        Log::error('SupplierQuotationResource - Supplier not found in database', [
          'quotation_id' => $this->id,
          'supplier_id' => $this->supplier_id,
        ]);

        // Fallback data
        $supplierData = [
          'id' => $this->supplier_id,
          'company_name' => 'Supplier #' . $this->supplier_id,
          'company_email' => null,
          'company_phone' => null,
          'status' => 'UNKNOWN',
          'status_label' => 'Unknown',
          'is_active' => false,
          'is_blacklisted' => false,
          'display_name' => 'Supplier #' . $this->supplier_id,
          'full_address' => null,
          'category' => null,
          'category_label' => null,
        ];
      }
    }

    // ✅ Get upload data if pdf_upload_id exists
    $uploadData = null;
    if (!empty($this->pdf_upload_id)) {
      // Check if upload is loaded via relationship
      if ($this->relationLoaded('pdfUpload') && $this->pdfUpload) {
        $uploadData = $this->formatUploadData($this->pdfUpload);
        Log::info('SupplierQuotationResource - Upload loaded via relationship', [
          'quotation_id' => $this->id,
          'upload_id' => $this->pdfUpload->id,
          'file_name' => $this->pdfUpload->file_name,
        ]);
      } else {
        // Try direct query if relationship not loaded
        Log::warning('SupplierQuotationResource - Upload not loaded via relationship, trying direct query', [
          'quotation_id' => $this->id,
          'pdf_upload_id' => $this->pdf_upload_id,
        ]);

        $upload = \App\Models\Upload::find($this->pdf_upload_id);
        if ($upload) {
          $uploadData = $this->formatUploadData($upload);
          Log::info('SupplierQuotationResource - Upload loaded via direct query', [
            'quotation_id' => $this->id,
            'upload_id' => $upload->id,
            'file_name' => $upload->file_name,
          ]);
        } else {
          Log::error('SupplierQuotationResource - Upload not found in database', [
            'quotation_id' => $this->id,
            'pdf_upload_id' => $this->pdf_upload_id,
          ]);

          // Fallback upload data
          $uploadData = [
            'id' => $this->pdf_upload_id,
            'file_name' => null,
            'original_name' => null,
            'file_path' => null,
            'file_url' => null,
            'file_type' => null,
            'mime_type' => null,
            'extension' => null,
            'file_size' => null,
            'formatted_size' => null,
            'collection' => null,
            'title' => null,
            'description' => null,
            'meta_data' => null,
            'status' => 'unknown',
            'status_label' => 'Unknown',
            'uploaded_by' => null,
            'uploaded_by_user' => null,
            'uploaded_at' => null,
            'created_at' => null,
            'updated_at' => null,
          ];
        }
      }
    }

    return [
      'id' => $this->id,
      'quotation_request_id' => $this->quotation_request_id,
      'supplier_id' => $this->supplier_id,
      'quotation_number' => $this->quotation_number,
      'supplier_reference_no' => $this->supplier_reference_no,
      'submission_date' => $this->submission_date?->toDateString(),
      'validity_date' => $this->validity_date?->toDateString(),
      'delivery_time' => $this->delivery_time,
      'payment_terms' => $this->payment_terms,
      'delivery_terms' => $this->delivery_terms,
      'warranty_terms' => $this->warranty_terms,
      'total_amount' => $this->total_amount,
      'formatted_total_amount' => $this->formatted_total_amount,
      'tax_amount' => $this->tax_amount,
      'discount_amount' => $this->discount_amount,
      'net_amount' => $this->net_amount,
      'formatted_net_amount' => $this->formatted_net_amount,
      'currency' => $this->currency,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_lowest' => $this->is_lowest,
      'is_valid' => $this->is_valid,
      'submission_method' => $this->submission_method,
      'submission_method_label' => $this->submission_method_label,
      'verification_status' => $this->verification_status,
      'verification_status_label' => $this->verification_status_label,
      'notes' => $this->notes,

      // ✅ Download tracking fields
      'download_count' => (int) ($this->download_count ?? 0),
      'last_downloaded_at' => $this->last_downloaded_at?->toDateTimeString(),
      'pdf_storage_path' => $this->pdf_storage_path,
      'pdf_filename' => $this->pdf_filename,
      'pdf_upload_id' => $this->pdf_upload_id,

      // ✅ Upload data (included when upload exists)
      'upload' => $uploadData,

      // Supplier data
      'supplier' => $supplierData,

      // ✅ Items relationship - NOW INCLUDING requisition_item_id
      'items' => $this->whenLoaded('items', function () {
        return $this->items->map(function ($item) {
          return [
            'id' => $item->id,
            'requisition_item_id' => $item->requisition_item_id, // ✅ CRITICAL: Added this field
            'item_name' => $item->item_name,
            'description' => $item->description,
            'unit_of_measure' => $item->unit_of_measure,
            'quantity' => $item->quantity,
            'formatted_quantity' => $item->formatted_quantity,
            'unit_price' => $item->unit_price,
            'formatted_unit_price' => $item->formatted_unit_price,
            'total_price' => $item->total_price,
            'formatted_total_price' => $item->formatted_total_price,
            'tax_rate' => $item->tax_rate,
            'tax_amount' => $item->tax_amount,
            'discount_rate' => $item->discount_rate,
            'discount_amount' => $item->discount_amount,
            'net_price' => $item->net_price,
            'formatted_net_price' => $item->formatted_net_price,
            'delivery_days' => $item->delivery_days,
            'warranty_months' => $item->warranty_months,
            'brand' => $item->brand,
            'model' => $item->model,
            'is_alternative' => $item->is_alternative,
            'specifications' => $item->specifications,
          ];
        });
      }),

      // Quotation request relationship
      'quotation_request' => $this->whenLoaded('quotationRequest', function () {
        return [
          'id' => $this->quotationRequest->id,
          'qtn_number' => $this->quotationRequest->qtn_number,
          'title' => $this->quotationRequest->title,
          'status' => $this->quotationRequest->status,
          'status_label' => $this->quotationRequest->status_label,
          'requisition_id' => $this->quotationRequest->requisition_id,
          'closing_date' => $this->quotationRequest->closing_date?->toDateString(),
          'issue_date' => $this->quotationRequest->issue_date?->toDateString(),
        ];
      }),

      'evaluation' => [
        'score' => $this->evaluation_score,
        'notes' => $this->evaluation_notes,
        'evaluated_at' => $this->evaluated_at?->toDateTimeString(),
        'evaluated_by' => $this->evaluatedBy?->full_name,
      ],
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }

  /**
   * Format supplier data consistently
   */
  private function formatSupplierData($supplier): array
  {
    return [
      'id' => $supplier->id,
      'user_id' => $supplier->user_id,
      'company_name' => $supplier->company_name,
      'company_email' => $supplier->company_email,
      'company_phone' => $supplier->company_phone,
      'company_registration' => $supplier->company_registration,
      'company_address' => $supplier->company_address,
      'company_website' => $supplier->company_website,
      'tax_id' => $supplier->tax_id,
      'category' => $supplier->category,
      'category_label' => $supplier->category_label ?? $supplier->category,
      'status' => $supplier->status,
      'status_label' => $supplier->status_label ?? $supplier->status,
      'status_color' => $supplier->status_color ?? 'gray',
      'description' => $supplier->description,
      'established_year' => $supplier->established_year,
      'employee_count' => $supplier->employee_count,
      'annual_revenue' => $supplier->annual_revenue,
      'formatted_annual_revenue' => $supplier->formatted_annual_revenue ?? null,
      'certifications' => $supplier->certifications,
      'certifications_array' => $supplier->certifications_array ?? [],
      'registration_date' => $supplier->registration_date?->toDateString(),
      'license_number' => $supplier->license_number,
      'bank_name' => $supplier->bank_name,
      'bank_account' => $supplier->bank_account,
      'bank_branch' => $supplier->bank_branch,
      'banking_summary' => $supplier->banking_summary ?? 'No banking information provided',
      'payment_terms' => $supplier->payment_terms,
      'preferred_currency' => $supplier->preferred_currency,
      'contact_person_name' => $supplier->contact_person_name,
      'contact_person_email' => $supplier->contact_person_email,
      'contact_person_phone' => $supplier->contact_person_phone,
      'contact_person_full_name' => $supplier->contact_person_full_name ?? 'N/A',
      'company_logo' => $supplier->company_logo,
      'company_logo_url' => $supplier->company_logo_url ?? null,
      'full_address' => $supplier->full_address ?? null,
      'display_name' => $supplier->display_name ?? $supplier->company_name,
      'is_active' => $supplier->isActive(),
      'is_blacklisted' => $supplier->isBlacklisted(),
      'has_company_logo' => $supplier->hasCompanyLogo(),
      'created_at' => $supplier->created_at?->toDateTimeString(),
      'updated_at' => $supplier->updated_at?->toDateTimeString(),
    ];
  }

  /**
   * Format upload data consistently
   */
  private function formatUploadData($upload): array
  {
    // ✅ Get the user who uploaded the file
    $uploadedByUser = null;
    $uploadedByName = null;

    if (!empty($upload->uploaded_by)) {
      try {
        $user = \App\Models\User::find($upload->uploaded_by);
        if ($user) {
          $uploadedByUser = [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'role_label' => $user->role_label,
          ];
          $uploadedByName = $user->full_name;

          Log::info('SupplierQuotationResource - Uploaded by user found', [
            'upload_id' => $upload->id,
            'user_id' => $user->id,
            'user_name' => $user->full_name,
          ]);
        } else {
          Log::warning('SupplierQuotationResource - Uploaded by user not found', [
            'upload_id' => $upload->id,
            'uploaded_by' => $upload->uploaded_by,
          ]);
          $uploadedByName = 'Unknown User (ID: ' . $upload->uploaded_by . ')';
        }
      } catch (\Exception $e) {
        Log::error('SupplierQuotationResource - Error fetching uploaded by user', [
          'upload_id' => $upload->id,
          'uploaded_by' => $upload->uploaded_by,
          'error' => $e->getMessage(),
        ]);
        $uploadedByName = 'Unknown User';
      }
    }

    return [
      'id' => $upload->id,
      'uploadable_type' => $upload->uploadable_type,
      'uploadable_id' => $upload->uploadable_id,
      'file_name' => $upload->file_name,
      'original_name' => $upload->original_name,
      'file_path' => $upload->file_path,
      'file_url' => $upload->file_url ?? $this->getFileUrl($upload),
      'file_type' => $upload->file_type,
      'mime_type' => $upload->mime_type,
      'extension' => $upload->extension,
      'file_size' => $upload->file_size,
      'formatted_size' => $upload->formatted_size ?? $this->formatFileSize($upload->file_size),
      'width' => $upload->width,
      'height' => $upload->height,
      'image_orientation' => $upload->image_orientation,
      'disk' => $upload->disk,
      'collection' => $upload->collection,
      'title' => $upload->title,
      'description' => $upload->description,
      'meta_data' => $upload->meta_data,
      'status' => $upload->status,
      'status_label' => $this->getUploadStatusLabel($upload->status),
      'uploaded_by' => $upload->uploaded_by,
      'uploaded_by_user' => $uploadedByUser,
      'uploaded_by_name' => $uploadedByName,
      'uploaded_at' => $upload->uploaded_at?->toDateTimeString(),
      'created_at' => $upload->created_at?->toDateTimeString(),
      'updated_at' => $upload->updated_at?->toDateTimeString(),
      'is_image' => $upload->is_image ?? $this->isImageFile($upload),
      'is_document' => $upload->file_type === 'document',
    ];
  }

  /**
   * Get the file URL from storage path
   */
  private function getFileUrl($upload): ?string
  {
    if ($upload->file_url) {
      return $upload->file_url;
    }

    if ($upload->file_path) {
      return asset('storage/' . $upload->file_path);
    }

    return null;
  }

  /**
   * Format file size from bytes
   */
  private function formatFileSize(?int $bytes): string
  {
    if (!$bytes) return '0 B';

    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = 0;
    $size = $bytes;

    while ($size >= 1024 && $i < count($units) - 1) {
      $size /= 1024;
      $i++;
    }

    return round($size, 2) . ' ' . $units[$i];
  }

  /**
   * Get upload status label
   */
  private function getUploadStatusLabel(?string $status): string
  {
    $labels = [
      'completed' => 'Completed',
      'pending' => 'Pending',
      'processing' => 'Processing',
      'failed' => 'Failed',
      'deleted' => 'Deleted',
    ];

    return $labels[$status] ?? ucfirst($status ?? 'Unknown');
  }

  /**
   * Check if file is an image
   */
  private function isImageFile($upload): bool
  {
    if ($upload->file_type === 'image' || $upload->file_type === 'photo') {
      return true;
    }

    $imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return in_array($upload->mime_type, $imageMimeTypes);
  }
}
