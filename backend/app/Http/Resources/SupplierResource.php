<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'user_id' => $this->user_id,
      'company_name' => $this->company_name,
      'company_email' => $this->company_email,
      'company_phone' => $this->company_phone,
      'company_registration' => $this->company_registration,
      'company_address' => $this->company_address,
      'company_website' => $this->company_website,
      'tax_id' => $this->tax_id,
      'category' => $this->category,
      'status' => $this->status,
      'blacklist_reason' => $this->blacklist_reason,
      'blacklisted_at' => $this->blacklisted_at,
      'user' => $this->whenLoaded('user', function () {
        return [
          'id' => $this->user->id,
          'name' => $this->user->full_name,
          'email' => $this->user->email,
          'phone' => $this->user->phone,
        ];
      }),
      'created_by' => $this->whenLoaded('creator', function () {
        return [
          'id' => $this->creator->id,
          'name' => $this->creator->full_name,
        ];
      }),
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,
    ];
  }
}
