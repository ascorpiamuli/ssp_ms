<?php
// app/Http/Requests/Requisition/StoreRequisitionItemRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Requisition;

use Illuminate\Foundation\Http\FormRequest;

class StoreRequisitionItemRequest extends FormRequest
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
      'item_name' => ['required', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:1000'],
      'unit_of_measure' => ['required', 'string', 'max:50'],
      'quantity' => ['required', 'numeric', 'min:0.01'],
      'estimated_unit_cost' => ['required', 'numeric', 'min:0'],
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
      'item_name.required' => 'Item name is required.',
      'unit_of_measure.required' => 'Unit of measure is required.',
      'quantity.required' => 'Quantity is required.',
      'quantity.min' => 'Quantity must be greater than 0.',
      'estimated_unit_cost.required' => 'Estimated unit cost is required.',
      'estimated_unit_cost.min' => 'Estimated unit cost must be greater than or equal to 0.',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    $this->merge([
      'is_inventory_item' => $this->is_inventory_item ?? false,
      'tax_rate' => $this->tax_rate ?? 0,
      'discount_percentage' => $this->discount_percentage ?? 0,
    ]);
  }
}
