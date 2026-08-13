<?php
// app/Services/Procurement/PDF/BasePdfRenderer.php

declare(strict_types=1);

namespace App\Services\Procurement\PDF;

use TCPDF;
use App\Models\CompanyProfile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

abstract class BasePdfRenderer
{
  protected array $primary = [26, 35, 126];
  protected array $secondary = [63, 81, 181];
  protected array $gold = [255, 193, 7];
  protected array $success = [27, 94, 32];
  protected array $warning = [230, 126, 34];
  protected array $lightBg = [248, 249, 250];
  protected array $border = [200, 200, 200];
  protected array $textDark = [33, 33, 33];
  protected array $textLight = [117, 117, 117];
  protected array $white = [255, 255, 255];

  protected ?CompanyProfile $companyProfile = null;
  protected ?string $logoData = null;
  protected ?string $optimizedLogoPath = null;
  protected ?int $logoWidth = null;
  protected ?int $logoHeight = null;
  protected ?string $logoPathFound = null;
  protected ?string $watermarkText = null;

  protected array $config;

  public function __construct()
  {
    $this->config = [
      'paper_size' => 'A4',
      'orientation' => 'P',
      'font' => 'helvetica',
      'font_size' => 10,
      'margin_left' => 15,
      'margin_right' => 15,
      'margin_top' => 10,
      'margin_bottom' => 15,
      'logo_max_width' => 80,
      'logo_max_height' => 80,
      'watermark_opacity' => 0.06,
      'qr_size' => 20,
    ];
  }

  protected function initPdf(string $title): TCPDF
  {
    $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator('SSPMS');
    $pdf->SetAuthor('SSPMS');
    $pdf->SetTitle($title);
    $pdf->SetSubject('Request For Quotation');
    $pdf->SetKeywords('RFQ, Quotation, Request, Procurement');

    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(15, 10, 15);
    $pdf->SetHeaderMargin(3);
    $pdf->SetFooterMargin(10);
    $pdf->SetAutoPageBreak(true, 15);
    $pdf->AddPage();

    return $pdf;
  }

  protected function setWatermarkText(string $text): void
  {
    $this->watermarkText = $text;
  }

  protected function addLogoWatermark(TCPDF $pdf): void
  {
    if (!$this->logoData) {
      return;
    }

    try {
      $tempFile = tempnam(sys_get_temp_dir(), 'logo_');
      if ($tempFile === false) return;

      file_put_contents($tempFile, $this->logoData);

      $watermarkWidth = 160;
      $watermarkHeight = 160;

      if ($this->logoWidth && $this->logoHeight) {
        $ratio = $this->logoWidth / $this->logoHeight;
        $watermarkHeight = $watermarkWidth / $ratio;
        if ($watermarkHeight > 160) {
          $watermarkHeight = 160;
          $watermarkWidth = $watermarkHeight * $ratio;
        }
      }

      $x = (210 - $watermarkWidth) / 2;
      $y = (297 - $watermarkHeight) / 2;

      $pdf->SetAlpha($this->config['watermark_opacity']);
      $pdf->Image(
        $tempFile,
        $x,
        $y,
        $watermarkWidth,
        $watermarkHeight,
        '',
        '',
        '',
        false,
        300,
        '',
        false,
        false,
        0
      );
      $pdf->SetAlpha(1);

      @unlink($tempFile);
    } catch (\Exception $e) {
      // Silent fail
    }
  }

  protected function addWatermarkText(TCPDF $pdf, string $text): void
  {
    try {
      $pdf->SetAlpha(0.10);
      $pdf->SetFont('helvetica', 'B', 40);
      $pdf->SetTextColor(150, 150, 150);

      $pdf->StartTransform();
      $pdf->Rotate(30, 105, 150);

      $pdf->SetXY(30, 130);
      $pdf->Cell(150, 20, strtoupper($text), 0, 1, 'C');

      $pdf->StopTransform();
      $pdf->SetAlpha(1);
    } catch (\Exception $e) {
      // Silent fail
    }
  }

  protected function loadCompanyProfile(): void
  {
    try {
      $this->companyProfile = CompanyProfile::first();
      if ($this->companyProfile) {
        Log::info('[PDF] Company profile loaded', [
          'name' => $this->companyProfile->company_name,
          'logo_url' => $this->companyProfile->logo_url ?? $this->companyProfile->company_logo ?? 'not set'
        ]);
      }
    } catch (\Exception $e) {
      Log::error('[PDF] Error loading company profile: ' . $e->getMessage());
    }
  }

