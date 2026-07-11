<?php

namespace App\Console\Commands;

use App\Services\Admin\BackupService;
use App\Models\Backup;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CreateScheduledBackup extends Command
{
  protected $signature = 'backup:create-scheduled';
  protected $description = 'Create a scheduled backup';

  protected BackupService $backupService;

  public function __construct(BackupService $backupService)
  {
    parent::__construct();
    $this->backupService = $backupService;
  }

  public function handle(): int
  {
    $this->info('🔄 Creating scheduled backup...');

    try {
      $backup = $this->backupService->createBackup([
        'name' => 'Scheduled_Backup_' . now()->format('Y-m-d_His'),
        'type' => Backup::TYPE_SCHEDULED,
      ]);

      $this->backupService->runBackup($backup);

      $this->info('✅ Scheduled backup created successfully');
      Log::info('Scheduled backup completed', ['backup_id' => $backup->id]);

      return Command::SUCCESS;
    } catch (\Exception $e) {
      $this->error('❌ Scheduled backup failed: ' . $e->getMessage());
      Log::error('Scheduled backup failed', ['error' => $e->getMessage()]);
      return Command::FAILURE;
    }
  }
}
