<?php
// app/Http/Resources/Approval/ApprovalCollection.php

declare(strict_types=1);

namespace App\Http\Resources\Approval;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ApprovalCollection extends ResourceCollection
{
  public function toArray(Request $request): array
  {
    return [
      'data' => ApprovalResource::collection($this->collection),
      'meta' => [
        'total' => $this->total(),
        'per_page' => $this->perPage(),
        'current_page' => $this->currentPage(),
        'last_page' => $this->lastPage(),
      ],
    ];
  }
}
