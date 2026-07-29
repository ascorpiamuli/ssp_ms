<?php
// app/Providers/ProcurementServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Procurement\Contracts\Repositories\QuotationRepositoryInterface;
use App\Services\Procurement\Repositories\QuotationRepository;
use App\Services\Procurement\Contracts\Repositories\PurchaseOrderRepositoryInterface;
use App\Services\Procurement\Repositories\PurchaseOrderRepository;
use App\Services\Procurement\Contracts\Repositories\GoodsReceivedRepositoryInterface;
use App\Services\Procurement\Repositories\GoodsReceivedRepository;
use App\Services\Procurement\Contracts\Repositories\InvoiceRepositoryInterface;
use App\Services\Procurement\Repositories\InvoiceRepository;
use App\Services\Procurement\Contracts\Repositories\PaymentRepositoryInterface;
use App\Services\Procurement\Repositories\PaymentRepository;
use App\Services\Procurement\Contracts\Repositories\ContractRepositoryInterface;
use App\Services\Procurement\Repositories\ContractRepository;
use App\Services\Procurement\Contracts\Repositories\TenderRepositoryInterface;
use App\Services\Procurement\Repositories\TenderRepository;

use App\Services\Procurement\Contracts\Utilities\ReferenceNumberGeneratorInterface;
use App\Services\Procurement\Utilities\ReferenceNumberGenerator;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\Utilities\PdfGenerator;
use App\Services\Procurement\Contracts\Utilities\NotificationDispatcherInterface;
use App\Services\Procurement\Utilities\NotificationDispatcher;
use App\Services\Procurement\Contracts\Validators\ProcurementValidatorInterface;
use App\Services\Procurement\Validators\ProcurementValidator;

class ProcurementServiceProvider extends ServiceProvider
{
  public function register(): void
  {
    // Repository Bindings
    $this->app->bind(
      QuotationRepositoryInterface::class,
      QuotationRepository::class
    );
    $this->app->bind(
      PurchaseOrderRepositoryInterface::class,
      PurchaseOrderRepository::class
    );
    $this->app->bind(
      GoodsReceivedRepositoryInterface::class,
      GoodsReceivedRepository::class
    );
    $this->app->bind(
      InvoiceRepositoryInterface::class,
      InvoiceRepository::class
    );
    $this->app->bind(
      PaymentRepositoryInterface::class,
      PaymentRepository::class
    );
    $this->app->bind(
      ContractRepositoryInterface::class,
      ContractRepository::class
    );
    $this->app->bind(
      TenderRepositoryInterface::class,
      TenderRepository::class
    );

    // Utility Bindings
    $this->app->bind(
      ReferenceNumberGeneratorInterface::class,
      ReferenceNumberGenerator::class
    );
    $this->app->bind(
      PdfGeneratorInterface::class,
      PdfGenerator::class
    );
    $this->app->bind(
      NotificationDispatcherInterface::class,
      NotificationDispatcher::class
    );
    $this->app->bind(
      ProcurementValidatorInterface::class,
      ProcurementValidator::class
    );

    // Service Bindings (if needed)
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\QuotationServiceInterface::class,
      \App\Services\Procurement\Services\QuotationService::class
    );
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\PurchaseOrderServiceInterface::class,
      \App\Services\Procurement\Services\PurchaseOrderService::class
    );
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\GoodsReceivedServiceInterface::class,
      \App\Services\Procurement\Services\GoodsReceivedService::class
    );
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\InvoiceServiceInterface::class,
      \App\Services\Procurement\Services\InvoiceService::class
    );
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\PaymentServiceInterface::class,
      \App\Services\Procurement\Services\PaymentService::class
    );
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\ContractServiceInterface::class,
      \App\Services\Procurement\Services\ContractService::class
    );
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\TenderServiceInterface::class,
      \App\Services\Procurement\Services\TenderService::class
    );
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\ProcurementServiceInterface::class,
      \App\Services\Procurement\Services\ProcurementService::class
    );
    $this->app->bind(
      \App\Services\Procurement\Contracts\Services\ApprovalServiceInterface::class,
      \App\Services\Procurement\Services\ApprovalService::class
    );
  }

  public function boot(): void
  {
    //
  }
}
