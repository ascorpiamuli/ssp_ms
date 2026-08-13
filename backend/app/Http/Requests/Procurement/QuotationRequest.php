<?php
// app/Http/Requests/Procurement/QuotationRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuotationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requisition_id' => 'required|exists:requisitions,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'issue_date' => 'required|date',
            'closing_date' => 'required|date|after_or_equal:issue_date',
            'closing_time' => 'nullable|date_format:H:i',
            'delivery_terms' => 'nullable|string',
            'payment_terms' => 'nullable|string',
            'special_conditions' => 'nullable|string',
            'instructions' => 'nullable|string',
            'is_automated' => 'boolean',
            'is_tender' => 'boolean',
            'tender_number' => 'nullable|string|max:50',
            'reminder_days' => 'integer|min:0|max:30',
            // Option A: Validate against suppliers table
            'supplier_ids' => 'required|array|min:1',
            'supplier_ids.*' => 'exists:suppliers,id',
            // Option B: Validate against users table with supplier check
            // 'supplier_ids.*' => [
            //     'required',
            //     'integer',
            //     'exists:users,id',
            //     function ($attribute, $value, $fail) {
            //         $user = \App\Models\User::find($value);
            //         if ($user && $user->is_supplier !== true) {
            //             $fail('The selected supplier is not valid.');
            //         }
            //     }
            // ],
            'metadata' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'requisition_id.required' => 'Requisition ID is required.',
            'requisition_id.exists' => 'Requisition does not exist.',
            'title.required' => 'Title is required.',
            'closing_date.required' => 'Closing date is required.',
            'closing_date.after_or_equal' => 'Closing date must be after or equal to issue date.',
            'supplier_ids.required' => 'At least one supplier must be selected.',
            'supplier_ids.min' => 'At least one supplier must be selected.',
            'supplier_ids.*.exists' => 'One or more suppliers do not exist.',
            // Custom messages for Option B
            // 'supplier_ids.*.exists' => 'One or more supplier users do not exist.',
        ];
    }
}
