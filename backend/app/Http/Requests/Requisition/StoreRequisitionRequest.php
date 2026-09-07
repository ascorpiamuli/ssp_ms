<?php
// app/Http/Requests/Requisition/StoreRequisitionRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Requisition;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequisitionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // === REFERENCE NUMBER ===
            'reference_number' => ['nullable', 'string', 'max:50', 'unique:requisitions,reference_number'],

            // === REQUISITION TYPE ===
            'requisition_type' => ['required', 'in:goods,services'],
            'procurement_type' => ['nullable', 'in:goods,services'],

            // === REQUISITION DETAILS ===
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'department_id' => ['required', 'exists:departments,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],

            // === SERVICE-SPECIFIC FIELDS ===
            'service_category' => ['nullable', 'in:consultancy,maintenance,training,installation,cleaning,security,transport,construction,professional_services,it_services,other'],
            'service_scope_of_work' => ['nullable', 'string', 'max:5000'],
            'service_deliverables_expected' => ['nullable', 'string', 'max:5000'],
            'service_expected_start_date' => ['nullable', 'date'],
            'service_expected_end_date' => ['nullable', 'date', 'after_or_equal:service_expected_start_date'],
            'service_estimated_duration_days' => ['nullable', 'integer', 'min:1'],
            'service_requires_onsite_visit' => ['nullable', 'boolean'],
            'service_special_requirements' => ['nullable', 'string', 'max:2000'],
            'service_qualifications_required' => ['nullable', 'string', 'max:1000'],

            // === GOODS-SPECIFIC FIELDS ===
            'goods_category' => ['nullable', 'string', 'max:100'],
            'goods_warehouse_location' => ['nullable', 'string', 'max:255'],
            'goods_storage_requirements' => ['nullable', 'string', 'max:1000'],
            'goods_expected_delivery_date' => ['nullable', 'date'],

            // === PRIORITY & TYPE ===
            'priority' => ['nullable', 'in:low,medium,high,emergency'],
            'type' => ['nullable', 'in:normal,emergency'],
            'urgency' => ['nullable', 'in:routine,urgent,critical'],

            // === JUSTIFICATION ===
            'justification' => ['nullable', 'string', 'max:1000'],
            'required_by_date' => ['nullable', 'date'],
            'required_delivery_date' => ['nullable', 'date'],

            // === BUDGET ===
            'budget_code' => ['nullable', 'string', 'max:100'],
            'budget_source' => ['nullable', 'string', 'max:100'],
            'funding_source' => ['nullable', 'string', 'max:100'],
            'project_code' => ['nullable', 'string', 'max:100'],

            // === PROCUREMENT ===
            'procurement_method' => ['nullable', 'in:direct_purchase,request_for_quotation,tender,framework_agreement,emergency_procurement'],
            'is_framework_agreement' => ['nullable', 'boolean'],
            'framework_agreement_id' => ['nullable', 'string', 'max:100'],

            // === COMPLIANCE ===
            'risk_level' => ['nullable', 'in:low,medium,high,critical'],
            'risk_mitigation' => ['nullable', 'string', 'max:1000'],
            'is_compliant' => ['nullable', 'boolean'],
            'compliance_notes' => ['nullable', 'string', 'max:1000'],

            // === CURRENCY ===
            'currency' => ['nullable', 'string', 'size:3'],
            'exchange_rate' => ['nullable', 'numeric', 'min:0'],

            // === METADATA ===
            'metadata' => ['nullable', 'array'],
            'custom_fields' => ['nullable', 'array'],

            // === ITEMS ===
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_name' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string', 'max:1000'],
            'items.*.unit_of_measure' => ['nullable', 'string', 'max:50'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.estimated_unit_cost' => ['required', 'numeric', 'min:0'],
            'items.*.specifications' => ['nullable', 'string', 'max:1000'],
            'items.*.catalog_number' => ['nullable', 'string', 'max:100'],
            'items.*.manufacturer' => ['nullable', 'string', 'max:255'],
            'items.*.model_number' => ['nullable', 'string', 'max:100'],
            'items.*.supplier_id' => ['nullable', 'exists:suppliers,id'],
            'items.*.is_inventory_item' => ['nullable', 'boolean'],
            'items.*.inventory_code' => ['nullable', 'string', 'max:100'],
            'items.*.tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'items.*.discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // === REQUISITION TYPE ===
            'requisition_type.required' => 'Please select a requisition type (Goods or Services).',
            'requisition_type.in' => 'Invalid requisition type. Must be "goods" or "services".',

            // === REQUISITION DETAILS ===
            'title.required' => 'The requisition title is required.',
            'department_id.required' => 'Please select a department.',
            'department_id.exists' => 'The selected department does not exist.',

            // === SERVICE-SPECIFIC ===
            'service_category.in' => 'Invalid service category.',
            'service_expected_end_date.after_or_equal' => 'Service end date must be after or equal to the start date.',

            // === ITEMS ===
            'items.required' => 'At least one item is required.',
            'items.min' => 'At least one item is required.',
            'items.*.item_name.required' => 'Item name is required for each item.',
            'items.*.quantity.required' => 'Quantity is required for each item.',
            'items.*.quantity.min' => 'Quantity must be greater than 0.',
            'items.*.estimated_unit_cost.required' => 'Estimated unit cost is required for each item.',
            'items.*.estimated_unit_cost.min' => 'Estimated unit cost must be 0 or greater.',

            // === REFERENCE ===
            'reference_number.unique' => 'This requisition number already exists.',

            // === DATES ===
            'service_expected_start_date.date' => 'Please enter a valid service start date.',
            'service_expected_end_date.date' => 'Please enter a valid service end date.',
            'goods_expected_delivery_date.date' => 'Please enter a valid delivery date.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'priority' => $this->input('priority', 'medium'),
            'type' => $this->input('type', 'normal'),
            'urgency' => $this->input('urgency', 'routine'),
            'currency' => $this->input('currency', 'KES'),
            'exchange_rate' => $this->input('exchange_rate', 1),
            'is_framework_agreement' => $this->input('is_framework_agreement', false),
            'is_compliant' => $this->input('is_compliant', true),

            // Set procurement_type to match requisition_type if not provided
            'procurement_type' => $this->input('procurement_type', $this->input('requisition_type')),

            // Ensure items is an array
            'items' => $this->input('items', []),

            // Ensure reference_number is passed through
            'reference_number' => $this->input('reference_number'),

            // Service fields - ensure boolean is cast properly
            'service_requires_onsite_visit' => $this->input('service_requires_onsite_visit', false),
        ]);

        // Conditional validation: If requisition_type is 'services', service_category is required
        if ($this->input('requisition_type') === 'services') {
            // We'll validate this in the rules with conditional logic
            // Or we can add a custom validator
        }

        // Conditional validation: If requisition_type is 'goods', goods_category is required
        if ($this->input('requisition_type') === 'goods') {
            // We'll validate this in the rules with conditional logic
        }
    }

    /**
     * Get the validation rules with conditional logic.
     *
     * @return array<string, mixed>
     */
    public function withValidator($validator)
    {
        $validator->sometimes('service_category', ['required', 'string'], function ($input) {
            return $input->requisition_type === 'services';
        });

        $validator->sometimes('service_scope_of_work', ['required', 'string', 'max:5000'], function ($input) {
            return $input->requisition_type === 'services';
        });

        $validator->sometimes('goods_category', ['required', 'string', 'max:100'], function ($input) {
            return $input->requisition_type === 'goods';
        });
    }
}
