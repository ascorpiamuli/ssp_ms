<?php
// app/Http/Resources/Requisition/RequisitionNotificationResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionNotificationResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'user_id' => $this->user_id,
      'sent_by' => $this->sent_by,

      // Notification Details
      'type' => $this->type,
      'type_label' => $this->type_label,
      'type_color' => $this->type_color,
      'channel' => $this->channel,
      'subject' => $this->subject,
      'message' => $this->message,
      'data' => $this->data,

      // Status Flags
      'is_read' => $this->is_read,
      'is_sent' => $this->is_sent,
      'status_label' => $this->status_label,
      'status_color' => $this->status_color,

      // Dates
      'sent_at' => $this->sent_at?->format('Y-m-d H:i:s'),
      'read_at' => $this->read_at?->format('Y-m-d H:i:s'),
      'delivered_at' => $this->delivered_at?->format('Y-m-d H:i:s'),
      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

      // Relationships
      'user' => $this->whenLoaded('user', function () {
        return [
          'id' => $this->user->id,
          'full_name' => $this->user->full_name,
          'email' => $this->user->email,
        ];
      }),

      'sent_by_user' => $this->whenLoaded('sentBy', function () {
        return [
          'id' => $this->sentBy->id,
          'full_name' => $this->sentBy->full_name,
          'email' => $this->sentBy->email,
        ];
      }),

      'requisition' => $this->whenLoaded('requisition', function () {
        return [
          'id' => $this->requisition->id,
          'reference_number' => $this->requisition->reference_number,
          'title' => $this->requisition->title,
          'status' => $this->requisition->status,
          'status_label' => $this->requisition->status_label,
          'total_amount' => $this->requisition->total_amount,
        ];
      }),

      // Readable format
      'is_read_label' => $this->is_read ? 'Read' : 'Unread',
      'is_sent_label' => $this->is_sent ? 'Sent' : 'Pending',
      'formatted_created_at' => $this->formatted_created_at,
      'user_name' => $this->user_name,
    ];
  }
}
