<?php
// app/Http/Requests/Requisition/IndexRequisitionRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Requisition;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class IndexRequisitionRequest extends FormRequest
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
      'search' => ['nullable', 'string', 'max:255'],
      'status' => ['nullable', 'string', 'in:draft,submitted,hod_approved,hod_declined,accountant_approved,accountant_declined,principal_approved,principal_declined,final_approved,final_declined,returned,cancelled,revised'],
      'department_id' => ['nullable', 'exists:departments,id'],
      'user_id' => ['nullable', 'exists:users,id'],
      'priority' => ['nullable', 'in:low,medium,high,emergency'],
      'date_from' => ['nullable', 'date', 'date_format:Y-m-d'],
      'date_to' => ['nullable', 'date', 'date_format:Y-m-d', 'after_or_equal:date_from'],
      'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
      'page' => ['nullable', 'integer', 'min:1'],
      'view_mode' => ['nullable', 'in:my,pending_approvals,all'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'date_to.after_or_equal' => 'End date must be after or equal to start date.',
      'per_page.max' => 'Maximum items per page is 100.',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // If view_mode is not provided, set default based on user role
    if (!$this->has('view_mode')) {
      $user = Auth::user();

      // Check if user is an approver (has approval roles)
      $approverRoles = ['hod', 'accountant', 'principal', 'final_approver', 'admin'];
      $isApprover = false;

      if ($user) {
        // Check if user has any approver role
        if (method_exists($user, 'hasRole')) {
          $isApprover = $user->hasRole($approverRoles);
        } elseif (isset($user->role)) {
          $isApprover = in_array(strtolower($user->role), $approverRoles);
        }
      }

      $this->merge([
        'view_mode' => $isApprover ? 'pending_approvals' : 'my'
      ]);
    }
  }
}
