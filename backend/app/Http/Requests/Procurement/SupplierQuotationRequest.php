<?php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\QuotationRequest;

class SupplierQuotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Check if this is a service requisition
        $isService = false;
        $qtnId = $this->input('quotation_request_id');

        if ($qtnId) {
            $qtn = QuotationRequest::with('requisition')->find($qtnId);
            if ($qtn && $qtn->requisition) {
                $isService = $qtn->requisition->requisition_type === 'services';
            }
        }

        $rules = [
            'quotation_request_id' => 'required|exists:quotation_requests,id',
            'supplier_id' => 'required|exists:suppliers,id',
            'supplier_reference_no' => 'nullable|string|max:100',
            'submission_date' => 'nullable|date',
            'validity_date' => 'nullable|date|after_or_equal:submission_date',
            'delivery_time' => 'nullable|string|max:100',
            'payment_terms' => 'nullable|string',
            'delivery_terms' => 'nullable|string',
            'warranty_terms' => 'nullable|string',
            'currency' => 'nullable|string|size:3',
            'submission_method' => 'nullable|in:system,upload,manual',
            'uploaded_file_path' => 'nullable|string|max:500',
            'original_filename' => 'nullable|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.description' => 'nullable|string',
            'items.*.unit_of_measure' => 'required|string|max:50',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.discount_rate' => 'nullable|numeric|min:0|max:100',
            'items.*.delivery_days' => 'nullable|integer|min:0',
            'items.*.warranty_months' => 'nullable|integer|min:0',
            'items.*.specifications' => 'nullable|string',
            'items.*.brand' => 'nullable|string|max:100',
            'items.*.model' => 'nullable|string|max:100',
            'items.*.is_alternative' => 'nullable|boolean',
            'items.*.alternative_notes' => 'nullable|string',
            'items.*.is_custom' => 'nullable|boolean', // ✅ Allow frontend to specify custom
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ];

        // Conditional validation for requisition_item_id
        // For services: always optional (null or 0 allowed)
        // For goods: optional only if marked as custom/alternative
        if ($isService) {
            $rules['items.*.requisition_item_id'] = 'nullable|integer|min:0|exists:requisition_items,id';
        } else {
            // For goods: required unless it's a custom/alternative item
            $rules['items.*.requisition_item_id'] = 'required_if:items.*.is_custom,false,items.*.is_alternative,false|nullable|integer|min:0|exists:requisition_items,id';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'quotation_request_id.required' => 'Quotation request ID is required.',
            'quotation_request_id.exists' => 'Quotation request does not exist.',
            'supplier_id.required' => 'Supplier ID is required.',
            'supplier_id.exists' => 'Supplier does not exist.',
            'items.required' => 'At least one item is required.',
            'items.min' => 'At least one item is required.',
            'items.*.item_name.required' => 'Item name is required.',
            'items.*.quantity.required' => 'Quantity is required.',
            'items.*.quantity.min' => 'Quantity must be greater than 0.',
            'items.*.unit_price.required' => 'Unit price is required.',
            'validity_date.after_or_equal' => 'Validity date must be after or equal to submission date.',
            'items.*.requisition_item_id.required_if' => 'Requisition item ID is required for non-custom items.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $qtnId = $this->input('quotation_request_id');
        if ($qtnId) {
            $qtn = QuotationRequest::with('requisition')->find($qtnId);
            $isService = $qtn && $qtn->requisition && $qtn->requisition->requisition_type === 'services';

            $items = $this->input('items', []);
            foreach ($items as $key => $item) {
                // For service requisitions, always convert 0 to null
                if ($isService) {
                    if (isset($item['requisition_item_id']) && $item['requisition_item_id'] === 0) {
                        $items[$key]['requisition_item_id'] = null;
                    }
                    // Mark as custom for services if no requisition_item_id
                    if (!isset($item['requisition_item_id']) || $item['requisition_item_id'] === null) {
                        $items[$key]['is_custom'] = true;
                    }
                } else {
                    // For goods, check if it's custom/alternative
                    $isCustom = $item['is_custom'] ?? false;
                    $isAlternative = $item['is_alternative'] ?? false;

                    if ($isCustom || $isAlternative) {
                        // Convert 0 to null for custom/alternative items
                        if (isset($item['requisition_item_id']) && $item['requisition_item_id'] === 0) {
                            $items[$key]['requisition_item_id'] = null;
                        }
                    }
                }
            }
            $this->merge(['items' => $items]);
        }
    }
}
