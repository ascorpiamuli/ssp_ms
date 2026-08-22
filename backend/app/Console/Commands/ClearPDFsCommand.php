<?php
// app/Console/Commands/ClearPDFsCommand.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Models\Upload;

class ClearPDFsCommand extends Command
{
  protected $signature = 'pdf:clear {--dry-run : Show what would be deleted without actually deleting}';
  protected $description = 'Clear all PDF files from storage and reset database references';

  public function handle()
  {
    $dryRun = $this->option('dry-run');

    $this->info('🔄 Starting PDF cleanup...');
    $this->info('======================================');

    // 1. Count all PDFs in storage
    $storage = Storage::disk('public');
    $pdfFiles = $storage->files('procurement', true);
    $pdfFiles = array_filter($pdfFiles, function ($file) {
      return str_ends_with($file, '.pdf');
    });

    $this->info("📁 Found " . count($pdfFiles) . " PDF files in storage");

    // 2. Get database records with PDF references
    $tables = [
      'supplier_quotations',
      'quotation_requests',
      'purchase_orders',
      'goods_received_notes',
      'service_acknowledgment_notes',
      'invoices',
      'payment_vouchers',
      'cheques',
      'contracts',
      'tenders',
    ];

    $totalDbRecords = 0;
    $dbRecords = [];

    foreach ($tables as $table) {
      $records = DB::table($table)
        ->whereNotNull('pdf_upload_id')
        ->orWhereNotNull('pdf_storage_path')
        ->get(['id', 'pdf_upload_id', 'pdf_storage_path', 'pdf_filename']);

      if ($records->count() > 0) {
        $dbRecords[$table] = $records;
        $totalDbRecords += $records->count();
        $this->info("📊 {$table}: " . $records->count() . " records with PDF references");
      }
    }

    $this->info("📊 Total database records with PDF references: {$totalDbRecords}");

    if ($dryRun) {
      $this->warn("\n⚠️  DRY RUN MODE - No files will be deleted");
      $this->info("Would delete:");
      $this->info("  - " . count($pdfFiles) . " PDF files from storage");
      $this->info("  - " . $totalDbRecords . " database references");
      $this->info("  - " . count($this->getUploadIds($dbRecords)) . " upload records");
      return 0;
    }

    // Confirm deletion
    if (!$this->confirm("\n⚠️  Are you sure you want to delete all PDFs and clear all references?", false)) {
      $this->info('❌ Operation cancelled.');
      return 0;
    }

    $this->info("\n🗑️  Deleting files...");

    // 3. Delete upload records first (foreign key constraint)
    $uploadIds = $this->getUploadIds($dbRecords);
    if (!empty($uploadIds)) {
      $deletedUploads = Upload::whereIn('id', $uploadIds)->delete();
      $this->info("✅ Deleted {$deletedUploads} upload records");
    }

    // 4. Update database tables to clear references
    foreach ($tables as $table) {
      $updated = DB::table($table)
        ->whereNotNull('pdf_upload_id')
        ->orWhereNotNull('pdf_storage_path')
        ->update([
          'pdf_upload_id' => null,
          'pdf_storage_path' => null,
          'pdf_filename' => null,
        ]);

      if ($updated > 0) {
        $this->info("✅ Updated {$table}: cleared PDF references");
      }
    }

    // 5. Delete the actual PDF files
    $deletedCount = 0;
    foreach ($pdfFiles as $file) {
      if ($storage->delete($file)) {
        $deletedCount++;
      }
    }

    $this->info("✅ Deleted {$deletedCount} PDF files from storage");

    // 6. Remove empty directories (optional)
    $this->cleanEmptyDirectories($storage, 'procurement');

    $this->info("\n✅ PDF cleanup completed!");
    $this->info("======================================");
    $this->info("📊 Summary:");
    $this->info("  - PDF files deleted: {$deletedCount}");
    $this->info("  - Database records cleared: {$totalDbRecords}");
    $this->info("  - Upload records deleted: " . count($uploadIds));

    return 0;
  }

  private function getUploadIds(array $dbRecords): array
  {
    $ids = [];
    foreach ($dbRecords as $records) {
      foreach ($records as $record) {
        if ($record->pdf_upload_id) {
          $ids[] = $record->pdf_upload_id;
        }
      }
    }
    return array_unique($ids);
  }

  private function cleanEmptyDirectories($storage, string $path): void
  {
    $directories = $storage->directories($path);
    foreach ($directories as $dir) {
      if (count($storage->files($dir)) === 0 && count($storage->directories($dir)) === 0) {
        $storage->deleteDirectory($dir);
        $this->info("🗑️  Removed empty directory: {$dir}");
      } else {
        $this->cleanEmptyDirectories($storage, $dir);
      }
    }
  }
}
