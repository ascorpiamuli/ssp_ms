<?php
// app/Http/Requests/Approval/UpdateApprovalWorkflowRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Approval;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApprovalWorkflowRequest extends FormRequest
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
      'department_id' => ['sometimes', 'exists:departments,id'],
      'name' => ['sometimes', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:1000'],
      'approval_levels' => ['sometimes', 'array', 'min:1'],
      'approval_levels.*.level' => ['required', 'in:hod,accountant,principal,final'],
      'approval_levels.*.order' => ['required', 'integer', 'min:1'],
      'approval_levels.*.required' => ['nullable', 'boolean'],
      'approval_levels.*.approver_id' => ['nullable', 'exists:users,id'],
      'is_active' => ['nullable', 'boolean'],
      'is_default' => ['nullable', 'boolean'],
      'min_amount' => ['nullable', 'numeric', 'min:0'],
      'max_amount' => ['nullable', 'numeric', 'min:0', 'gte:min_amount'],
      'required_approvals' => ['nullable', 'integer', 'min:1'],
      'require_all_approvals' => ['nullable', 'boolean'],
      'allow_delegation' => ['nullable', 'boolean'],
      'sla_hours' => ['nullable', 'integer', 'min:1'],
      'reminder_hours' => ['nullable', 'integer', 'min:1'],
      'escalation_hours' => ['nullable', 'integer', 'min:1'],
      'max_revisions' => ['nullable', 'integer', 'min:0'],
    ];
  }

  /**
   * Get custom messages for validation errors.
   */
  public function messages(): array
  {
    return [
      'approval_levels.*.level.in' => 'Invalid level specified.',
      'approval_levels.*.order.required' => 'Order is required for each approval level.',
      'max_amount.gte' => 'Maximum amount must be greater than or equal to minimum amount.',
    ];
  }
}
