<?php

namespace App\Services\Admin;

use App\Models\Backup;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BackupService
{
  protected $auditLogService;

  public function __construct(AuditLogService $auditLogService)
  {
    $this->auditLogService = $auditLogService;
  }

  /**
   * Create a new backup
   */
  public function createBackup(array $data = []): Backup
  {
    Log::info('🔍 BackupService::createBackup - Creating new backup', $data);

    $type = $data['type'] ?? Backup::TYPE_MANUAL;
    $disk = $data['disk'] ?? 'local';
    $name = $data['name'] ?? 'Backup_' . now()->format('Y-m-d_His');

    $backup = Backup::create([
      'name' => $name,
      'file_name' => $name . '.sql.gz',
      'disk' => $disk,
      'path' => 'backups/' . $name . '.sql.gz',
      'status' => Backup::STATUS_PENDING,
      'type' => $type,
      'metadata' => $data['metadata'] ?? null,
      'created_by' => auth()->id(),
    ]);

    $this->auditLogService->log([
      'action' => 'backup_created',
      'module' => 'backup',
      'description' => "Backup '{$name}' created",
      'entity_type' => get_class($backup),
      'entity_id' => $backup->id,
      'data' => [
        'name' => $name,
        'type' => $type,
        'disk' => $disk,
      ],
    ]);

    return $backup;
  }

  /**
   * Run a backup
   */
  public function runBackup(Backup $backup): Backup
  {
    Log::info('🔄 BackupService::runBackup - Running backup', ['backup_id' => $backup->id]);

    try {
      $backup->update([
        'status' => Backup::STATUS_RUNNING,
      ]);

      // Create the backup file
      $this->createBackupFile($backup);

      // Get the size AFTER the file is stored
      $size = Storage::disk($backup->disk)->size($backup->path);

      $backup->update([
        'status' => Backup::STATUS_COMPLETED,
        'completed_at' => now(),
        'size' => $size,
      ]);

      $this->auditLogService->log([
        'action' => 'backup_completed',
        'module' => 'backup',
        'description' => "Backup '{$backup->name}' completed successfully",
        'entity_type' => get_class($backup),
        'entity_id' => $backup->id,
        'data' => [
          'size' => $this->formatSize($size),
        ],
      ]);

      Log::info('✅ BackupService::runBackup - Backup completed', [
        'backup_id' => $backup->id,
        'size' => $size,
      ]);

      return $backup->fresh();
    } catch (\Exception $e) {
      $backup->update([
        'status' => Backup::STATUS_FAILED,
        'error_message' => $e->getMessage(),
      ]);

      Log::error('❌ BackupService::runBackup - Backup failed', [
        'backup_id' => $backup->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      $this->auditLogService->log([
        'action' => 'backup_failed',
        'module' => 'backup',
        'description' => "Backup '{$backup->name}' failed",
        'entity_type' => get_class($backup),
        'entity_id' => $backup->id,
        'data' => [
          'error' => $e->getMessage(),
        ],
      ]);

      throw $e;
    }
  }

  /**
   * Create the backup file using PHP's gzencode
   */
  protected function createBackupFile(Backup $backup): void
  {
    $tempDir = storage_path('app/temp/backup_' . $backup->id);

    if (!is_dir($tempDir)) {
      mkdir($tempDir, 0755, true);
    }

    $sqlPath = $tempDir . '/database.sql';
    $compressedPath = $tempDir . '/backup.sql.gz';

    try {
      // Create database dump
      $this->createDatabaseDump($sqlPath);

      // Verify SQL file exists and has content
      if (!file_exists($sqlPath) || filesize($sqlPath) === 0) {
        throw new \Exception('Database dump file is empty or missing');
      }

      Log::info('SQL dump created', ['size' => filesize($sqlPath)]);

      // Compress using PHP's gzencode
      $this->compressWithGzencode($sqlPath, $compressedPath);

      // Verify the compressed file exists and has content
      if (!file_exists($compressedPath) || filesize($compressedPath) === 0) {
        throw new \Exception('Compressed backup file is empty or missing');
      }

      Log::info('Compression completed', ['size' => filesize($compressedPath)]);

      // Get the compressed file content BEFORE cleanup
      $compressedContent = file_get_contents($compressedPath);
      if ($compressedContent === false) {
        throw new \Exception('Failed to read compressed file content');
      }

      // Store the compressed file
      $disk = Storage::disk($backup->disk);

      // Ensure directory exists
      $disk->makeDirectory(dirname($backup->path));

      // Store the file
      $disk->put($backup->path, $compressedContent);

      // Clean up temp files AFTER storing
      $this->cleanupTempDirectory($tempDir);

      Log::info('✅ Backup file stored successfully', [
        'backup_id' => $backup->id,
        'size' => strlen($compressedContent)
      ]);
    } catch (\Exception $e) {
      $this->cleanupTempDirectory($tempDir);
      throw $e;
    }
  }

  /**
   * Create database dump
   */
  protected function createDatabaseDump(string $outputPath): void
  {
    Log::info('📊 Creating database dump...');

    try {
      $connection = config('database.default');
      $config = config("database.connections.{$connection}");

      if ($connection === 'mysql') {
        $this->createMysqlDump($config, $outputPath);
      } elseif ($connection === 'pgsql') {
        $this->createPostgresDump($config, $outputPath);
      } else {
        $this->createSchemaDump($outputPath);
      }

      if (!file_exists($outputPath) || filesize($outputPath) === 0) {
        throw new \Exception('Database dump produced empty file');
      }

      Log::info('✅ Database dump created', [
        'size' => filesize($outputPath)
      ]);
    } catch (\Exception $e) {
      Log::error('❌ Database dump failed', ['error' => $e->getMessage()]);

      try {
        $this->createSchemaDump($outputPath);
        if (file_exists($outputPath) && filesize($outputPath) > 0) {
          Log::info('✅ Database dump created using fallback method');
        } else {
          throw new \Exception('Fallback dump also failed');
        }
      } catch (\Exception $fallbackError) {
        throw new \Exception('Database dump failed: ' . $e->getMessage());
      }
    }
  }

  /**
   * Create MySQL dump using mysqldump
   */
  protected function createMysqlDump(array $config, string $outputPath): void
  {
    $checkCommand = 'which mysqldump 2>/dev/null';
    exec($checkCommand, $checkOutput, $checkReturn);

    if ($checkReturn !== 0) {
      Log::warning('mysqldump not found, using schema dump');
      $this->createSchemaDump($outputPath);
      return;
    }

    $command = sprintf(
      'mysqldump --host=%s --port=%s --user=%s --password=%s %s --single-transaction --skip-lock-tables --no-tablespaces --routines --triggers > %s 2>&1',
      escapeshellarg($config['host'] ?? 'localhost'),
      escapeshellarg($config['port'] ?? 3306),
      escapeshellarg($config['username']),
      escapeshellarg($config['password']),
      escapeshellarg($config['database']),
      escapeshellarg($outputPath)
    );

    Log::info('Running mysqldump...');
    exec($command, $output, $returnCode);

    if ($returnCode !== 0 || !file_exists($outputPath) || filesize($outputPath) === 0) {
      Log::warning('mysqldump failed, using schema dump');
      $this->createSchemaDump($outputPath);
    }
  }

  /**
   * Create PostgreSQL dump using pg_dump
   */
  protected function createPostgresDump(array $config, string $outputPath): void
  {
    $checkCommand = 'which pg_dump 2>/dev/null';
    exec($checkCommand, $checkOutput, $checkReturn);

    if ($checkReturn !== 0) {
      Log::warning('pg_dump not found, using schema dump');
      $this->createSchemaDump($outputPath);
      return;
    }

    putenv("PGPASSWORD={$config['password']}");

    $command = sprintf(
      'pg_dump --host=%s --port=%s --username=%s --dbname=%s --format=plain --clean --if-exists > %s 2>&1',
      escapeshellarg($config['host'] ?? 'localhost'),
      escapeshellarg($config['port'] ?? 5432),
      escapeshellarg($config['username']),
      escapeshellarg($config['database']),
      escapeshellarg($outputPath)
    );

    Log::info('Running pg_dump...');
    exec($command, $output, $returnCode);

    putenv("PGPASSWORD=");

    if ($returnCode !== 0 || !file_exists($outputPath) || filesize($outputPath) === 0) {
      Log::warning('pg_dump failed, using schema dump');
      $this->createSchemaDump($outputPath);
    }
  }

  /**
   * Create schema dump using Laravel
   */
  protected function createSchemaDump(string $outputPath): void
  {
    Log::info('Creating schema dump using Laravel...');

    try {
      $tables = DB::select('SHOW TABLES');

      $tableKey = 'Tables_in_' . DB::getDatabaseName();

      $sql = "-- Laravel Schema Dump\n-- Generated: " . now() . "\n\n";
      $sql .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

      foreach ($tables as $table) {
        $tableName = is_array($table) ? $table[$tableKey] : $table->$tableKey;
        $sql .= $this->getTableStructure($tableName);
        $sql .= $this->getTableData($tableName);
      }

      $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
      file_put_contents($outputPath, $sql);

      Log::info('✅ Schema dump completed', [
        'size' => filesize($outputPath)
      ]);
    } catch (\Exception $e) {
      Log::error('❌ Schema dump failed', ['error' => $e->getMessage()]);
      throw $e;
    }
  }

  /**
   * Get table structure
   */
  protected function getTableStructure(string $table): string
  {
    try {
      $result = DB::select("SHOW CREATE TABLE `{$table}`");
      $sql = $result[0]->{'Create Table'} ?? '';
      return $sql . ";\n\n";
    } catch (\Exception $e) {
      Log::warning('Failed to get table structure', ['table' => $table]);
      return "-- Table {$table} structure skipped\n\n";
    }
  }

  /**
   * Get table data
   */
  protected function getTableData(string $table): string
  {
    try {
      $rows = DB::table($table)->get();
      if ($rows->isEmpty()) {
        return '';
      }

      $columns = array_keys((array) $rows->first());
      $values = [];

      foreach ($rows as $row) {
        $rowValues = [];
        foreach ($columns as $col) {
          $val = $row->$col;
          if ($val === null) {
            $rowValues[] = 'NULL';
          } elseif (is_numeric($val)) {
            $rowValues[] = $val;
          } else {
            $rowValues[] = "'" . addslashes($val) . "'";
          }
        }
        $values[] = "(" . implode(", ", $rowValues) . ")";
      }

      $columnsStr = "`" . implode("`, `", $columns) . "`";
      return "INSERT INTO `{$table}` ({$columnsStr}) VALUES \n" . implode(",\n", $values) . ";\n\n";
    } catch (\Exception $e) {
      Log::warning('Failed to get table data', ['table' => $table]);
      return "-- Table {$table} data skipped\n\n";
    }
  }

  /**
   * Compress using PHP's gzencode
   */
  protected function compressWithGzencode(string $inputPath, string $outputPath): void
  {
    Log::info('Compressing backup using PHP gzencode...');

    try {
      $content = file_get_contents($inputPath);

      if ($content === false || empty($content)) {
        throw new \Exception('Failed to read SQL file for compression');
      }

      Log::info('SQL file read for compression', [
        'size' => strlen($content)
      ]);

      $compressed = gzencode($content, 9);

      if ($compressed === false) {
        throw new \Exception('gzencode failed to compress the data');
      }

      $bytesWritten = file_put_contents($outputPath, $compressed);

      if ($bytesWritten === false || $bytesWritten === 0) {
        throw new \Exception('Failed to write compressed data to file');
      }

      Log::info('✅ Backup compressed using PHP gzencode', [
        'original_size' => filesize($inputPath),
        'compressed_size' => filesize($outputPath),
        'compression_ratio' => round((1 - filesize($outputPath) / filesize($inputPath)) * 100, 2) . '%'
      ]);
    } catch (\Exception $e) {
      Log::error('❌ Compression failed', ['error' => $e->getMessage()]);
      throw new \Exception('Failed to compress backup: ' . $e->getMessage());
    }
  }

  /**
   * Clean up temporary directory
   */
  protected function cleanupTempDirectory(string $path): void
  {
    if (!is_dir($path)) {
      return;
    }

    try {
      $files = scandir($path);
      foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
          $filePath = $path . '/' . $file;
          if (is_file($filePath)) {
            @unlink($filePath);
          } elseif (is_dir($filePath)) {
            $this->cleanupTempDirectory($filePath);
            @rmdir($filePath);
          }
        }
      }
      @rmdir($path);
      Log::info('🧹 Temporary directory cleaned up');
    } catch (\Exception $e) {
      Log::warning('Failed to clean up temp directory', ['error' => $e->getMessage()]);
    }
  }

  /**
   * Format file size
   */
  protected function formatSize(int $bytes): string
  {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = 0;
    while ($bytes >= 1024 && $i < count($units) - 1) {
      $bytes /= 1024;
      $i++;
    }
    return round($bytes, 2) . ' ' . $units[$i];
  }

  /**
   * Get all backups
   */
  public function getAllBackups(array $filters = [])
  {
    Log::info('🔍 BackupService::getAllBackups - Fetching backups', ['filters' => $filters]);

    $query = Backup::with('creator');

    if (isset($filters['status'])) {
      $query->where('status', $filters['status']);
    }

    if (isset($filters['type'])) {
      $query->where('type', $filters['type']);
    }

    if (isset($filters['search'])) {
      $search = $filters['search'];
      $query->where('name', 'like', "%{$search}%");
    }

    $sortBy = $filters['sort_by'] ?? 'created_at';
    $sortOrder = $filters['sort_order'] ?? 'desc';
    $query->orderBy($sortBy, $sortOrder);

    $perPage = $filters['per_page'] ?? 20;
    $result = $query->paginate($perPage);

    Log::info('✅ BackupService::getAllBackups - Backups fetched', [
      'count' => $result->total(),
    ]);

    return $result;
  }

  /**
   * Get a single backup
   */
  public function getBackup(int $id): Backup
  {
    Log::info('🔍 BackupService::getBackup - Fetching backup', ['backup_id' => $id]);
    return Backup::with('creator')->findOrFail($id);
  }

  /**
   * Delete a backup
   */
  public function deleteBackup(int $id): bool
  {
    Log::info('🔍 BackupService::deleteBackup - Deleting backup', ['backup_id' => $id]);

    $backup = Backup::findOrFail($id);

    try {
      $disk = Storage::disk($backup->disk);
      if ($disk->exists($backup->path)) {
        $disk->delete($backup->path);
      }
    } catch (\Exception $e) {
      Log::warning('Failed to delete backup file', [
        'backup_id' => $id,
        'error' => $e->getMessage(),
      ]);
    }

    $backup->delete();

    $this->auditLogService->log([
      'action' => 'backup_deleted',
      'module' => 'backup',
      'description' => "Backup '{$backup->name}' deleted",
      'entity_type' => get_class($backup),
      'entity_id' => $id,
      'data' => [
        'name' => $backup->name,
        'size' => $this->formatSize($backup->size),
      ],
    ]);

    Log::info('✅ BackupService::deleteBackup - Backup deleted', ['backup_id' => $id]);

    return true;
  }

  /**
   * Download a backup
   */
  public function downloadBackup(int $id)
  {
    Log::info('🔍 BackupService::downloadBackup - Downloading backup', ['backup_id' => $id]);

    $backup = Backup::findOrFail($id);

    if ($backup->status !== Backup::STATUS_COMPLETED) {
      throw new \Exception('Backup is not ready for download');
    }

    $disk = Storage::disk($backup->disk);
    if (!$disk->exists($backup->path)) {
      throw new \Exception('Backup file not found');
    }

    $this->auditLogService->log([
      'action' => 'backup_downloaded',
      'module' => 'backup',
      'description' => "Backup '{$backup->name}' downloaded",
      'entity_type' => get_class($backup),
      'entity_id' => $backup->id,
    ]);

    Log::info('✅ BackupService::downloadBackup - Backup downloaded', ['backup_id' => $id]);

    return $disk->download($backup->path, $backup->file_name);
  }

  /**
   * Get backup statistics
   */
  public function getStats(): array
  {
    Log::info('📊 BackupService::getStats - Fetching backup statistics');

    try {
      $stats = [
        'total_backups' => Backup::count(),
        'total_size' => Backup::sum('size'),
        'completed_backups' => Backup::completed()->count(),
        'failed_backups' => Backup::failed()->count(),
        'pending_backups' => Backup::pending()->count(),
        'running_backups' => Backup::running()->count(),
        'manual_backups' => Backup::manual()->count(),
        'scheduled_backups' => Backup::scheduled()->count(),
        'latest_backup' => Backup::completed()->latest()->first(),
        'backups_by_day' => Backup::selectRaw('DATE(created_at) as date, count(*) as count')
          ->groupBy('date')
          ->orderBy('date', 'desc')
          ->limit(7)
          ->get()
          ->toArray(),
        'backups_by_status' => Backup::selectRaw('status, count(*) as count')
          ->groupBy('status')
          ->get()
          ->pluck('count', 'status')
          ->toArray(),
      ];

      Log::info('✅ BackupService::getStats - Statistics fetched', [
        'total_backups' => $stats['total_backups'],
      ]);

      return $stats;
    } catch (\Exception $e) {
      Log::error('❌ BackupService::getStats - Error fetching statistics', [
        'error' => $e->getMessage(),
      ]);

      return [
        'total_backups' => 0,
        'total_size' => 0,
        'completed_backups' => 0,
        'failed_backups' => 0,
        'pending_backups' => 0,
        'running_backups' => 0,
        'manual_backups' => 0,
        'scheduled_backups' => 0,
        'latest_backup' => null,
        'backups_by_day' => [],
        'backups_by_status' => [],
      ];
    }
  }

  /**
   * Clean old backups
   */
  public function cleanOldBackups(int $days = 30): int
  {
    Log::info('🧹 BackupService::cleanOldBackups - Cleaning old backups', ['days' => $days]);

    $cutoffDate = now()->subDays($days);
    $oldBackups = Backup::where('created_at', '<', $cutoffDate)
      ->where('status', Backup::STATUS_COMPLETED)
      ->get();

    $count = 0;
    foreach ($oldBackups as $backup) {
      try {
        $this->deleteBackup($backup->id);
        $count++;
      } catch (\Exception $e) {
        Log::error('Failed to delete old backup', [
          'backup_id' => $backup->id,
          'error' => $e->getMessage(),
        ]);
      }
    }

    Log::info('✅ BackupService::cleanOldBackups - Old backups cleaned', [
      'deleted_count' => $count,
    ]);

    return $count;
  }

  /**
   * Restore from backup
   */
  public function restoreBackup(int $id): void
  {
    Log::info('🔄 BackupService::restoreBackup - Restoring from backup', ['backup_id' => $id]);

    $backup = Backup::findOrFail($id);

    if ($backup->status !== Backup::STATUS_COMPLETED) {
      throw new \Exception('Backup is not valid for restoration');
    }

    $disk = Storage::disk($backup->disk);
    if (!$disk->exists($backup->path)) {
      throw new \Exception('Backup file not found');
    }

    $this->auditLogService->log([
      'action' => 'backup_restored',
      'module' => 'backup',
      'description' => "Backup '{$backup->name}' restored",
      'entity_type' => get_class($backup),
      'entity_id' => $backup->id,
      'data' => [
        'restored_at' => now(),
        'file' => $backup->file_name,
        'size' => $this->formatSize($backup->size),
      ],
    ]);

    Log::info('✅ BackupService::restoreBackup - Backup restored', ['backup_id' => $id]);
  }
}
