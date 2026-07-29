<?php
// app/Services/Procurement/Utilities/ReferenceNumberGenerator.php

declare(strict_types=1);

namespace App\Services\Procurement\Utilities;

use App\Models\QuotationRequest;
use App\Models\SupplierQuotation;
use App\Models\PurchaseOrder;
use App\Models\GoodsReceivedNote;
use App\Models\ServiceAcknowledgmentNote;
use App\Models\Invoice;
use App\Models\PaymentVoucher;
use App\Models\Cheque;
use App\Models\Contract;
use App\Models\Tender;
use App\Models\ProcurementSetting;
use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use Illuminate\Support\Facades\Cache;

class ReferenceNumberGenerator implements ReferenceNumberGeneratorInterface
{
  protected array $formats = [];
  protected int $cacheTtl = 3600; // 1 hour

  public function __construct()
  {
    $this->loadFormats();
  }

  public function generateQtnNumber(): string
  {
    return $this->generateNumber('QTN', QuotationRequest::class);
  }

  public function generateSupplierQuotationNumber(): string
  {
    return $this->generateNumber('SQ', SupplierQuotation::class);
  }

  public function generatePoNumber(string $type): string
  {
    $prefix = strtoupper($type);
    return $this->generateNumber($prefix, PurchaseOrder::class, ['type' => $type]);
  }

  public function generateGrnNumber(): string
  {
    return $this->generateNumber('GRN', GoodsReceivedNote::class);
  }

  public function generateSanNumber(): string
  {
    return $this->generateNumber('SAN', ServiceAcknowledgmentNote::class);
  }

  public function generateInvoiceNumber(): string
  {
    return $this->generateNumber('INV', Invoice::class);
  }

  public function generateVoucherNumber(): string
  {
    return $this->generateNumber('PV', PaymentVoucher::class);
  }

  public function generateChequeNumber(): string
  {
    return $this->generateNumber('CHQ', Cheque::class);
  }

  public function generateContractNumber(): string
  {
    return $this->generateNumber('CTR', Contract::class);
  }

  public function generateTenderNumber(): string
  {
    return $this->generateNumber('TND', Tender::class);
  }

  public function generateNumber(string $prefix, string $modelClass, array $filters = []): string
  {
    $format = $this->getFormat($prefix);
    $year = date($format['year_format'] ?? 'Y');

    // Get the sequence number
    $sequence = $this->getNextSequence($modelClass, $filters);

    // Build the reference number parts
    $parts = [];

    if ($format['prefix'] ?? true) {
      $parts[] = $prefix;
    }

    if ($format['include_year'] ?? true) {
      $parts[] = $year;
    }

    if ($format['include_department_code'] ?? false) {
      $parts[] = $this->getDepartmentCode();
    }

    $parts[] = str_pad((string) $sequence, $format['sequence_length'] ?? 5, '0', STR_PAD_LEFT);

    return implode($format['separator'] ?? '-', $parts);
  }

  public function setFormat(string $type, array $format): void
  {
    $this->formats[$type] = $format;

    // Save to database
    ProcurementSetting::updateOrCreate(
      ['setting_key' => 'ref_format_' . strtolower($type)],
      [
        'setting_value' => json_encode($format),
        'data_type' => 'json',
        'setting_group' => 'reference_formats',
        'description' => "Reference number format for {$type}",
        'updated_by' => auth()->id(),
      ]
    );

    // Clear cache
    Cache::forget('procurement_ref_formats');
  }

  public function getFormat(string $type): array
  {
    $default = [
      'prefix' => true,
      'include_year' => true,
      'year_format' => 'Y',
      'sequence_length' => 5,
      'separator' => '-',
      'include_department_code' => false,
    ];

    // Check if format is loaded from database
    if (isset($this->formats[$type]) && is_array($this->formats[$type])) {
      return array_merge($default, $this->formats[$type]);
    }

    return $default;
  }

  public function getNextSequence(string $modelClass, array $filters = []): int
  {
    $cacheKey = 'ref_seq_' . md5($modelClass . serialize($filters));

    return Cache::remember($cacheKey, $this->cacheTtl, function () use ($modelClass, $filters) {
      $query = $modelClass::whereYear('created_at', date('Y'));

      foreach ($filters as $key => $value) {
        $query->where($key, $value);
      }

      return $query->count() + 1;
    });
  }

  public function resetSequence(string $modelClass, int $start = 1): void
  {
    // This is an admin function - should have proper authorization
    $cacheKey = 'ref_seq_' . md5($modelClass . '[]');
    Cache::forget($cacheKey);

    // Log the reset
    \Log::info('Reference sequence reset', [
      'model' => $modelClass,
      'start' => $start,
      'user_id' => auth()->id(),
    ]);
  }

  protected function loadFormats(): void
  {
    // Load from cache or database
    $formats = Cache::remember('procurement_ref_formats', $this->cacheTtl, function () {
      return ProcurementSetting::where('setting_group', 'reference_formats')
        ->where('is_active', true)
        ->get()
        ->mapWithKeys(function ($setting) {
          $key = str_replace('ref_format_', '', $setting->setting_key);
          $value = $setting->getTypedValue();
          return [$key => is_array($value) ? $value : []];
        })
        ->toArray();
    });

    $this->formats = $formats;
  }

  protected function getDepartmentCode(): string
  {
    // Get department code from the current context
    // This could be from the requisition, user, or session
    $departmentCode = session('procurement_department_code');

    if (!$departmentCode && auth()->user()) {
      $user = auth()->user();
      if ($user->department) {
        $departmentCode = $user->department->code ?? 'DEF';
      }
    }

    return $departmentCode ?? 'DEF';
  }
}
