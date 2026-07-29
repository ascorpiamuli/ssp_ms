<?php
// app/Services/Procurement/DTOs/BaseDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

abstract class BaseDTO
{
  abstract public function toArray(): array;

  protected function parseDate($value): ?Carbon
  {
    if ($value === null) {
      return null;
    }
    if ($value instanceof Carbon) {
      return $value;
    }
    return Carbon::parse($value);
  }

  protected function formatDate(?Carbon $date): ?string
  {
    return $date?->toDateString();
  }

  protected function formatDateTime(?Carbon $date): ?string
  {
    return $date?->toDateTimeString();
  }
}
