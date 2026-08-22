<?php
// app/Services/PDF/PDFStorageService.php

declare(strict_types=1);

namespace App\Services\PDF;

use App\Models\Upload;
use App\Services\UploadService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PDFStorageService
{
  protected UploadService $uploadService;

  public function __construct(UploadService $uploadService)
  {
    $this->uploadService = $uploadService;
  }

  /**
   * Save PDF to storage using UploadService
   */
  public function savePDF(Model $model, string $pdfContent, string $filename, string $collection = 'pdf'): ?Upload
  {
    Log::info('[PDFStorageService] Saving PDF', [
      'model_type' => get_class($model),
      'model_id' => $model->id,
      'filename' => $filename,
      'collection' => $collection,
      'content_size' => strlen($pdfContent),
    ]);

    try {
      // Create a temporary file from the PDF content
      $tempPath = tempnam(sys_get_temp_dir(), 'pdf_');
      if ($tempPath === false) {
        Log::error('[PDFStorageService] Failed to create temp file');
        return null;
      }

      file_put_contents($tempPath, $pdfContent);

      if (!file_exists($tempPath)) {
        Log::error('[PDFStorageService] Temp file not created');
        return null;
      }

      Log::info('[PDFStorageService] Temp file created', [
        'path' => $tempPath,
        'size' => filesize($tempPath)
      ]);

      // Create a mock UploadedFile
      $file = new \Illuminate\Http\UploadedFile(
        $tempPath,
        $filename,
        'application/pdf',
        null,
        true
      );

      Log::info('[PDFStorageService] UploadedFile created', [
        'original_name' => $file->getClientOriginalName(),
        'size' => $file->getSize(),
        'mime' => $file->getMimeType(),
      ]);

      // Upload using UploadService
      $upload = $this->uploadService->upload(
        $file,
        $model,
        $collection,
        $filename,
        'PDF Document',
        [
          'download_count' => $model->download_count ?? 0,
          'generated_at' => now()->toDateTimeString(),
          'document_type' => get_class($model),
          'document_id' => $model->id,
        ]
      );

      if (!$upload) {
        Log::error('[PDFStorageService] Upload failed - no upload returned');
        @unlink($tempPath);
        return null;
      }

      Log::info('[PDFStorageService] Upload completed', [
        'upload_id' => $upload->id,
        'file_path' => $upload->file_path,
        'uploadable_type' => $upload->uploadable_type,
        'uploadable_id' => $upload->uploadable_id,
      ]);

      // ✅ FIX: Update the model with the upload reference
      // The model might need to be refreshed first to get the latest data
      $model->refresh();

      $updated = $model->update([
        'pdf_upload_id' => $upload->id,
        'pdf_storage_path' => $upload->file_path,
        'pdf_filename' => $filename,
        'last_downloaded_at' => now(),
      ]);

      if (!$updated) {
        Log::error('[PDFStorageService] Failed to update model with PDF references', [
          'model_id' => $model->id,
          'upload_id' => $upload->id,
        ]);
        @unlink($tempPath);
        return $upload;
      }

      // Refresh the model to get updated values
      $model->refresh();

      Log::info('[PDFStorageService] PDF saved and model updated successfully', [
        'upload_id' => $upload->id,
        'path' => $upload->file_path,
        'model_pdf_upload_id' => $model->pdf_upload_id,
        'model_pdf_storage_path' => $model->pdf_storage_path,
        'model_pdf_filename' => $model->pdf_filename,
      ]);

      // Clean up temp file
      @unlink($tempPath);

      return $upload;
    } catch (\Exception $e) {
      Log::error('[PDFStorageService] Failed to save PDF', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      // Clean up temp file if it exists
      if (isset($tempPath) && file_exists($tempPath)) {
        @unlink($tempPath);
      }

      return null;
    }
  }

  /**
   * Save PDF directly to storage (bypass UploadService if needed)
   */
  public function savePDFDirect(Model $model, string $pdfContent, string $filename, string $subdirectory = ''): ?string
  {
    Log::info('[PDFStorageService] Saving PDF directly', [
      'model_type' => get_class($model),
      'model_id' => $model->id,
      'filename' => $filename,
      'content_size' => strlen($pdfContent),
    ]);

    try {
      // Generate a unique path
      $path = $subdirectory ?: $this->getDefaultPath($model);
      $fullPath = $path . '/' . $filename;

      // Ensure the directory exists
      $directory = dirname($fullPath);
      if (!Storage::disk('public')->exists($directory)) {
        Storage::disk('public')->makeDirectory($directory, 0755, true);
      }

      // Save the file
      $saved = Storage::disk('public')->put($fullPath, $pdfContent);

      if (!$saved) {
        Log::error('[PDFStorageService] Failed to save PDF directly');
        return null;
      }

      Log::info('[PDFStorageService] PDF saved directly', [
        'path' => $fullPath,
        'size' => Storage::disk('public')->size($fullPath),
      ]);

      // Update the model
      $model->update([
        'pdf_storage_path' => $fullPath,
        'pdf_filename' => $filename,
        'last_downloaded_at' => now(),
      ]);

      $model->refresh();

      Log::info('[PDFStorageService] Model updated', [
        'pdf_storage_path' => $model->pdf_storage_path,
        'pdf_filename' => $model->pdf_filename,
      ]);

      return $fullPath;
    } catch (\Exception $e) {
      Log::error('[PDFStorageService] Failed to save PDF directly', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      return null;
    }
  }

  /**
   * Get default storage path for a model
   */
  protected function getDefaultPath(Model $model): string
  {
    $modelType = strtolower(class_basename($model));
    $year = date('Y');
    $month = date('m');
    $day = date('d');

    return "uploads/{$modelType}/{$year}/{$month}/{$day}";
  }

  /**
   * Get PDF content from storage
   */
  public function getPDFContent(Model $model): ?string
  {
    if (!$model->pdf_storage_path) {
      Log::warning('[PDFStorageService] No PDF stored', [
        'model_type' => get_class($model),
        'model_id' => $model->id,
      ]);
      return null;
    }

    if (!Storage::disk('public')->exists($model->pdf_storage_path)) {
      Log::warning('[PDFStorageService] PDF file not found', [
        'path' => $model->pdf_storage_path,
      ]);
      return null;
    }

    return Storage::disk('public')->get($model->pdf_storage_path);
  }

  /**
   * Check if PDF exists in storage
   */
  public function pdfExists(Model $model): bool
  {
    // Check by storage path first
    if ($model->pdf_storage_path && Storage::disk('public')->exists($model->pdf_storage_path)) {
      return true;
    }

    // Check by upload ID if storage path is null
    if ($model->pdf_upload_id) {
      $upload = Upload::find($model->pdf_upload_id);
      if ($upload && $upload->file_path && Storage::disk('public')->exists($upload->file_path)) {
        // Update the model with the correct path
        $model->update([
          'pdf_storage_path' => $upload->file_path,
          'pdf_filename' => $upload->original_name,
        ]);
        $model->refresh();
        return true;
      }
    }

    return false;
  }

  /**
   * Increment download count and update timestamp
   */
  public function incrementDownloadCount(Model $model): Model
  {
    $oldCount = $model->download_count ?? 0;
    $model->increment('download_count');
    $model->update(['last_downloaded_at' => now()]);
    $model->refresh();

    Log::info('[PDFStorageService] Download count incremented', [
      'model_type' => get_class($model),
      'model_id' => $model->id,
      'old_count' => $oldCount,
      'new_count' => $model->download_count,
    ]);

    return $model;
  }

  /**
   * Delete PDF from storage
   */
  public function deletePDF(Model $model): bool
  {
    if ($model->pdf_storage_path) {
      Storage::disk('public')->delete($model->pdf_storage_path);
    }

    if ($model->pdf_upload_id) {
      $upload = Upload::find($model->pdf_upload_id);
      if ($upload) {
        $this->uploadService->delete($upload);
      }
    }

    $model->update([
      'pdf_storage_path' => null,
      'pdf_filename' => null,
      'pdf_upload_id' => null,
    ]);

    Log::info('[PDFStorageService] PDF deleted', [
      'model_type' => get_class($model),
      'model_id' => $model->id,
    ]);

    return true;
  }

  /**
   * Get a descriptive download status message
   */
  public function getDownloadStatusMessage(Model $model): string
  {
    $count = $model->download_count ?? 0;
    $timestamp = $model->last_downloaded_at
      ? $model->last_downloaded_at->format('Y-m-d H:i:s')
      : 'Never';

    $label = $this->getDownloadLabel($count);

    return "{$label} - Last downloaded: {$timestamp}";
  }

  /**
   * Get download statistics as an array
   */
  public function getDownloadStatistics(Model $model): array
  {
    $count = $model->download_count ?? 0;

    return [
      'total_downloads' => $count,
      'last_downloaded_at' => $model->last_downloaded_at,
      'last_downloaded_at_formatted' => $model->last_downloaded_at
        ? $model->last_downloaded_at->format('Y-m-d H:i:s')
        : null,
      'download_label' => $this->getDownloadLabel($count),
    ];
  }

  /**
   * Get download count label
   */
  private function getDownloadLabel(int $downloadCount): string
  {
    if ($downloadCount === 0) return 'Original Document';
    if ($downloadCount === 1) return 'First Download';
    if ($downloadCount === 2) return 'Second Download';
    if ($downloadCount === 3) return 'Third Download';
    return 'Download #' . $downloadCount;
  }
}
