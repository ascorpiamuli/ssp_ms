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

    // Get upload data if pdf_upload_id exists
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

      // Download tracking fields
      'download_count' => (int) ($this->download_count ?? 0),
      'last_downloaded_at' => $this->last_downloaded_at?->toDateTimeString(),
      'pdf_storage_path' => $this->pdf_storage_path,
      'pdf_filename' => $this->pdf_filename,
      'pdf_upload_id' => $this->pdf_upload_id,

      // Upload data (included when upload exists)
      'upload' => $uploadData,

      // Supplier data
      'supplier' => $supplierData,

      // ✅ Items relationship - INCLUDING requisition_item_id
      'items' => $this->whenLoaded('items', function () {
        return $this->items->map(function ($item) {
          return [
            'id' => $item->id,
            'requisition_item_id' => $item->requisition_item_id,
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

      // ✅ FULL Quotation request relationship with requisition details
      'quotation_request' => $this->whenLoaded('quotationRequest', function () {
        $quotationRequest = $this->quotationRequest;

        return [
          'id' => $quotationRequest->id,
          'qtn_number' => $quotationRequest->qtn_number,
          'title' => $quotationRequest->title,
          'description' => $quotationRequest->description,
          'status' => $quotationRequest->status,
          'status_label' => $quotationRequest->status_label,
          'requisition_id' => $quotationRequest->requisition_id,
          'closing_date' => $quotationRequest->closing_date?->toDateString(),
          'issue_date' => $quotationRequest->issue_date?->toDateString(),
          'closing_time' => $quotationRequest->closing_time,
          'delivery_terms' => $quotationRequest->delivery_terms,
          'payment_terms' => $quotationRequest->payment_terms,
          'special_conditions' => $quotationRequest->special_conditions,
          'instructions' => $quotationRequest->instructions,
          'is_automated' => $quotationRequest->is_automated,
          'is_tender' => $quotationRequest->is_tender,
          'tender_number' => $quotationRequest->tender_number,

          // ✅ Include the full requisition with all details
          'requisition' => $this->whenLoaded('requisition', function () {
            return $this->formatFullRequisition($this->requisition);
          }),
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
   * ✅ Format full requisition with all details
   */
  private function formatFullRequisition($requisition): array
  {
    if (!$requisition) {
      return [];
    }

    return [
      'id' => $requisition->id,
      'reference_number' => $requisition->reference_number,
      'title' => $requisition->title,
      'description' => $requisition->description,
      'total_amount' => $requisition->total_amount,
      'formatted_total_amount' => number_format((float) ($requisition->total_amount ?? 0), 2),
      'status' => $requisition->status,
      'status_label' => $requisition->status_label,
      'status_color' => $requisition->status_color,

      // ✅ Requisition Type Fields
      'requisition_type' => $requisition->requisition_type,
      'requisition_type_label' => $requisition->requisition_type_label ?? $this->getRequisitionTypeLabel($requisition->requisition_type),
      'procurement_type' => $requisition->procurement_type,
      'procurement_type_label' => $requisition->procurement_type_label ?? $this->getProcurementTypeLabel($requisition->procurement_type),
      'is_service_requisition' => $requisition->is_service_requisition ?? ($requisition->requisition_type === 'services'),
      'is_goods_requisition' => $requisition->is_goods_requisition ?? ($requisition->requisition_type === 'goods'),
      'will_generate_lpo' => $requisition->will_generate_lpo ?? false,
      'will_generate_lso' => $requisition->will_generate_lso ?? false,
      'order_type' => $requisition->order_type ?? ($requisition->requisition_type === 'services' ? 'LSO' : 'LPO'),

      // ✅ Service-Specific Fields
      'service_category' => $requisition->service_category,
      'service_category_label' => $requisition->service_category_label ?? $this->getServiceCategoryLabel($requisition->service_category),
      'service_scope_of_work' => $requisition->service_scope_of_work,
      'service_deliverables_expected' => $requisition->service_deliverables_expected,
      'service_expected_start_date' => $requisition->service_expected_start_date?->toDateString(),
      'service_expected_end_date' => $requisition->service_expected_end_date?->toDateString(),
      'service_estimated_duration_days' => $requisition->service_estimated_duration_days,
      'service_requires_onsite_visit' => $requisition->service_requires_onsite_visit ?? false,
      'service_special_requirements' => $requisition->service_special_requirements,
      'service_qualifications_required' => $requisition->service_qualifications_required,
      'service_experience_required' => $requisition->service_experience_required,
      'service_certifications_required' => $requisition->service_certifications_required,
      'service_insurance_required' => $requisition->service_insurance_required ?? false,
      'service_insurance_details' => $requisition->service_insurance_details,
      'service_contract_type' => $requisition->service_contract_type,
      'service_contract_duration' => $requisition->service_contract_duration,
      'service_renewal_options' => $requisition->service_renewal_options,

      // ✅ Goods-Specific Fields
      'goods_category' => $requisition->goods_category,
      'goods_warehouse_location' => $requisition->goods_warehouse_location,
      'goods_storage_requirements' => $requisition->goods_storage_requirements,
      'goods_expected_delivery_date' => $requisition->goods_expected_delivery_date?->toDateString(),
      'goods_delivery_terms' => $requisition->goods_delivery_terms,
      'goods_warranty_required' => $requisition->goods_warranty_required ?? false,
      'goods_warranty_period' => $requisition->goods_warranty_period,
      'goods_specifications' => $requisition->goods_specifications,
      'goods_quality_requirements' => $requisition->goods_quality_requirements,
      'goods_installation_required' => $requisition->goods_installation_required ?? false,

      // ✅ Additional Fields
      'priority' => $requisition->priority,
      'priority_label' => $requisition->priority_label,
      'type' => $requisition->type,
      'type_label' => $requisition->type_label,
      'urgency' => $requisition->urgency,
      'urgency_label' => $requisition->urgency_label,
      'justification' => $requisition->justification,
      'required_by_date' => $requisition->required_by_date?->toDateString(),
      'required_delivery_date' => $requisition->required_delivery_date?->toDateTimeString(),
      'budget_code' => $requisition->budget_code,
      'budget_source' => $requisition->budget_source,
      'funding_source' => $requisition->funding_source,
      'project_code' => $requisition->project_code,
      'procurement_method' => $requisition->procurement_method,
      'risk_level' => $requisition->risk_level,
      'risk_level_label' => $requisition->risk_level_label,
      'is_compliant' => $requisition->is_compliant,
      'currency' => $requisition->currency,
      'exchange_rate' => $requisition->exchange_rate,

      // ✅ Dates
      'submitted_at' => $requisition->submitted_at?->toDateTimeString(),
      'created_at' => $requisition->created_at?->toDateTimeString(),
      'updated_at' => $requisition->updated_at?->toDateTimeString(),

      // ✅ Relationships - Department
      'department' => $requisition->department ? [
        'id' => $requisition->department->id,
        'name' => $requisition->department->name,
        'code' => $requisition->department->code,
      ] : null,

      // ✅ Relationships - User (Requester)
      'user' => $requisition->user ? [
        'id' => $requisition->user->id,
        'full_name' => $requisition->user->full_name,
        'email' => $requisition->user->email,
        'first_name' => $requisition->user->first_name,
        'last_name' => $requisition->user->last_name,
        'role_label' => $requisition->user->role_label,
      ] : null,

      // ✅ Relationships - Supplier
      'supplier' => $requisition->supplier ? [
        'id' => $requisition->supplier->id,
        'company_name' => $requisition->supplier->company_name,
        'company_email' => $requisition->supplier->company_email,
        'company_phone' => $requisition->supplier->company_phone,
      ] : null,

      // ✅ Items from requisition
      'items' => $requisition->items ? $requisition->items->map(function ($item) {
        return [
          'id' => $item->id,
          'item_name' => $item->item_name,
          'description' => $item->description,
          'unit_of_measure' => $item->unit_of_measure,
          'quantity' => $item->quantity,
          'estimated_unit_cost' => $item->estimated_unit_cost,
          'total_cost' => $item->total_cost,
          'specifications' => $item->specifications,
          'catalog_number' => $item->catalog_number,
          'manufacturer' => $item->manufacturer,
          'model_number' => $item->model_number,
          'tax_rate' => $item->tax_rate,
          'discount_percentage' => $item->discount_percentage,
          'is_inventory_item' => $item->is_inventory_item,
          'inventory_code' => $item->inventory_code,
          'status' => $item->status,
          'status_label' => $item->status_label,
        ];
      }) : [],

      // ✅ Approvals
      'approvals' => $requisition->approvals ? $requisition->approvals->map(function ($approval) {
        return [
          'id' => $approval->id,
          'level' => $approval->level,
          'level_label' => $approval->level_label,
          'status' => $approval->status,
          'status_label' => $approval->status_label,
          'comment' => $approval->comment,
          'reason' => $approval->reason,
          'is_delegated' => $approval->is_delegated,
          'reviewed_at' => $approval->reviewed_at?->toDateTimeString(),
          'due_date' => $approval->due_date?->toDateTimeString(),
          'approver' => $approval->approver ? [
            'id' => $approval->approver->id,
            'full_name' => $approval->approver->full_name,
            'email' => $approval->approver->email,
            'role_label' => $approval->approver->role_label,
          ] : null,
          'delegate' => $approval->delegate ? [
            'id' => $approval->delegate->id,
            'full_name' => $approval->delegate->full_name,
            'role_label' => $approval->delegate->role_label,
          ] : null,
          'created_at' => $approval->created_at?->toDateTimeString(),
          'updated_at' => $approval->updated_at?->toDateTimeString(),
        ];
      }) : [],

      // ✅ Metadata
      'metadata' => $requisition->metadata,

      // ✅ Flags
      'is_editable' => $requisition->is_editable ?? false,
      'is_approvable' => $requisition->is_approvable ?? false,
      'is_returnable' => $requisition->is_returnable ?? false,
      'can_be_revised' => $requisition->can_be_revised ?? false,
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
        } else {
          $uploadedByName = 'Unknown User (ID: ' . $upload->uploaded_by . ')';
        }
      } catch (\Exception $e) {
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

  /**
   * Get requisition type label
   */
  private function getRequisitionTypeLabel(?string $type): string
  {
    $labels = [
      'goods' => 'Goods (LPO)',
      'services' => 'Services (LSO)',
    ];
    return $labels[$type] ?? ucfirst($type ?? 'Unknown');
  }

  /**
   * Get procurement type label
   */
  private function getProcurementTypeLabel(?string $type): string
  {
    $labels = [
      'goods' => 'Goods (LPO)',
      'services' => 'Services (LSO)',
    ];
    return $labels[$type] ?? ucfirst($type ?? 'Unknown');
  }

  /**
   * Get service category label
   */
  private function getServiceCategoryLabel(?string $category): string
  {
    $labels = [
      'consultancy' => 'Consultancy',
      'maintenance' => 'Maintenance',
      'training' => 'Training',
      'installation' => 'Installation',
      'cleaning' => 'Cleaning',
      'security' => 'Security',
      'transport' => 'Transport',
      'construction' => 'Construction',
      'professional_services' => 'Professional Services',
      'it_services' => 'IT Services',
      'other' => 'Other',
    ];
    return $labels[$category] ?? ucfirst($category ?? 'Not Specified');
  }
}
