<?php
// app/Http/Resources/Procurement/PaymentVoucherResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentVoucherResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'invoice_id' => $this->invoice_id,
      'purchase_order_id' => $this->purchase_order_id,
      'supplier_id' => $this->supplier_id,
      'voucher_number' => $this->voucher_number,
      'payee_name' => $this->payee_name,
      'payee_address' => $this->payee_address,
      'payee_phone' => $this->payee_phone,
      'payee_email' => $this->payee_email,
      'amount' => $this->amount,
      'formatted_amount' => $this->formatted_amount,
      'amount_words' => $this->amount_words,
      'bank_name' => $this->bank_name,
      'account_number' => $this->account_number,
      'bank_branch' => $this->bank_branch,
      'cheque_number' => $this->cheque_number,
      'payment_date' => $this->payment_date?->toDateString(),
      'payment_description' => $this->payment_description,
      'payment_method' => $this->payment_method,
      'payment_method_label' => $this->payment_method_label,
      'transaction_reference' => $this->transaction_reference,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_endorsed' => $this->is_endorsed,
      'is_approved' => $this->is_approved,
      'is_paid' => $this->is_paid,
      'notes' => $this->notes,
      'supplier' => [
        'id' => $this->supplier?->id,
        'name' => $this->supplier_name,
        'email' => $this->supplier?->email,
      ],
      'invoice' => [
        'id' => $this->invoice?->id,
        'invoice_number' => $this->invoice?->invoice_number,
        'total_amount' => $this->invoice?->total_amount,
      ],
      'cheque' => $this->whenLoaded('cheque', function () {
        return [
          'id' => $this->cheque->id,
          'cheque_number' => $this->cheque->cheque_number,
          'status' => $this->cheque->status,
          'status_label' => $this->cheque->status_label,
          'issued_date' => $this->cheque->issued_date?->toDateString(),
          'cashed_at' => $this->cheque->cashed_at?->toDateTimeString(),
        ];
      }),
      'approvals' => [
        'prepared_by' => $this->preparedBy?->full_name,
        'prepared_at' => $this->created_at?->toDateTimeString(),
        'endorsed_by' => $this->endorsedBy?->full_name,
        'endorsed_at' => $this->endorsed_at?->toDateTimeString(),
        'approved_by' => $this->approvedBy?->full_name,
        'approved_at' => $this->approved_at?->toDateTimeString(),
        'paid_at' => $this->paid_at?->toDateTimeString(),
      ],
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
