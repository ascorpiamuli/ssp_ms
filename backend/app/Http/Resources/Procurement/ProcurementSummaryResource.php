<?php
// app/Http/Resources/Procurement/ProcurementSummaryResource.php

declare(strict_types=1);

namespace App\Http\Resources\Procurement;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcurementSummaryResource extends JsonResource
{
  public function toArray(Request $request): array
  {
    return [
      'requisition' => [
        'id' => $this['requisition']['id'] ?? null,
        'reference_number' => $this['requisition']['reference_number'] ?? null,
        'title' => $this['requisition']['title'] ?? null,
        'total_amount' => $this['requisition']['total_amount'] ?? 0,
        'status' => $this['requisition']['status'] ?? null,
      ],
      'procurement' => [
        'status' => $this['procurement']['current_status'] ?? 'not_started',
        'is_completed' => $this['procurement']['current_status'] === 'completed',
        'is_active' => $this['procurement']['is_procurement_created'] ?? false,
        'started_at' => $this['procurement']['procurement_created_at'] ?? null,
        'steps' => $this['procurement']['steps'] ?? [],
      ],
      'timeline' => $this['timeline'] ?? [],
      'metrics' => $this['metrics'] ?? [
        'time_to_start' => null,
        'time_to_complete' => null,
        'total_approvals' => 0,
        'total_quotes' => 0,
        'total_amount_saved' => 0,
        'completion_rate' => 0,
      ],
    ];
  }
}
