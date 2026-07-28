<?php
// app/Http/Resources/Requisition/RequisitionItemCollection.php

declare(strict_types=1);

namespace App\Http\Resources\Requisition;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class RequisitionItemCollection extends ResourceCollection
{
  public function toArray(Request $request): array
  {
    return [
      'data' => RequisitionItemResource::collection($this->collection),
      'meta' => [
        'total' => $this->total(),
        'per_page' => $this->perPage(),
        'current_page' => $this->currentPage(),
        'last_page' => $this->lastPage(),
      ],
    ];
  }
}
