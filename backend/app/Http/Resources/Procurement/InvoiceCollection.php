<?php
// app/Http/Resources/Procurement/InvoiceCollection.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class InvoiceCollection extends ResourceCollection
{
  public $collects = InvoiceResource::class;

  public function toArray(Request $request): array
  {
    return [
      'data' => $this->collection,
      'meta' => [
        'total' => $this->total(),
        'count' => $this->count(),
        'per_page' => $this->perPage(),
        'current_page' => $this->currentPage(),
        'total_pages' => $this->lastPage(),
      ],
    ];
  }
}
