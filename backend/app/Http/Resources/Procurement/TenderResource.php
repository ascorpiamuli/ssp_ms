<?php
// app/Http/Resources/Procurement/TenderResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenderResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'tender_number' => $this->tender_number,
      'title' => $this->title,
      'description' => $this->description,
      'issue_date' => $this->issue_date?->toDateString(),
      'closing_date' => $this->closing_date?->toDateString(),
      'closing_time' => $this->closing_time,
      'tender_document_path' => $this->tender_document_path,
      'evaluation_criteria' => $this->evaluation_criteria,
      'estimated_value' => $this->estimated_value,
      'formatted_estimated_value' => $this->formatted_estimated_value,
      'status' => $this->status,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,
      'is_open' => $this->is_open,
      'is_closed' => $this->is_closed,
      'is_awarded' => $this->is_awarded,
      'is_cancelled' => $this->is_cancelled,
      'days_until_closing' => $this->days_until_closing,
      'bidder_count' => $this->bidder_count,
      'bidders' => $this->bidders,
      'awarded_to' => $this->awarded_to,
      'awarded_at' => $this->awarded_at?->toDateTimeString(),
      'awarded_amount' => $this->awarded_amount,
      'formatted_awarded_amount' => $this->formatted_awarded_amount,
      'award_notes' => $this->award_notes,
      'requisition' => [
        'id' => $this->requisition?->id,
        'reference_number' => $this->requisition?->reference_number,
        'title' => $this->requisition?->title,
      ],
      'published_by' => $this->publishedBy?->full_name,
      'published_at' => $this->published_at?->toDateTimeString(),
      'created_at' => $this->created_at?->toDateTimeString(),
      'updated_at' => $this->updated_at?->toDateTimeString(),
    ];
  }
}
