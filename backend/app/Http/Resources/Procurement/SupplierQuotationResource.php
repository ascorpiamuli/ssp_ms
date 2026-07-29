<?php
// app/Http/Resources/Procurement/SupplierQuotationResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierQuotationResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'quotation_request_id' => $this->quotation_request_id,
      'supplier_id' => $this->supplier_id,
      'quotation_number' => $this->quotation_number,
      'supplier_reference_no' => $this->supplier_reference_no,
      'submission_date' => $this->submission_date?->toDateString(),
      'validity_date' => $this->validity_date?->toDateString(),
      'delivery_time' => $this->delivery_time,
      'payment_terms' => $this->payment_terms,
      'delivery_terms' => $this->delivery_terms,
      'warranty_terms' => $this->warranty_terms,
      'total_amount' => $this->total_amount,
      'formatted_total_amount' => $this->formatted_total_amount,
      'tax_amount' => $this->tax_amount,
      'discount_amount' => $this->discount_amount,
      'net_amount' => $this->net_amount,
      'formatted_net_amount' => $this->formatted_net_amount,
      'currency' => $this->currency,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_lowest' => $this->is_lowest,
      'is_valid' => $this->is_valid,
      'submission_method' => $this->submission_method,
      'submission_method_label' => $this->submission_method_label,
      'verification_status' => $this->verification_status,
      'verification_status_label' => $this->verification_status_label,
      'notes' => $this->notes,
      'supplier' => [
        'id' => $this->supplier?->id,
        'name' => $this->supplier?->full_name,
        'email' => $this->supplier?->email,
        'phone' => $this->supplier?->phone,
      ],
      'items' => $this->whenLoaded('items', function () {
        return $this->items->map(function ($item) {
          return [
            'id' => $item->id,
            'item_name' => $item->item_name,
            'description' => $item->description,
            'unit_of_measure' => $item->unit_of_measure,
            'quantity' => $item->quantity,
            'formatted_quantity' => $item->formatted_quantity,
            'unit_price' => $item->unit_price,
            'formatted_unit_price' => $item->formatted_unit_price,
            'total_price' => $item->total_price,
            'formatted_total_price' => $item->formatted_total_price,
            'tax_rate' => $item->tax_rate,
            'tax_amount' => $item->tax_amount,
            'discount_rate' => $item->discount_rate,
            'discount_amount' => $item->discount_amount,
            'net_price' => $item->net_price,
            'formatted_net_price' => $item->formatted_net_price,
            'delivery_days' => $item->delivery_days,
            'warranty_months' => $item->warranty_months,
            'brand' => $item->brand,
            'model' => $item->model,
            'is_alternative' => $item->is_alternative,
            'specifications' => $item->specifications,
          ];
        });
      }),
      'evaluation' => [
        'score' => $this->evaluation_score,
        'notes' => $this->evaluation_notes,
        'evaluated_at' => $this->evaluated_at?->toDateTimeString(),
        'evaluated_by' => $this->evaluatedBy?->full_name,
      ],
      'created_at' => $this->created_at?->toDateTimeString(),
    ];
  }
}
