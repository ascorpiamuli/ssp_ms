<?php
// app/Http/Resources/Requisition/RequisitionAttachmentResource.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequisitionAttachmentResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'requisition_id' => $this->requisition_id,
      'file_name' => $this->file_name,
      'file_path' => $this->file_path,
      'file_type' => $this->file_type,
      'file_size' => $this->file_size,
      'formatted_file_size' => $this->formatted_file_size,
      'mime_type' => $this->mime_type,
      'file_extension' => $this->file_extension,
      'is_image' => $this->is_image,
      'url' => $this->getUrl(),

      'category' => $this->category,
      'category_label' => $this->category_label,
      'description' => $this->description,
      'is_required' => $this->is_required,
      'is_verified' => $this->is_verified,

      'version' => $this->version,
      'uploaded_at' => $this->uploaded_at?->format('Y-m-d H:i:s'),

      'uploaded_by' => $this->whenLoaded('uploadedBy', function () {
        return [
          'id' => $this->uploadedBy->id,
          'full_name' => $this->uploadedBy->full_name,
        ];
      }),

      'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
      'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
    ];
  }
}