  protected function applyCompanyColors(): void
  {
    if (!$this->companyProfile) return;

    if ($this->companyProfile->primary_color) {
      $rgb = $this->hexToRgb($this->companyProfile->primary_color);
      if ($rgb) $this->primary = $rgb;
    }

    if ($this->companyProfile->secondary_color) {
      $rgb = $this->hexToRgb($this->companyProfile->secondary_color);
      if ($rgb) $this->secondary = $rgb;
    }

    if ($this->companyProfile->accent_color) {
      $rgb = $this->hexToRgb($this->companyProfile->accent_color);
      if ($rgb) $this->gold = $rgb;
    }
  }

  protected function hexToRgb(string $hex): ?array
  {
    $hex = ltrim($hex, '#');
    if (strlen($hex) === 3) {
      $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    }
    if (strlen($hex) === 6) {
      return [
        hexdec(substr($hex, 0, 2)),
        hexdec(substr($hex, 2, 2)),
        hexdec(substr($hex, 4, 2))
      ];
    }
    return null;
  }

  protected function loadAndOptimizeLogo(): void
  {
    if (!$this->companyProfile) {
      Log::warning('[PDF] No company profile, cannot load logo');
      return;
    }

    $logoUrl = $this->companyProfile->logo_url ?? $this->companyProfile->company_logo ?? null;
    if (!$logoUrl) {
      Log::warning('[PDF] No logo URL found');
      return;
    }

    $filename = basename($logoUrl);
    Log::info('[PDF] Looking for logo file: ' . $filename);

    $logoPath = $this->findLogoFile($filename, $logoUrl);

    if (!$logoPath || !file_exists($logoPath)) {
      Log::warning('[PDF] Logo file not found: ' . $filename);
      return;
    }

    Log::info('[PDF] Loading logo from: ' . $logoPath);
    $this->logoPathFound = $logoPath;

    $this->optimizedLogoPath = $this->optimizeImage($logoPath);

    if ($this->optimizedLogoPath) {
      $this->logoData = file_get_contents($this->optimizedLogoPath);
      $info = getimagesize($this->optimizedLogoPath);
      if ($info) {
        $this->logoWidth = $info[0];
        $this->logoHeight = $info[1];
      }
      Log::info('[PDF] Logo optimized and loaded');
    } else {
      $this->logoData = file_get_contents($logoPath);
      $info = getimagesize($logoPath);
      if ($info) {
        $this->logoWidth = $info[0];
        $this->logoHeight = $info[1];
      }
      Log::info('[PDF] Logo loaded from original');
    }
  }

  protected function findLogoFile(string $filename, string $logoUrl): ?string
  {
    $paths = $this->getAllPossibleLogoPaths($filename, $logoUrl);

    foreach ($paths as $path) {
      if ($path && file_exists($path)) {
        Log::info('[PDF] ✅ Logo found at: ' . $path);
        $this->logoPathFound = $path;
        return $path;
      }
    }

    return null;
  }

