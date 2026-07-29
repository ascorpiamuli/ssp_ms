<?php
// app/Http/Requests/Procurement/ApprovalRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class ApprovalRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    $rules = [
      'entity_id' => 'required|integer',
      'entity_type' => 'required|string|in:quotation_request,supplier_quotation,purchase_order,goods_received_note,service_acknowledgment_note,invoice,payment_voucher,contract,tender',
      'level' => 'required|in:hod,accountant,principal,final,diocesan_accountant,procurement',
      'approver_id' => 'required|exists:users,id',
      'comment' => 'nullable|string',
      'deadline' => 'nullable|date|after:today',
      'metadata' => 'nullable|array',
    ];

    // For update operations (approve/decline/return)
    if ($this->isMethod('put') || $this->isMethod('patch')) {
      $rules = [
        'comment' => 'nullable|string',
        'reason' => 'required_if:action,decline,return|string',
        'action' => 'required|in:approve,decline,return',
      ];
    }

    return $rules;
  }

  public function messages(): array
  {
    return [
      'entity_id.required' => 'Entity ID is required.',
      'entity_type.required' => 'Entity type is required.',
      'entity_type.in' => 'Invalid entity type.',
      'level.required' => 'Approval level is required.',
      'level.in' => 'Invalid approval level.',
      'approver_id.required' => 'Approver ID is required.',
      'approver_id.exists' => 'Approver does not exist.',
      'action.required' => 'Action is required.',
      'action.in' => 'Invalid action.',
      'reason.required_if' => 'Reason is required for this action.',
      'deadline.after' => 'Deadline must be in the future.',
    ];
  }
}
