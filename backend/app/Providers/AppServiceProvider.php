<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Department;
use App\Models\Supplier;
use App\Models\Requisition;
use App\Models\PurchaseOrder;
use App\Models\Invoice;
use App\Models\Budget;
use App\Models\Role;
use App\Observers\AuditObserver;
use App\Services\Admin\AuditLogService;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;

class AppServiceProvider extends ServiceProvider
{
  /**
   * Register any application services.
   */
  public function register(): void
  {
    // Register AuditLogService as a singleton
    $this->app->singleton(AuditLogService::class, function ($app) {
      return new AuditLogService();
    });
  }

  /**
   * Bootstrap any application services.
   */
  public function boot(): void
  {
    // Fix for MySQL < 5.7.7 or MariaDB < 10.2.2
    Schema::defaultStringLength(191);

    // Register model observers for audit logging
    $this->registerAuditObservers();
  }

  /**
   * Register audit observers for models.
   */
  protected function registerAuditObservers(): void
  {
    // Only register if the tables exist
    if ($this->shouldRegisterObservers()) {
      // Register observers for models you want to audit
      User::observe(AuditObserver::class);
      Department::observe(AuditObserver::class);

      // Add more models as needed
      if (class_exists(Supplier::class)) {
        Supplier::observe(AuditObserver::class);
      }
    }
  }

  /**
   * Check if we should register observers.
   */
  protected function shouldRegisterObservers(): bool
  {
    // Only register observers in non-console environment
    // or when running migrations
    if ($this->app->runningInConsole()) {
      return true;
    }

    try {
      // Check if the user_activity_logs table exists
      return Schema::hasTable('user_activity_logs');
    } catch (\Exception $e) {
      return false;
    }
  }
}
