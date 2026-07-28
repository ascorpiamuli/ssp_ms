<?php
// app/Http/Requests/Requisition/UpdateRequisitionItemRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Requisition;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequisitionItemRequest extends FormRequest
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
      'item_name' => ['sometimes', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:1000'],
      'unit_of_measure' => ['sometimes', 'string', 'max:50'],
      'quantity' => ['sometimes', 'numeric', 'min:0.01'],
      'estimated_unit_cost' => ['sometimes', 'numeric', 'min:0'],
      'specifications' => ['nullable', 'string', 'max:1000'],
      'catalog_number' => ['nullable', 'string', 'max:100'],
      'manufacturer' => ['nullable', 'string', 'max:255'],
      'model_number' => ['nullable', 'string', 'max:100'],
      'supplier_id' => ['nullable', 'exists:suppliers,id'],
      'is_inventory_item' => ['nullable', 'boolean'],
      'inventory_code' => ['nullable', 'string', 'max:100'],
      'tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
      'discount_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'quantity.min' => 'Quantity must be greater than 0.',
      'estimated_unit_cost.min' => 'Estimated unit cost must be greater than or equal to 0.',
    ];
  }
}
