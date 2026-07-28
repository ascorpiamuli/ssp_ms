<?php

namespace App\Services;

use App\Models\Upload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Exception;

class UploadService
{
  /**
   * Upload a file and create upload record.
   */
  public function upload(
    UploadedFile $file,
    $uploadable = null,
    string $collection = 'default',
    ?string $title = null,
    ?string $description = null,
    ?array $metaData = null
  ): Upload {
    $path = $this->storeFile($file, $collection);

    $upload = Upload::create([
      'uploadable_type' => $uploadable ? get_class($uploadable) : null,
      'uploadable_id' => $uploadable ? $uploadable->id : null,
      'file_name' => basename($path),
      'original_name' => $file->getClientOriginalName(),
      'file_path' => $path,
      'file_url' => asset('storage/' . $path),
      'file_type' => $this->getFileType($file),
      'mime_type' => $file->getMimeType(),
      'extension' => $file->getClientOriginalExtension(),
      'file_size' => $file->getSize(),
      'disk' => 'public',
      'collection' => $collection,
      'title' => $title ?? $file->getClientOriginalName(),
      'description' => $description,
      'meta_data' => $metaData,
      'uploaded_by' => auth()->id(),
      'uploaded_at' => now(),
      'status' => 'completed',
    ]);

    // If it's an image, get dimensions using native PHP
    if ($this->isImage($file)) {
      $this->processImageMetadata($upload, $file);
    }

    return $upload;
  }

/**
 * Store file on disk using native PHP functions.
 */
protected function storeFile(UploadedFile $file, string $collection): string
{
    $folder = $this->getFolderPath($collection);
    $filename = $this->generateFileName($file);
    $relativePath = $folder . '/' . $filename;

    // Get absolute path
    $absolutePath = storage_path('app/public/' . $relativePath);
    $directory = dirname($absolutePath);

    \Log::info('UploadService: Storing file', [
        'relative_path' => $relativePath,
        'absolute_path' => $absolutePath,
        'directory' => $directory
    ]);

    // Check if directory exists, create if not
    if (!is_dir($directory)) {
        // Try multiple permission combinations
        $created = false;
        $perms = [0777, 0775, 0755];
        foreach ($perms as $perm) {
            if (mkdir($directory, $perm, true)) {
                $created = true;
                \Log::info('UploadService: Directory created with permissions', [
                    'directory' => $directory,
                    'permissions' => decoct($perm)
                ]);
                break;
            }
        }
        if (!$created) {
            throw new Exception('Failed to create directory: ' . $directory);
        }
    }

    // Check if directory is writable
    if (!is_writable($directory)) {
        // Try to make it writable
        chmod($directory, 0777);
        if (!is_writable($directory)) {
            throw new Exception('Directory is not writable: ' . $directory . ' (perms: ' . substr(sprintf('%o', fileperms($directory)), -4) . ')');
        }
    }

    // Try using copy() first (more reliable on some systems)
    $tempPath = $file->getRealPath();
    if (!copy($tempPath, $absolutePath)) {
        // Fallback to file_put_contents
        $content = file_get_contents($tempPath);
        if ($content === false || file_put_contents($absolutePath, $content) === false) {
            throw new Exception('Failed to write file: ' . $absolutePath);
        }
    }

    // Verify file exists
    if (!file_exists($absolutePath)) {
        throw new Exception('File not found after write: ' . $absolutePath);
    }

    \Log::info('UploadService: File stored successfully', [
        'relative_path' => $relativePath,
        'absolute_path' => $absolutePath,
        'size' => filesize($absolutePath)
    ]);

    return $relativePath;
}
  /**
   * Generate a unique filename.
   */
  protected function generateFileName(UploadedFile $file): string
  {
    $extension = $file->getClientOriginalExtension();
    $name = Str::uuid()->toString();

    return "{$name}.{$extension}";
  }

  /**
   * Get folder path based on collection.
   */
  protected function getFolderPath(string $collection): string
  {
    $basePath = 'uploads';

    // Map collections to subfolders
    $folders = [
      'avatar' => 'avatars',
      'profile' => 'profiles',
      'document' => 'documents',
      'gallery' => 'gallery',
      'cover' => 'covers',
      'signature' => 'signatures',
      'attachment' => 'attachments',
    ];

    $subFolder = $folders[$collection] ?? $collection;

    return "{$basePath}/{$subFolder}/" . date('Y/m/d');
  }

  /**
   * Get file type from mime type.
   */
  protected function getFileType(UploadedFile $file): string
  {
    $mimeType = $file->getMimeType();

    if (str_starts_with($mimeType, 'image/')) {
      return 'image';
    }

    if (str_starts_with($mimeType, 'video/')) {
      return 'video';
    }

    if (str_starts_with($mimeType, 'audio/')) {
      return 'audio';
    }

    if (in_array($mimeType, [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
    ])) {
      return 'document';
    }

    return 'other';
  }

  /**
   * Check if file is an image.
   */
  protected function isImage(UploadedFile $file): bool
  {
    return str_starts_with($file->getMimeType(), 'image/');
  }

  /**
   * Process image metadata using native PHP functions.
   */
  protected function processImageMetadata(Upload $upload, UploadedFile $file): void
  {
    try {
      // Use native PHP getimagesize
      $imageInfo = getimagesize($file->getRealPath());

      if ($imageInfo) {
        $width = $imageInfo[0];
        $height = $imageInfo[1];

        $upload->update([
          'width' => $width,
          'height' => $height,
          'image_orientation' => $width > $height ? 'landscape' : ($width < $height ? 'portrait' : 'square'),
        ]);
      }
    } catch (Exception $e) {
      // Image processing failed, but upload still exists
      $upload->update([
        'meta_data' => array_merge($upload->meta_data ?? [], [
          'image_processing_error' => $e->getMessage(),
        ]),
      ]);
    }
  }

  /**
   * Delete an upload.
   */
  public function delete(Upload $upload): bool
  {
    // Delete file from storage
    if (Storage::disk('public')->exists($upload->file_path)) {
      Storage::disk('public')->delete($upload->file_path);
    }

    // Delete record
    return $upload->delete();
  }

  /**
   * Get uploads for a model.
   */
  public function getUploadsForModel($model, ?string $collection = null)
  {
    $query = Upload::where('uploadable_type', get_class($model))
      ->where('uploadable_id', $model->id);

    if ($collection) {
      $query->where('collection', $collection);
    }

    return $query->orderBy('created_at', 'desc')->get();
  }

  /**
   * Get primary upload for a model.
   */
  public function getPrimaryUpload($model, string $collection = 'default')
  {
    return Upload::where('uploadable_type', get_class($model))
      ->where('uploadable_id', $model->id)
      ->where('collection', $collection)
      ->first();
  }

  /**
   * Update uploadable relationship.
   */
  public function attachToModel(Upload $upload, $model): Upload
  {
    $upload->update([
      'uploadable_type' => get_class($model),
      'uploadable_id' => $model->id,
    ]);

    return $upload;
  }
}
