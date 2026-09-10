<?php
// app/Providers/AnalyticsServiceProvider.php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

// Repository Contracts
use App\Services\Analytics\Contracts\Repositories\RequisitionAnalyticsRepositoryInterface;
use App\Services\Analytics\Contracts\Repositories\RequisitionItemAnalyticsRepositoryInterface;
use App\Services\Analytics\Contracts\Repositories\ApprovalAnalyticsRepositoryInterface;
use App\Services\Analytics\Contracts\Repositories\PurchaseOrderAnalyticsRepositoryInterface;
use App\Services\Analytics\Contracts\Repositories\SupplierAnalyticsRepositoryInterface;
use App\Services\Analytics\Contracts\Repositories\FinancialAnalyticsRepositoryInterface;
use App\Services\Analytics\Contracts\Repositories\OperationAnalyticsRepositoryInterface;

// Repository Implementations
use App\Services\Analytics\Repositories\RequisitionAnalyticsRepository;
use App\Services\Analytics\Repositories\RequisitionItemAnalyticsRepository;
use App\Services\Analytics\Repositories\ApprovalAnalyticsRepository;
use App\Services\Analytics\Repositories\PurchaseOrderAnalyticsRepository;
use App\Services\Analytics\Repositories\SupplierAnalyticsRepository;
use App\Services\Analytics\Repositories\FinancialAnalyticsRepository;
use App\Services\Analytics\Repositories\OperationAnalyticsRepository;

// Service Contracts
use App\Services\Analytics\Contracts\Services\RequisitionAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\ApprovalAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\PurchaseOrderAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\SupplierAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\FinancialAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\OperationAnalyticsServiceInterface;
use App\Services\Analytics\Contracts\Services\CombinedAnalyticsServiceInterface;

// Service Implementations
use App\Services\Analytics\Services\RequisitionAnalyticsService;
use App\Services\Analytics\Services\ApprovalAnalyticsService;
use App\Services\Analytics\Services\PurchaseOrderAnalyticsService;
use App\Services\Analytics\Services\SupplierAnalyticsService;
use App\Services\Analytics\Services\FinancialAnalyticsService;
use App\Services\Analytics\Services\OperationAnalyticsService;
use App\Services\Analytics\Services\CombinedAnalyticsService;

class AnalyticsServiceProvider extends ServiceProvider
{
  public function register(): void
  {
    $this->registerRepositories();
    $this->registerServices();
  }

  protected function registerRepositories(): void
  {
    $this->app->bind(
      RequisitionAnalyticsRepositoryInterface::class,
      RequisitionAnalyticsRepository::class
    );

    $this->app->bind(
      RequisitionItemAnalyticsRepositoryInterface::class,
      RequisitionItemAnalyticsRepository::class
    );

    $this->app->bind(
      ApprovalAnalyticsRepositoryInterface::class,
      ApprovalAnalyticsRepository::class
    );

    $this->app->bind(
      PurchaseOrderAnalyticsRepositoryInterface::class,
      PurchaseOrderAnalyticsRepository::class
    );

    $this->app->bind(
      SupplierAnalyticsRepositoryInterface::class,
      SupplierAnalyticsRepository::class
    );

    $this->app->bind(
      FinancialAnalyticsRepositoryInterface::class,
      FinancialAnalyticsRepository::class
    );

    $this->app->bind(
      OperationAnalyticsRepositoryInterface::class,
      OperationAnalyticsRepository::class
    );
  }

  protected function registerServices(): void
  {
    $this->app->bind(
      RequisitionAnalyticsServiceInterface::class,
      RequisitionAnalyticsService::class
    );

    $this->app->bind(
      ApprovalAnalyticsServiceInterface::class,
      ApprovalAnalyticsService::class
    );

    $this->app->bind(
      PurchaseOrderAnalyticsServiceInterface::class,
      PurchaseOrderAnalyticsService::class
    );

    $this->app->bind(
      SupplierAnalyticsServiceInterface::class,
      SupplierAnalyticsService::class
    );

    $this->app->bind(
      FinancialAnalyticsServiceInterface::class,
      FinancialAnalyticsService::class
    );

    $this->app->bind(
      OperationAnalyticsServiceInterface::class,
      OperationAnalyticsService::class
    );

    $this->app->singleton(
      CombinedAnalyticsServiceInterface::class,
      function ($app) {
        return new CombinedAnalyticsService(
          $app->make(RequisitionAnalyticsServiceInterface::class),
          $app->make(ApprovalAnalyticsServiceInterface::class),
          $app->make(PurchaseOrderAnalyticsServiceInterface::class),
          $app->make(SupplierAnalyticsServiceInterface::class),
          $app->make(FinancialAnalyticsServiceInterface::class),
          $app->make(OperationAnalyticsServiceInterface::class)
        );
      }
    );
  }
}
