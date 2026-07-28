<?php
// app/Http/Requests/Budget/StoreBudgetRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Budget;

use Illuminate\Foundation\Http\FormRequest;

class StoreBudgetRequest extends FormRequest
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
      'budget_code' => ['required', 'string', 'max:100'],
      'budget_line_item' => ['nullable', 'string', 'max:255'],
      'budget_category' => ['nullable', 'string', 'max:255'],
      'budget_type' => ['nullable', 'in:capital,recurrent,emergency,project'],
      'project_id' => ['nullable', 'string', 'max:100'],
      'grant_code' => ['nullable', 'string', 'max:100'],
      'allocated_amount' => ['required', 'numeric', 'min:0'],
      'utilized_amount' => ['nullable', 'numeric', 'min:0', 'lte:allocated_amount'],
      'requested_amount' => ['required', 'numeric', 'min:0.01'],
      'fiscal_year' => ['nullable', 'string', 'max:20'],
      'fiscal_quarter' => ['nullable', 'string', 'max:10'],
      'budget_start_date' => ['nullable', 'date'],
      'budget_end_date' => ['nullable', 'date', 'after_or_equal:budget_start_date'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'budget_code.required' => 'Budget code is required.',
      'allocated_amount.required' => 'Allocated amount is required.',
      'allocated_amount.min' => 'Allocated amount must be greater than or equal to 0.',
      'requested_amount.required' => 'Requested amount is required.',
      'requested_amount.min' => 'Requested amount must be greater than 0.',
      'utilized_amount.lte' => 'Utilized amount cannot exceed allocated amount.',
      'budget_end_date.after_or_equal' => 'End date must be after or equal to start date.',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    $this->merge([
      'budget_type' => $this->budget_type ?? 'recurrent',
      'utilized_amount' => $this->utilized_amount ?? 0,
      'fiscal_year' => $this->fiscal_year ?? date('Y'),
    ]);
  }
}
