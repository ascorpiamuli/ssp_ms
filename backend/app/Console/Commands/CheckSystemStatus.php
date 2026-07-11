<?php

namespace App\Console\Commands;

use App\Services\Admin\SystemStatusService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckSystemStatus extends Command
{
  protected $signature = 'system:check-status {--force : Force check even if recently checked}';
  protected $description = 'Check system status and log results';

  protected SystemStatusService $systemStatusService;

  public function __construct(SystemStatusService $systemStatusService)
  {
    parent::__construct();
    $this->systemStatusService = $systemStatusService;
  }

  public function handle(): int
  {
    $this->info('🔍 Checking system status...');

    try {
      $status = $this->systemStatusService->checkSystemStatus();

      $this->info('✅ System status checked successfully');
      $this->line('Status: ' . $status['status']);
      $this->line('Components:');

      foreach ($status['components'] as $name => $data) {
        $statusEmoji = match ($data['status']) {
          'operational' => '✅',
          'degraded' => '⚠️',
          'maintenance' => '🔧',
          'down' => '❌',
          default => '❓',
        };
        $this->line("  {$statusEmoji} {$name}: {$data['status']}");
      }

      Log::info('System status checked via command', ['status' => $status['status']]);

      return Command::SUCCESS;
    } catch (\Exception $e) {
      $this->error('❌ Failed to check system status: ' . $e->getMessage());
      Log::error('System status check failed: ' . $e->getMessage());
      return Command::FAILURE;
    }
  }
}
