<?php
// app/Http/Requests/Approval/StoreApprovalWorkflowRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Approval;

use Illuminate\Foundation\Http\FormRequest;

class StoreApprovalWorkflowRequest extends FormRequest
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
      'department_id' => ['required', 'exists:departments,id'],
      'name' => ['required', 'string', 'max:255'],
      'description' => ['nullable', 'string', 'max:1000'],
      'approval_levels' => ['required', 'array', 'min:1'],
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
      'department_id.required' => 'Please select a department.',
      'name.required' => 'Workflow name is required.',
      'approval_levels.required' => 'At least one approval level is required.',
      'approval_levels.*.level.required' => 'Level is required for each approval level.',
      'approval_levels.*.level.in' => 'Invalid level specified.',
      'approval_levels.*.order.required' => 'Order is required for each approval level.',
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    $this->merge([
      'is_active' => $this->is_active ?? true,
      'is_default' => $this->is_default ?? false,
      'require_all_approvals' => $this->require_all_approvals ?? true,
      'allow_delegation' => $this->allow_delegation ?? false,
      'required_approvals' => $this->required_approvals ?? 1,
      'sla_hours' => $this->sla_hours ?? 48,
      'reminder_hours' => $this->reminder_hours ?? 24,
      'escalation_hours' => $this->escalation_hours ?? 72,
      'max_revisions' => $this->max_revisions ?? 3,
    ]);
  }
}
