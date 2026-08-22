<?php
// app/Console/Commands/CleanProcurementPDFsCommand.php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CleanProcurementPDFsCommand extends Command
{
  protected $signature = 'pdf:clean-procurement
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--dirs= : Comma-separated list of directories to clean (default: supplier-quotation,quotations)}';

  protected $description = 'Clean PDF files from procurement directories (supplier-quotation and quotations)';

  public function handle()
  {
    $dryRun = $this->option('dry-run');
    $dirsInput = $this->option('dirs') ?? 'supplier-quotation,quotations';
    $directories = array_map('trim', explode(',', $dirsInput));

    $this->info('🔄 Starting PDF cleanup for procurement directories...');
    $this->info('======================================');
    $this->info("📁 Directories to clean: " . implode(', ', $directories));

    $storage = Storage::disk('public');
    $totalDeleted = 0;
    $totalSize = 0;

    foreach ($directories as $dir) {
      // Check both uploads/{dir} and {dir} (some might be directly in storage)
      $paths = [
        "uploads/{$dir}",
        $dir
      ];

      $foundPath = null;
      foreach ($paths as $path) {
        if ($storage->exists($path)) {
          $foundPath = $path;
          break;
        }
      }

      if (!$foundPath) {
        $this->warn("⚠️  Directory not found: uploads/{$dir} or {$dir}");
        continue;
      }

      $this->info("\n📁 Processing: {$foundPath}");

      // Get all PDF files recursively
      $allFiles = $storage->allFiles($foundPath);
      $pdfFiles = array_filter($allFiles, function ($file) {
        return str_ends_with($file, '.pdf');
      });

      $count = count($pdfFiles);
      $size = 0;

      if ($count === 0) {
        $this->info("✅ No PDF files found in {$foundPath}");
        continue;
      }

      // Calculate total size
      foreach ($pdfFiles as $file) {
        $size += $storage->size($file);
      }

      $sizeInMB = round($size / 1024 / 1024, 2);

      $this->info("📊 Found {$count} PDF files ({$sizeInMB} MB)");

      // Show sample files
      $this->info("📄 Sample files:");
      $sample = array_slice($pdfFiles, 0, 3);
      foreach ($sample as $file) {
        $fileSize = round($storage->size($file) / 1024, 2);
        $this->line("   - {$file} ({$fileSize} KB)");
      }
      if ($count > 3) {
        $this->line("   ... and " . ($count - 3) . " more files");
      }

      if ($dryRun) {
        $totalDeleted += $count;
        $totalSize += $size;
        continue;
      }

      // Confirm deletion for this directory
      if (!$this->confirm("\n⚠️  Delete {$count} PDF files from {$foundPath}? ({$sizeInMB} MB)", false)) {
        $this->warn("❌ Skipped: {$foundPath}");
        continue;
      }

      // Delete files
      $deleted = 0;
      foreach ($pdfFiles as $file) {
        if ($storage->delete($file)) {
          $deleted++;
        }
      }

      $this->info("✅ Deleted {$deleted} files from {$foundPath}");
      $totalDeleted += $deleted;
      $totalSize += $size;

      // Remove empty directories
      $this->cleanEmptyDirectories($storage, $foundPath);
    }

    $totalSizeInMB = round($totalSize / 1024 / 1024, 2);

    if ($dryRun) {
      $this->warn("\n⚠️  DRY RUN MODE - No files were deleted");
      $this->info("📊 Would delete:");
      $this->info("  - {$totalDeleted} PDF files");
      $this->info("  - {$totalSizeInMB} MB");
    } else {
      $this->info("\n✅ PDF cleanup completed!");
      $this->info("======================================");
      $this->info("📊 Summary:");
      $this->info("  - PDF files deleted: {$totalDeleted}");
      $this->info("  - Total space freed: {$totalSizeInMB} MB");
    }

    return 0;
  }

  private function cleanEmptyDirectories($storage, string $path): void
  {
    $directories = $storage->directories($path);
    foreach ($directories as $dir) {
      $files = $storage->files($dir);
      $subDirs = $storage->directories($dir);

      if (count($files) === 0 && count($subDirs) === 0) {
        $storage->deleteDirectory($dir);
        $this->info("🗑️  Removed empty directory: {$dir}");
      } else {
        $this->cleanEmptyDirectories($storage, $dir);
      }
    }
  }
}