  protected function getAllPossibleLogoPaths(string $filename, string $logoUrl): array
  {
    $paths = [];

    if (str_starts_with($logoUrl, '/')) {
      $paths[] = public_path($logoUrl);
      $paths[] = storage_path($logoUrl);
    }

    $paths[] = storage_path('app/public/' . $logoUrl);
    $paths[] = storage_path('app/public/uploads/company-logos/' . $filename);
    $paths[] = storage_path('app/public/company-logos/' . $filename);
    $paths[] = storage_path('app/company-logos/' . $filename);
    $paths[] = storage_path('app/uploads/company-logos/' . $filename);

    $paths[] = public_path('storage/' . $logoUrl);
    $paths[] = public_path('storage/uploads/company-logos/' . $filename);
    $paths[] = public_path('storage/company-logos/' . $filename);
    $paths[] = public_path('uploads/company-logos/' . $filename);
    $paths[] = public_path('company-logos/' . $filename);

    $date = now();
    $paths[] = storage_path('app/public/uploads/company-logos/' . $date->format('Y') . '/' . $date->format('m') . '/' . $date->format('d') . '/' . $filename);
    $paths[] = storage_path('app/public/uploads/company-logos/' . $date->format('Y') . '/' . $date->format('m') . '/' . $filename);
    $paths[] = storage_path('app/public/uploads/company-logos/' . $date->format('Y') . '/' . $filename);

    $searchDirs = [
      storage_path('app/public'),
      storage_path('app'),
      public_path('storage'),
      public_path(),
      storage_path('app/public/uploads'),
      storage_path('app/public/company-logos'),
    ];

    foreach ($searchDirs as $dir) {
      if (is_dir($dir)) {
        $paths[] = $dir . '/' . $filename;
      }
    }

    try {
      if (Storage::disk('public')->exists($logoUrl)) {
        $paths[] = Storage::disk('public')->path($logoUrl);
      }
      if (Storage::disk('public')->exists('uploads/company-logos/' . $filename)) {
        $paths[] = Storage::disk('public')->path('uploads/company-logos/' . $filename);
      }
      if (Storage::disk('public')->exists('company-logos/' . $filename)) {
        $paths[] = Storage::disk('public')->path('company-logos/' . $filename);
      }
    } catch (\Exception $e) {
      Log::warning('[PDF] Storage facade error: ' . $e->getMessage());
    }

    $recursiveDirs = [
      storage_path('app/public'),
      public_path('storage'),
    ];

    foreach ($recursiveDirs as $dir) {
      if (is_dir($dir)) {
        try {
          $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS)
          );

          foreach ($iterator as $file) {
            if ($file->getFilename() === $filename) {
              $paths[] = $file->getPathname();
            }
          }
        } catch (\Exception $e) {
          Log::warning('[PDF] Recursive search error in ' . $dir);
        }
      }
    }

    return array_unique(array_filter($paths));
  }

  protected function optimizeImage(string $path): ?string
  {
    try {
      if (!extension_loaded('gd')) {
        return null;
      }

      $imageInfo = getimagesize($path);
      if (!$imageInfo) return null;

      $width = $imageInfo[0];
      $height = $imageInfo[1];
      $mime = $imageInfo['mime'];

      if ($width <= 800 && $height <= 800 && filesize($path) < 500000) {
        return $path;
      }

      $maxDimension = 800;
      $ratio = min($maxDimension / $width, $maxDimension / $height);
      $newWidth = (int)($width * $ratio);
      $newHeight = (int)($height * $ratio);

      $image = null;
      switch ($mime) {
        case 'image/png':
          $image = imagecreatefrompng($path);
          break;
        case 'image/jpeg':
        case 'image/jpg':
          $image = imagecreatefromjpeg($path);
          break;
        case 'image/webp':
          $image = imagecreatefromwebp($path);
          break;
        case 'image/gif':
          $image = imagecreatefromgif($path);
          break;
        default:
          return null;
      }

      if (!$image) return null;

      $resized = imagecreatetruecolor($newWidth, $newHeight);

      if ($mime === 'image/png' || $mime === 'image/webp') {
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
        imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);
      }

      imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
      imagedestroy($image);

      $tempPath = tempnam(sys_get_temp_dir(), 'logo_opt_') . '.png';
      imagepng($resized, $tempPath, 6);
      imagedestroy($resized);

      return $tempPath;
    } catch (\Exception $e) {
      return null;
    }
  }

  protected function addHeaderLine(TCPDF $pdf, float $yPosition): void
  {
    $pdf->SetY($yPosition);
    $pdf->SetDrawColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetLineWidth(1.2);
    $pdf->Line(15, $yPosition, 195, $yPosition);
    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $yPosition + 1.8, 195, $yPosition + 1.8);
  }

  protected function addSectionHeader(TCPDF $pdf, string $title): void
  {
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 8, $title, 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 1, 195, $pdf->GetY() + 1);
    $pdf->SetY($pdf->GetY() + 8);
  }

  protected function addFieldPair(
    TCPDF $pdf,
    string $label,
    string $value,
    float $x,
    float $labelWidth = 35,
    float $valueWidth = 55,
    bool $newLine = true
  ): void {
    $currentY = $pdf->GetY();

    $pdf->SetX($x);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
    $pdf->Cell($labelWidth, 7.5, $label . ':', 0, 0);

    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
    $pdf->Cell($valueWidth, 7.5, $value ?: 'N/A', 0, $newLine ? 1 : 0);

    if (!$newLine) {
      $pdf->SetY($currentY);
    }
  }

  protected function formatDate($date, string $format = 'd M Y'): string
  {
    if (!$date) return 'N/A';
    try {
      if ($date instanceof \DateTime) {
        return $date->format($format);
      }
      return date($format, strtotime($date));
    } catch (\Exception $e) {
      return 'N/A';
    }
  }

  protected function cleanupTempFiles(): void
  {
    if (
      $this->optimizedLogoPath &&
      file_exists($this->optimizedLogoPath) &&
      $this->optimizedLogoPath !== $this->logoPathFound
    ) {
      @unlink($this->optimizedLogoPath);
    }
  }

  protected function getCompanyName(): string
  {
    return $this->companyProfile->company_name ?? config('app.name', 'SSPMS');
  }

  protected function getCompanyAddress(): string
  {
    return $this->companyProfile->company_address ?? '22 - 90200 Kitui';
  }

  protected function getCompanyPhone(): string
  {
    return $this->companyProfile->company_phone ?? '+254709221557';
  }

  protected function getCompanyEmail(): string
  {
    return $this->companyProfile->company_email ?? 'info@pasbestventures.com';
  }
}
