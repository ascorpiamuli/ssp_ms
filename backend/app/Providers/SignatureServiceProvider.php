<?php
// app/Providers/SignatureServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Signatures\Contracts\Repositories\SignatureSpecimenRepositoryInterface;
use App\Services\Signatures\Contracts\Repositories\SignatureVerificationRepositoryInterface;
use App\Services\Signatures\Contracts\Repositories\SignatureVerificationLogRepositoryInterface;
use App\Services\Signatures\Contracts\Services\SignatureServiceInterface;
use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use App\Services\Signatures\Repositories\SignatureSpecimenRepository;
use App\Services\Signatures\Repositories\SignatureVerificationRepository;
use App\Services\Signatures\Repositories\SignatureVerificationLogRepository;
use App\Services\Signatures\Services\SignatureService;
use App\Services\Signatures\Services\QRCodeService;

class SignatureServiceProvider extends ServiceProvider
{
  public function register(): void
  {
    // Repositories
    $this->app->bind(
      SignatureSpecimenRepositoryInterface::class,
      SignatureSpecimenRepository::class
    );
    $this->app->bind(
      SignatureVerificationRepositoryInterface::class,
      SignatureVerificationRepository::class
    );
    $this->app->bind(
      SignatureVerificationLogRepositoryInterface::class,
      SignatureVerificationLogRepository::class
    );

    // Services
    $this->app->bind(
      QRCodeServiceInterface::class,
      QRCodeService::class
    );
    $this->app->bind(
      SignatureServiceInterface::class,
      SignatureService::class
    );
  }

  public function boot(): void
  {
    //
  }
}
