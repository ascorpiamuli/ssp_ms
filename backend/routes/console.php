<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;

Artisan::command('inspire', function () {
  $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
Schedule::command('system:check-status')->everyFiveMinutes();

// Run backup daily at 2 AM
Schedule::command('backup:create-scheduled')->dailyAt('02:00');
