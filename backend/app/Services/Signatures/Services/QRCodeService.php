<?php
// app/Services/Signatures/Services/QRCodeService.php

namespace App\Services\Signatures\Services;

use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Color\Color;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class QRCodeService implements QRCodeServiceInterface
{
  /**
   * Generate QR Code and save to file - Returns file path
   */
  public function generateQrCode(string $data): ?string
  {
    try {
      $qrDir = storage_path('app/temp/qr_codes');
      if (!is_dir($qrDir)) {
        mkdir($qrDir, 0755, true);
      }

      $qrPath = $qrDir . '/qr_' . uniqid() . '.png';

      $qrCode = new QrCode(
        $data,
        new Encoding('UTF-8'),
        ErrorCorrectionLevel::High,
        200,
        10,
        RoundBlockSizeMode::Margin,
        new Color(0, 0, 0),
        new Color(255, 255, 255)
      );

      $writer = new PngWriter();
      $result = $writer->write($qrCode);
      $result->saveToFile($qrPath);

      return $qrPath;
    } catch (\Exception $e) {
      Log::error('[QRCodeService] QR Code generation failed: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Generate QR Code as PNG binary string
   */
  public function generatePNG(string $data, ?string $label = null, int $size = 300): string
  {
    try {
      $qrCode = new QrCode(
        $data,
        new Encoding('UTF-8'),
        ErrorCorrectionLevel::High,
        $size,
        10,
        RoundBlockSizeMode::Margin,
        new Color(0, 0, 0),
        new Color(255, 255, 255)
      );

      $writer = new PngWriter();
      $result = $writer->write($qrCode);

      return $result->getString();
    } catch (\Exception $e) {
      Log::error('[QRCodeService] PNG generation failed: ' . $e->getMessage());
      throw new \RuntimeException('Failed to generate QR Code: ' . $e->getMessage());
    }
  }

  /**
   * Generate QR Code as SVG string
   */
  public function generateSVG(string $data, ?string $label = null, int $size = 300): string
  {
    try {
      $qrCode = new QrCode(
        $data,
        new Encoding('UTF-8'),
        ErrorCorrectionLevel::High,
        $size,
        10,
        RoundBlockSizeMode::Margin,
        new Color(0, 0, 0),
        new Color(255, 255, 255)
      );

      $writer = new \Endroid\QrCode\Writer\SvgWriter();
      $result = $writer->write($qrCode);

      return $result->getString();
    } catch (\Exception $e) {
      Log::error('[QRCodeService] SVG generation failed: ' . $e->getMessage());
      throw new \RuntimeException('Failed to generate QR Code: ' . $e->getMessage());
    }
  }

  /**
   * Generate QR Code and save to storage
   */
  public function generateAndSave(string $data, string $path, ?string $label = null, int $size = 300): string
  {
    try {
      $qrPath = $this->generateQrCode($data);

      if (!$qrPath) {
        throw new \RuntimeException('Failed to generate QR Code');
      }

      // Copy to the desired location
      $fullPath = storage_path('app/public/' . $path);
      $directory = dirname($fullPath);
      if (!is_dir($directory)) {
        mkdir($directory, 0777, true);
      }

      copy($qrPath, $fullPath);

      // Clean up temp file
      @unlink($qrPath);

      Log::info('[QRCodeService] QR Code saved to: ' . $path);
      return Storage::url($path);
    } catch (\Exception $e) {
      Log::error('[QRCodeService] Save failed: ' . $e->getMessage());
      throw new \RuntimeException('Failed to save QR Code: ' . $e->getMessage());
    }
  }

  /**
   * Generate QR Code and save to temporary file
   */
  public function generateToTempFile(string $data, ?string $label = null, int $size = 300): string
  {
    return $this->generateQrCode($data);
  }

  /**
   * Generate QR Code data for signature verification
   */
  public function generateSignatureQRData(array $data): string
  {
    $frontendUrl = config('app.frontend_url') ?? env('FRONTEND_URL', 'https://sspmis.pasbestventures.com');

    $qrData = [
      'verification_id' => $data['verification_id'] ?? null,
      'signature_id' => $data['signature_id'] ?? null,
      'user_id' => $data['user_id'] ?? null,
      'user_name' => $data['user_name'] ?? null,
      'user_role' => $data['user_role'] ?? null,
      'role_label' => $data['role_label'] ?? null,
      'document_type' => $data['document_type'] ?? null,
      'document_reference' => $data['document_reference'] ?? null,
      'verification_status' => $data['verification_status'] ?? null,
      'verified_at' => $data['verified_at'] ?? null,
      'verified_by' => $data['verified_by'] ?? null,
      'timestamp' => $data['timestamp'] ?? time(),
      'hash' => $this->generateHash($data),
    ];

    return json_encode($qrData);
  }

  /**
   * Generate QR Code with verification URL (UPDATED for clean token flow)
   */
  public function generateQRWithVerificationUrl(string $url): ?string
  {
    try {
      // Since SignatureService now passes a clean, short token URL,
      // we pass $url directly to the generator. No array encoding needed!
      return $this->generateQrCode($url);
    } catch (\Exception $e) {
      Log::error('[QRCodeService] generateQRWithVerificationUrl failed: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Generate QR Code and return as base64
   */
  public function getBase64(string $data, ?string $label = null, int $size = 300): string
  {
    $qrPath = $this->generateQrCode($data);

    if (!$qrPath) {
      throw new \RuntimeException('Failed to generate QR Code');
    }

    $qrData = file_get_contents($qrPath);
    $base64 = 'data:image/png;base64,' . base64_encode($qrData);

    // Clean up
    @unlink($qrPath);

    return $base64;
  }

  /**
   * Generate QR Code as base64 from array data (for signature verification)
   */
  public function getSignatureQRBase64(array $data, ?string $label = null, int $size = 300): string
  {
    $qrData = $this->generateSignatureQRData($data);
    return $this->getBase64($qrData, $label, $size);
  }

  /**
   * Generate QR Code with metadata (returns both file path and base64)
   */
  public function generateQRWithMetadata(array $data, ?string $label = null, int $size = 300): array
  {
    $qrData = $this->generateSignatureQRData($data);

    // Generate QR Code file
    $filePath = $this->generateQrCode($qrData);

    if (!$filePath) {
      throw new \RuntimeException('Failed to generate QR Code');
    }

    $qrImageData = file_get_contents($filePath);
    $base64 = 'data:image/png;base64,' . base64_encode($qrImageData);

    // Get file info
    $fileSize = filesize($filePath);

    return [
      'data' => $qrData,
      'file_path' => $filePath,
      'base64' => $base64,
      'hash' => hash('sha256', $qrData),
      'size' => $size,
      'file_size' => $fileSize,
      'label' => $label,
      'generated_at' => now()->toISOString(),
    ];
  }

  /**
   * Generate hash for QR code data
   */
  protected function generateHash(array $data): string
  {
    $string = ($data['user_id'] ?? '') .
      ($data['signature_id'] ?? '') .
      ($data['timestamp'] ?? time()) .
      ($data['verification_id'] ?? '');
    return hash('sha256', $string);
  }

  /**
   * Verify QR code data
   */
  public function verifyQRData(string $qrData): ?array
  {
    try {
      // Try to parse as JSON first (our format)
      $data = json_decode($qrData, true);

      if ($data && is_array($data)) {
        // Verify hash
        $expectedHash = $this->generateHash($data);
        if (!isset($data['hash']) || $data['hash'] === $expectedHash) {
          return $data;
        }
      }

      // If not JSON or invalid, try to extract from URL
      if (str_starts_with($qrData, 'http')) {
        parse_str(parse_url($qrData, PHP_URL_QUERY) ?? '', $params);
        if (isset($params['data'])) {
          $decoded = json_decode(urldecode($params['data']), true);
          if ($decoded && is_array($decoded)) {
            return $decoded;
          }
        }
      }

      return null;
    } catch (\Exception $e) {
      Log::error('[QRCodeService] QR verification failed: ' . $e->getMessage());
      return null;
    }
  }

  /**
   * Clean up temporary QR Code files
   */
  public function cleanupTempFiles(string $filePath): void
  {
    if ($filePath && file_exists($filePath) && str_contains($filePath, 'temp/qr_codes')) {
      @unlink($filePath);
      Log::info('[QRCodeService] Cleaned up temp file: ' . $filePath);
    }
  }

  /**
   * Get QR Code as base64 from file path
   */
  public function getBase64FromFile(string $filePath): ?string
  {
    if (!file_exists($filePath)) {
      return null;
    }

    $data = file_get_contents($filePath);
    return 'data:image/png;base64,' . base64_encode($data);
  }
}
