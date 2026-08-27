<?php

namespace App\Providers;
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
  }


  }
