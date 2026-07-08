<?php
// app/Helpers/FileHelper.php

namespace App\Helpers;

class FileHelper
{
  /**
   * Get human readable file size
   */
  public static function fileSize(int $bytes): string
  {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];

    $index = 0;
    while ($bytes >= 1024 && $index < count($units) - 1) {
      $bytes /= 1024;
      $index++;
    }

    return round($bytes, 2) . ' ' . $units[$index];
  }

  /**
   * Get file extension
   */
  public static function extension(string $filename): string
  {
    return pathinfo($filename, PATHINFO_EXTENSION);
  }

  /**
   * Get file name without extension
   */
  public static function nameWithoutExtension(string $filename): string
  {
    return pathinfo($filename, PATHINFO_FILENAME);
  }
}
