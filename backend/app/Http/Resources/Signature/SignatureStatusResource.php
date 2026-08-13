<?php
// app/Http/Resources/Signature/SignatureStatusResource.php

namespace App\Http\Resources\Signature;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SignatureStatusResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'status' => $this->status,
      'label' => $this->label,
      'color' => $this->color,
      'message' => $this->message,
      'specimen' => $this->specimen ? new SignatureResource($this->specimen) : null,
    ];
  }
}
