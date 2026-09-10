<?php
// app/services/analytics/repositories/FinancialAnalyticsRepository.php

declare(strict_types=1);

namespace App\Services\Analytics\Repositories;

use App\Models\Invoice;
use App\Models\PaymentVoucher;
use App\Models\Cheque;
use App\Models\Requisition;
use App\Models\Contract;
use App\Services\Analytics\Contracts\Repositories\FinancialAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FinancialAnalyticsRepository extends BaseAnalyticsRepository implements FinancialAnalyticsRepositoryInterface
{
  public function getDashboardSummary(array $filters = []): array
  {
    $invoiceQuery = Invoice::query();
    $this->applyFilters($invoiceQuery, $filters);

    $paymentQuery = PaymentVoucher::query();
    $this->applyFilters($paymentQuery, $filters);

    return [
      'total_invoices' => $invoiceQuery->clone()->count(),
      'total_invoice_value' => $invoiceQuery->clone()->sum('total_amount') ?? 0,
      'pending_invoices' => $invoiceQuery->clone()->where('status', 'pending')->count(),
      'overdue_invoices' => $invoiceQuery->clone()->whereDate('due_date', '<', now())
        ->whereNotIn('status', ['paid', 'cancelled'])->count(),
      'total_payments' => $paymentQuery->clone()->where('status', 'paid')->count(),
      'total_payment_value' => $paymentQuery->clone()->where('status', 'paid')->sum('amount') ?? 0,
      'budget_utilization' => $this->getBudgetUtilization($filters),
    ];
  }

  public function getTrends(string $metric, string $interval = 'day', array $filters = []): Collection
  {
    $model = $this->getModelForMetric($metric);
    $query = $model::query();
    $this->applyFilters($query, $filters);
    $this->groupByInterval($query, 'created_at', $interval);

    switch ($metric) {
      case 'spending':
      case 'invoice_value':
        $query->selectRaw('SUM(total_amount) as value');
        break;
      case 'invoice_count':
        $query->selectRaw('COUNT(*) as value');
        break;
      case 'payment_value':
        $query->selectRaw('SUM(amount) as value');
        break;
      case 'budget_utilization':
        $query->selectRaw('AVG(department_utilization_percentage) as value');
        break;
      default:
        $query->selectRaw('COUNT(*) as value');
    }

    $query->orderBy('period', 'asc');

    return $query->get()->map(function ($row) {
      return [
        'period' => $row->period,
        'value' => (float) $row->value,
      ];
    });
  }

  protected function getModelForMetric(string $metric): string
  {
    return match ($metric) {
      'invoice_value', 'invoice_count' => Invoice::class,
      'payment_value' => PaymentVoucher::class,
      'spending' => Requisition::class,
      'budget_utilization' => Requisition::class,
      default => Invoice::class,
    };
  }

  public function getVolumeStats(array $filters = []): array
  {
    $invoiceQuery = Invoice::query();
    $this->applyFilters($invoiceQuery, $filters);

    $paymentQuery = PaymentVoucher::query();
    $this->applyFilters($paymentQuery, $filters);

    return [
      'invoices' => [
        'total' => $invoiceQuery->clone()->count(),
        'total_value' => $invoiceQuery->clone()->sum('total_amount') ?? 0,
        'pending' => $invoiceQuery->clone()->where('status', 'pending')->count(),
        'paid' => $invoiceQuery->clone()->where('status', 'paid')->count(),
      ],
      'payments' => [
        'total' => $paymentQuery->clone()->count(),
        'total_value' => $paymentQuery->clone()->sum('amount') ?? 0,
        'pending' => $paymentQuery->clone()->whereIn('status', ['draft', 'endorsed', 'approved'])->count(),
        'completed' => $paymentQuery->clone()->where('status', 'paid')->count(),
      ],
    ];
  }

  public function getBudgetUtilization(array $filters = []): Collection
  {
    return Requisition::query()
      ->with('department')
      ->when(isset($filters['department_id']), function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'department_id',
        DB::raw('SUM(budget_allocated) as total_budget'),
        DB::raw('SUM(total_amount) as total_spent'),
        DB::raw('SUM(budget_allocated) - SUM(total_amount) as budget_balance'),
        DB::raw('CASE
                    WHEN SUM(budget_allocated) > 0
                    THEN (SUM(total_amount) / SUM(budget_allocated)) * 100
                    ELSE 0
                END as utilization_rate')
      )
      ->groupBy('department_id')
      ->having('total_budget', '>', 0)
      ->get()
      ->map(function ($item) {
        return [
          'department_id' => $item->department_id,
          'department_name' => $item->department?->name ?? 'Unknown',
          'total_budget' => (float) $item->total_budget,
          'total_spent' => (float) $item->total_spent,
          'budget_balance' => (float) $item->budget_balance,
          'utilization_rate' => (float) $item->utilization_rate,
        ];
      });
  }

  public function getDepartmentBudgetPerformance(array $filters = []): Collection
  {
    return $this->getBudgetUtilization($filters);
  }

  public function getSpendingByCategory(array $filters = []): Collection
  {
    return Requisition::query()
      ->when(isset($filters['department_id']), function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'goods_category',
        DB::raw('COUNT(*) as count'),
        DB::raw('SUM(total_amount) as total_spent')
      )
      ->groupBy('goods_category')
      ->get()
      ->map(function ($item) {
        return [
          'category' => $item->goods_category ?? 'Uncategorized',
          'count' => (int) $item->count,
          'total_spent' => (float) $item->total_spent,
        ];
      });
  }

  public function getSpendingByDepartment(array $filters = []): Collection
  {
    return $this->getBudgetUtilization($filters);
  }

  public function getSpendingTrend(string $interval = 'day', array $filters = []): Collection
  {
    return $this->getTrends('spending', $interval, $filters);
  }

  public function getInvoiceVolumeStats(array $filters = []): array
  {
    $query = Invoice::query();
    $this->applyFilters($query, $filters);

    return [
      'total' => $query->clone()->count(),
      'total_value' => $query->clone()->sum('total_amount') ?? 0,
      'pending' => $query->clone()->where('status', 'pending')->count(),
      'verified' => $query->clone()->where('status', 'verified')->count(),
      'approved' => $query->clone()->where('status', 'approved')->count(),
      'paid' => $query->clone()->where('status', 'paid')->count(),
      'disputed' => $query->clone()->where('status', 'disputed')->count(),
    ];
  }

  public function getInvoiceStatusDistribution(array $filters = []): Collection
  {
    return Invoice::query()
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(total_amount) as value'))
      ->groupBy('status')
      ->get()
      ->map(function ($item) {
        return [
          'status' => $item->status,
          'label' => $item->status_label,
          'color' => $item->status_color,
          'count' => (int) $item->count,
          'value' => (float) $item->value,
        ];
      });
  }

  public function getInvoiceMatchingStats(array $filters = []): array
  {
    $query = Invoice::query();
    $this->applyFilters($query, $filters);

    $total = $query->clone()->count();
    $matched = $query->clone()->where('matching_status', 'matched')->count();
    $partial = $query->clone()->where('matching_status', 'partial')->count();
    $mismatch = $query->clone()->where('matching_status', 'mismatch')->count();
    $pending = $query->clone()->where('matching_status', 'pending')->count();

    return [
      'total' => $total,
      'matched' => $matched,
      'partial' => $partial,
      'mismatch' => $mismatch,
      'pending' => $pending,
      'match_rate' => $this->calculatePercentage($matched, $total),
      'by_status' => [
        'matched' => $matched,
        'partial' => $partial,
        'mismatch' => $mismatch,
        'pending' => $pending,
      ],
    ];
  }

  public function getOverdueInvoiceAnalysis(array $filters = []): Collection
  {
    return Invoice::query()
      ->with('supplier')
      ->whereDate('due_date', '<', now())
      ->whereNotIn('status', ['paid', 'cancelled'])
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->select(
        'id',
        'invoice_number',
        'supplier_id',
        'total_amount',
        'due_date',
        DB::raw('DATEDIFF(NOW(), due_date) as days_overdue')
      )
      ->orderBy('days_overdue', 'desc')
      ->get()
      ->map(function ($item) {
        return [
          'invoice_id' => $item->id,
          'invoice_number' => $item->invoice_number,
          'supplier_name' => $item->supplier?->full_name ?? 'Unknown',
          'total_amount' => (float) $item->total_amount,
          'due_date' => $item->due_date->format('Y-m-d'),
          'days_overdue' => (int) $item->days_overdue,
          'status' => $item->status,
        ];
      });
  }

  public function getPaymentCycleTime(array $filters = []): array
  {
    $query = PaymentVoucher::whereNotNull('paid_at')
      ->whereNotNull('approved_at');

    $this->applyFilters($query, $filters);

    $data = $query->select(
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, endorsed_at)) as preparation_time'),
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, endorsed_at, approved_at)) as endorsement_time'),
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, approved_at, paid_at)) as approval_to_payment_time'),
      DB::raw('AVG(TIMESTAMPDIFF(HOUR, created_at, paid_at)) as total_time')
    )->first();

    return [
      'preparation_to_endorsement' => $this->safeAverage($data->preparation_time ?? 0),
      'endorsement_to_approval' => $this->safeAverage($data->endorsement_time ?? 0),
      'approval_to_payment' => $this->safeAverage($data->approval_to_payment_time ?? 0),
      'total_cycle' => $this->safeAverage($data->total_time ?? 0),
    ];
  }

  public function getPaymentMethodDistribution(array $filters = []): Collection
  {
    return PaymentVoucher::query()
      ->where('status', 'paid')
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select('payment_method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total_value'))
      ->groupBy('payment_method')
      ->get()
      ->map(function ($item) {
        return [
          'method' => $item->payment_method,
          'label' => $item->payment_method_label,
          'count' => (int) $item->count,
          'total_value' => (float) $item->total_value,
        ];
      });
  }

  public function getChequeStatusDistribution(array $filters = []): Collection
  {
    return Cheque::query()
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select('status', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total_value'))
      ->groupBy('status')
      ->get()
      ->map(function ($item) {
        return [
          'status' => $item->status,
          'label' => $item->status_label,
          'color' => $item->status_color,
          'count' => (int) $item->count,
          'total_value' => (float) $item->total_value,
        ];
      });
  }

  public function getCostSavings(array $filters = []): array
  {
    // Compare estimated vs actual costs
    $query = Requisition::query()
      ->whereNotNull('total_amount')
      ->whereNotNull('budget_allocated');

    $this->applyFilters($query, $filters);

    $data = $query->select(
      DB::raw('SUM(budget_allocated) as total_budget'),
      DB::raw('SUM(total_amount) as total_actual'),
      DB::raw('SUM(budget_allocated) - SUM(total_amount) as total_savings')
    )->first();

    $totalBudget = (float) ($data->total_budget ?? 0);
    $totalActual = (float) ($data->total_actual ?? 0);
    $savings = (float) ($data->total_savings ?? 0);

    return [
      'total_budget' => $totalBudget,
      'total_actual' => $totalActual,
      'total_savings' => $savings,
      'savings_rate' => $totalBudget > 0 ? $this->calculatePercentage($savings, $totalBudget) : 0,
      'by_department' => $this->getBudgetUtilization($filters),
    ];
  }

  public function getContractValueAnalysis(array $filters = []): Collection
  {
    return Contract::query()
      ->with('supplier')
      ->whereNotNull('contract_value')
      ->when(isset($filters['supplier_id']), function ($q) use ($filters) {
        $q->where('supplier_id', $filters['supplier_id']);
      })
      ->when(isset($filters['status']), function ($q) use ($filters) {
        $q->where('status', $filters['status']);
      })
      ->select(
        'supplier_id',
        DB::raw('COUNT(*) as contract_count'),
        DB::raw('SUM(contract_value) as total_value'),
        DB::raw('AVG(contract_value) as avg_value')
      )
      ->groupBy('supplier_id')
      ->get()
      ->map(function ($item) {
        return [
          'supplier_id' => $item->supplier_id,
          'supplier_name' => $item->supplier?->full_name ?? 'Unknown',
          'contract_count' => (int) $item->contract_count,
          'total_value' => (float) $item->total_value,
          'avg_value' => (float) $item->avg_value,
        ];
      });
  }

  public function getFinancialKpis(array $filters = []): array
  {
    $invoiceQuery = Invoice::query();
    $this->applyFilters($invoiceQuery, $filters);

    $paymentQuery = PaymentVoucher::query();
    $this->applyFilters($paymentQuery, $filters);

    $requisitionQuery = Requisition::query();
    $this->applyFilters($requisitionQuery, $filters);

    $totalBudget = $requisitionQuery->clone()->sum('budget_allocated') ?? 0;
    $totalSpent = $requisitionQuery->clone()->sum('total_amount') ?? 0;

    return [
      'budget' => [
        'total_allocated' => $totalBudget,
        'total_spent' => $totalSpent,
        'utilization_rate' => $totalBudget > 0 ? $this->calculatePercentage($totalSpent, $totalBudget) : 0,
        'remaining' => $totalBudget - $totalSpent,
      ],
      'invoices' => [
        'total' => $invoiceQuery->clone()->count(),
        'total_value' => $invoiceQuery->clone()->sum('total_amount') ?? 0,
        'paid_value' => $invoiceQuery->clone()->where('status', 'paid')->sum('total_amount') ?? 0,
        'payment_rate' => $invoiceQuery->clone()->sum('total_amount') > 0
          ? $this->calculatePercentage(
            $invoiceQuery->clone()->where('status', 'paid')->sum('total_amount') ?? 0,
            $invoiceQuery->clone()->sum('total_amount') ?? 0
          )
          : 0,
      ],
      'payments' => [
        'total' => $paymentQuery->clone()->where('status', 'paid')->count(),
        'total_value' => $paymentQuery->clone()->where('status', 'paid')->sum('amount') ?? 0,
        'avg_payment' => $this->safeAverage($paymentQuery->clone()->where('status', 'paid')->avg('amount')),
      ],
    ];
  }

  public function getBudgetVariance(array $filters = []): Collection
  {
    return Requisition::query()
      ->with('department')
      ->when(isset($filters['department_id']), function ($q) use ($filters) {
        $q->where('department_id', $filters['department_id']);
      })
      ->when(isset($filters['start_date']), function ($q) use ($filters) {
        $q->whereBetween('created_at', [
          Carbon::parse($filters['start_date'])->startOfDay(),
          Carbon::parse($filters['end_date'])->endOfDay()
        ]);
      })
      ->select(
        'department_id',
        DB::raw('SUM(budget_allocated) as budget'),
        DB::raw('SUM(total_amount) as actual'),
        DB::raw('SUM(budget_allocated) - SUM(total_amount) as variance'),
        DB::raw('CASE
                    WHEN SUM(budget_allocated) > 0
                    THEN (SUM(budget_allocated) - SUM(total_amount)) / SUM(budget_allocated) * 100
                    ELSE 0
                END as variance_percentage')
      )
      ->groupBy('department_id')
      ->having('budget', '>', 0)
      ->get()
      ->map(function ($item) {
        return [
          'department_id' => $item->department_id,
          'department_name' => $item->department?->name ?? 'Unknown',
          'budget' => (float) $item->budget,
          'actual' => (float) $item->actual,
          'variance' => (float) $item->variance,
          'variance_percentage' => (float) $item->variance_percentage,
        ];
      });
  }

  public function getSpendForecast(int $months = 6, array $filters = []): Collection
  {
    // Get historical spending trend
    $historical = $this->getTrends('spending', 'month', $filters);

    if ($historical->isEmpty()) {
      return collect();
    }

    // Simple linear regression for forecasting
    $data = $historical->values()->toArray();
    $count = count($data);

    if ($count < 2) {
      return collect();
    }

    $xValues = range(1, $count);
    $yValues = array_column($data, 'value');

    $xMean = array_sum($xValues) / $count;
    $yMean = array_sum($yValues) / $count;

    $numerator = 0;
    $denominator = 0;

    for ($i = 0; $i < $count; $i++) {
      $numerator += ($xValues[$i] - $xMean) * ($yValues[$i] - $yMean);
      $denominator += pow(($xValues[$i] - $xMean), 2);
    }

    $slope = $denominator > 0 ? $numerator / $denominator : 0;
    $intercept = $yMean - ($slope * $xMean);

    $forecast = collect();

    for ($i = 1; $i <= $months; $i++) {
      $month = now()->addMonths($i)->format('Y-m');
      $value = $slope * ($count + $i) + $intercept;

      $forecast->push([
        'period' => $month,
        'forecast_value' => round(max(0, $value), 2),
      ]);
    }

    return $forecast;
  }

  public function getDateRange(?Carbon $startDate = null, ?Carbon $endDate = null): array
  {
    return parent::getDateRange($startDate, $endDate);
  }

  public function applyFilters($query, array $filters = []): void
  {
    parent::applyFilters($query, $filters);
  }
}
