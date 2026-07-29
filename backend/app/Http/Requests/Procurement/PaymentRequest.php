<?php
// app/Http/Requests/Procurement/PaymentRequest.php

declare(strict_types=1);

namespace App\Http\Requests\Procurement;

use Illuminate\Foundation\Http\FormRequest;

class PaymentRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'invoice_id' => 'required|exists:invoices,id',
      'payee_name' => 'required|string|max:200',
      'payee_address' => 'nullable|string|max:255',
      'payee_phone' => 'nullable|string|max:50',
      'payee_email' => 'nullable|email|max:100',
      'amount_words' => 'nullable|string|max:255',
      'bank_name' => 'nullable|string|max:100',
      'account_number' => 'nullable|string|max:50',
      'bank_branch' => 'nullable|string|max:100',
      'payment_method' => 'required|in:cheque,bank_transfer,cash,mobile_money',
      'payment_description' => 'nullable|string',
      'notes' => 'nullable|string',
      'metadata' => 'nullable|array',
      // For Cheque
      'cheque_number' => 'nullable|string|max:50',
      'issued_date' => 'nullable|date',
      'payee_address_cheque' => 'nullable|string',
      'bank_sort_code' => 'nullable|string|max:20',
    ];
  }

  public function messages(): array
  {
    return [
      'invoice_id.required' => 'Invoice ID is required.',
      'invoice_id.exists' => 'Invoice does not exist.',
      'payee_name.required' => 'Payee name is required.',
      'payment_method.required' => 'Payment method is required.',
      'payment_method.in' => 'Invalid payment method.',
    ];
  }
}
