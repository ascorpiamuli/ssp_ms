<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UploadResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'file_name' => $this->file_name,
      'original_name' => $this->original_name,
      'file_path' => $this->file_path,
      'file_url' => $this->url,
      'file_type' => $this->file_type,
      'mime_type' => $this->mime_type,
      'extension' => $this->extension,
      'file_size' => $this->file_size,
      'formatted_size' => $this->formatted_size,
      'width' => $this->width,
      'height' => $this->height,
      'image_orientation' => $this->image_orientation,
      'is_image' => $this->is_image,
      'collection' => $this->collection,
      'title' => $this->title,
      'description' => $this->description,
      'meta_data' => $this->meta_data,
      'status' => $this->status,
      'uploaded_by' => $this->whenLoaded('uploadedBy', function () {
        return [
          'id' => $this->uploadedBy->id,
          'name' => $this->uploadedBy->first_name . ' ' . $this->uploadedBy->last_name,
          'email' => $this->uploadedBy->email,
        ];
      }),
      'uploaded_at' => $this->uploaded_at?->toISOString(),
      'created_at' => $this->created_at?->toISOString(),
      'updated_at' => $this->updated_at?->toISOString(),
    ];
  }
}
