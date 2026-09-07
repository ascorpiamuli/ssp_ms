<?php
// app/Services/Procurement/PDF/SanPdfRenderer.php

declare(strict_types=1);

namespace App\Services\Procurement\PDF;

use setasign\Fpdi\Tcpdf\Fpdi;
use App\Models\ServiceAcknowledgmentNote;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use Illuminate\Support\Facades\Log;

class SanPdfRenderer extends BasePdfRenderer
{
  private QRCodeServiceInterface $qrCodeService;
  private bool $confidentialLabelRendered = false;
  private int $downloadCount = 0;
  private ?ServiceAcknowledgmentNote $san = null;
  private float $subtotal = 0;
  private bool $pageBreakAdded = false;
  private int $currentPage = 1;

  // Yellow/Gold color scheme
  private array $yellowPrimary = [184, 134, 11];
  private array $yellowSecondary = [218, 165, 32];
  private array $yellowGold = [212, 175, 55];

  // Yellow background color
  private array $yellowBackground = [255, 248, 220];

  public function __construct(QRCodeServiceInterface $qrCodeService)
  {
    parent::__construct();
    $this->qrCodeService = $qrCodeService;

    // Override colors with yellow scheme
    $this->primary = $this->yellowPrimary;
    $this->secondary = $this->yellowSecondary;
    $this->gold = $this->yellowGold;
  }

  /**
   * ✅ Override initPdf to add yellow background
   */
  protected function initPdf(string $title): Fpdi
  {
    $pdf = new Fpdi('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator('SSPMS');
    $pdf->SetAuthor('SSPMS');
    $pdf->SetTitle($title);
    $pdf->SetSubject('Service Acknowledgment Note');
    $pdf->SetKeywords('SAN, Service Acknowledgment, Procurement');

    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(15, 10, 15);
    $pdf->SetHeaderMargin(3);
    $pdf->SetFooterMargin(10);
    $pdf->SetAutoPageBreak(true, 15);

    $pdf->AddPage();
    $this->setPageBackground($pdf);
    $this->currentPage = $pdf->getPage();

    return $pdf;
  }

  /**
   * ✅ Set page background color to yellow
   */
  private function setPageBackground(Fpdi $pdf): void
  {
    $pdf->SetFillColor(
      $this->yellowBackground[0],
      $this->yellowBackground[1],
      $this->yellowBackground[2]
    );
    $pdf->Rect(0, 0, 210, 297, 'F');
  }

  public function renderWithData(ServiceAcknowledgmentNote $san): string
  {
    Log::info('=== SERVICE ACKNOWLEDGMENT NOTE PDF GENERATION START ===');
    Log::info('[PDF] SAN ID: ' . $san->id);
    Log::info('[PDF] SAN Number: ' . $san->san_number);
    Log::info('[PDF] PO Number: ' . ($san->purchaseOrder?->po_number ?? 'N/A'));
    Log::info('[PDF] Status: ' . $san->status);

    // ✅ Get services from Purchase Order items
    $po = $san->purchaseOrder;
    $items = $po ? $po->items : collect();
    Log::info('[PDF] Services Count: ' . $items->count());

    $this->san = $san;
    $this->downloadCount = $san->download_count ?? 0;

    $this->loadCompanyProfile();
    $this->applyCompanyColors();
    $this->loadAndOptimizeLogo();

    $pdf = $this->initPdf($san->san_number);
    $this->addLogoWatermark($pdf);

    // ============================================
    // PAGE 1: Header + All Info Sections
    // ============================================
    $this->renderConfidentialLabel($pdf);
    $this->renderHeader($pdf, $san);
    $this->renderSanDetails($pdf, $san);
    $this->renderServiceDescription($pdf, $san);
    $this->renderServiceDeliverables($pdf, $san);

    // ============================================
    // Service Items (try to fit on page 1 if possible)
    // ============================================
    $hasItems = $items && $items->count() > 0;

    if ($hasItems) {
      $currentY = $pdf->GetY();

      // Check if we're on page 1
      if ($pdf->getPage() == 1) {
        // Calculate if items will fit on page 1
        $itemsHeight = ($items->count() * 7) + 45; // Approximate height needed (increased for larger font)
        $remainingSpace = 275 - $currentY; // Remaining space on page 1

        // Only add to page 1 if they fit completely
        if ($itemsHeight < $remainingSpace && $currentY < 230) {
          // Items fit on page 1, render them here
          $this->renderServicesTable($pdf, $items, $san);
          $this->renderTotals($pdf, $san);
        } else {
          // Items don't fit, add a new page
          $pdf->AddPage();
          $this->setPageBackground($pdf);
          $this->addLogoWatermark($pdf);
          $pdf->SetY(20);
          $this->pageBreakAdded = true;
          $this->currentPage = $pdf->getPage();

          $this->renderServicesTable($pdf, $items, $san);
          $this->renderTotals($pdf, $san);
        }
      } else {
        // We're already on a later page, just render items
        $this->renderServicesTable($pdf, $items, $san);
        $this->renderTotals($pdf, $san);
      }
    }

    // ============================================
    // PAGE 2+: Terms on a new page
    // ============================================
    $pdf->AddPage();
    $this->setPageBackground($pdf);
    $this->addLogoWatermark($pdf);
    $pdf->SetY(20);
    $this->currentPage = $pdf->getPage();

    $this->renderTerms($pdf, $san);
    $this->renderFooterNote($pdf, $san);

    // ============================================
    // APPEND PURCHASE ORDER PDF - STARTS ON A CLEAN NEW PAGE
    // ============================================
    $this->appendPurchaseOrderPDF($pdf, $san);

    $this->cleanupTempFiles();

    Log::info('=== SERVICE ACKNOWLEDGMENT NOTE PDF GENERATION COMPLETE ===');

    return $pdf->Output('', 'S');
  }

  /**
   * Render Confidential Label - Top Right, First Page Only
   */
  protected function renderConfidentialLabel(Fpdi $pdf): void
  {
    if ($this->confidentialLabelRendered) {
      return;
    }

    $y = 2;
    $x = 145;

    $pdf->SetY($y);
    $pdf->SetX($x);

    $pdf->SetFillColor(180, 30, 30);
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 10); // Increased from 9

    $label = 'CONFIDENTIAL';
    $width = 50;

    $pdf->RoundedRect($x, $y, $width, 7, 2, '1111', 'F'); // Increased height from 6 to 7

    $pdf->SetXY($x + 2, $y + 1.5);
    $pdf->Cell($width - 4, 4, $label, 0, 1, 'C');

    $pdf->SetTextColor(0, 0, 0);

    $this->confidentialLabelRendered = true;
  }

  protected function generateQrCode(string $data): ?string
  {
    return $this->qrCodeService->generateQrCode($data);
  }

  /**
   * Render Header
   */
  protected function renderHeader(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    $pdf->SetY(15);

    // QR CODE
    $this->renderQrCode($pdf, $san);

    // LOGO
    $this->renderLogo($pdf);

    // COMPANY INFO
    $this->renderCompanyInfo($pdf);

    $this->addHeaderLine($pdf, 48);

    $pdf->SetY(55);
    $pdf->SetFont('helvetica', 'B', 22); // Increased from 20
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 10, 'SERVICE ACKNOWLEDGMENT NOTE', 0, 1, 'C'); // Increased height from 9 to 10

    $pdf->SetY(65);
    $pdf->SetFont('helvetica', 'B', 18); // Increased from 16
    $pdf->SetTextColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->Cell(0, 10, $san->san_number, 0, 1, 'C'); // Increased height from 9 to 10

    $pdf->SetY(78);
  }

  /**
   * Render QR Code for SAN
   */
  protected function renderQrCode(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    $frontendUrl = config('app.frontend_url') ?? env('FRONTEND_URL', 'https://sspmis.pasbestventures.com');
    $qrData = $frontendUrl . '/service-acknowledge/' . $san->id . '/view';
    $qrData = "SAN: " . $san->san_number . " | " . $qrData;

    $qrPath = $this->generateQrCode($qrData);
    if ($qrPath && file_exists($qrPath)) {
      $pdf->Image($qrPath, 95, 12, 22, 22); // Slightly larger QR
      $this->qrCodeService->cleanupTempFiles($qrPath);
      Log::info('[PDF] QR Code added to PDF');
    }
  }

  /**
   * Render Logo
   */
  protected function renderLogo(Fpdi $pdf): void
  {
    if (!$this->logoData) {
      Log::warning('[PDF] No logo data available');
      return;
    }

    try {
      $tempFile = tempnam(sys_get_temp_dir(), 'logo_');
      if ($tempFile === false) return;

      file_put_contents($tempFile, $this->logoData);

      $logoDisplayWidth = 80;
      $logoDisplayHeight = 80;

      if ($this->logoWidth && $this->logoHeight) {
        $ratio = $this->logoWidth / $this->logoHeight;
        $logoDisplayHeight = $logoDisplayWidth / $ratio;
        if ($logoDisplayHeight > 80) {
          $logoDisplayHeight = 80;
          $logoDisplayWidth = $logoDisplayHeight * $ratio;
        }
        if ($logoDisplayWidth > 80) {
          $logoDisplayWidth = 80;
          $logoDisplayHeight = $logoDisplayWidth / $ratio;
        }
      }

      $pdf->Image($tempFile, 15, 5, $logoDisplayWidth, $logoDisplayHeight);
      @unlink($tempFile);
    } catch (\Exception $e) {
      Log::warning('[PDF] Failed to display logo: ' . $e->getMessage());
    }
  }

  /**
   * Render Company Info
   */
  protected function renderCompanyInfo(Fpdi $pdf): void
  {
    $rightX = 210 - 15 - 80;

    $pdf->SetFont('helvetica', 'B', 15); // Increased from 14
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetXY($rightX, 8);
    $pdf->Cell(80, 8, $this->getCompanyName(), 0, 1, 'R');

    $pdf->SetFont('helvetica', '', 11); // Increased from 10
    $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
    $pdf->SetX($rightX);
    $pdf->Cell(80, 6, $this->getCompanyAddress(), 0, 1, 'R');

    $pdf->SetX($rightX);
    $pdf->Cell(80, 6, 'Tel: ' . $this->getCompanyPhone(), 0, 1, 'R');

    $pdf->SetX($rightX);
    $pdf->Cell(80, 6, 'Email: ' . $this->getCompanyEmail(), 0, 1, 'R');
  }

  /**
   * Add Header Line - Yellow/Gold
   */
  protected function addHeaderLine(Fpdi $pdf, float $y): void
  {
    $pdf->SetY($y);
    $pdf->SetDrawColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetLineWidth(1.2);
    $pdf->Line(15, $y, 195, $y);
    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $y + 2.5, 195, $y + 2.5);
  }

  /**
   * Render SAN Details - Combined with Quality & Performance
   */
  protected function renderSanDetails(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13); // Increased from 12
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'SERVICE ACKNOWLEDGMENT DETAILS', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 9);
    $pdf->SetFont('helvetica', '', 11); // Increased from 10
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    // Get supplier name
    $supplierName = $san->purchaseOrder?->supplier?->company_name ?? $san->service_provider ?? 'N/A';

    $fields = [
      ['SAN Number:', $san->san_number],
      ['Status:', $san->status_label],
      ['Service Provider:', $supplierName],
      ['Acknowledgment Date:', $this->formatDate($san->acknowledgment_date)],
      ['Service Start Date:', $this->formatDate($san->service_start_date)],
      ['Service End Date:', $this->formatDate($san->service_end_date)],
      ['Quality Rating:', $san->quality_rating_label ?? 'Not Rated'],
      ['Reference Number:', $san->reference_number ?? 'N/A'],
    ];

    $x = 15;
    $colWidth = 90;
    $rowHeight = 6.5; // Increased from 5.5

    for ($i = 0; $i < count($fields); $i += 2) {
      $pdf->SetX($x);
      $pdf->SetFont('helvetica', 'B', 11); // Increased from 10
      $pdf->Cell(50, $rowHeight, $fields[$i][0], 0, 0);
      $pdf->SetFont('helvetica', '', 11); // Increased from 10
      $pdf->Cell(40, $rowHeight, $fields[$i][1], 0, 0);

      if (isset($fields[$i + 1])) {
        $pdf->SetX($x + $colWidth + 5);
        $pdf->SetFont('helvetica', 'B', 11); // Increased from 10
        $pdf->Cell(50, $rowHeight, $fields[$i + 1][0], 0, 0);
        $pdf->SetFont('helvetica', '', 11); // Increased from 10
        $pdf->Cell(40, $rowHeight, $fields[$i + 1][1], 0, 1);
      } else {
        $pdf->Ln($rowHeight);
      }
    }

    // Quality Notes
    if ($san->quality_notes) {
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 11); // Increased from 10
      $pdf->Cell(50, 6, 'Quality Notes:', 0, 0);
      $pdf->SetFont('helvetica', '', 11); // Increased from 10
      $pdf->MultiCell(130, 6, $san->quality_notes, 0, 'L');
    }

    // Performance Notes
    if ($san->performance_notes) {
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 11); // Increased from 10
      $pdf->Cell(50, 6, 'Performance Notes:', 0, 0);
      $pdf->SetFont('helvetica', '', 11); // Increased from 10
      $pdf->MultiCell(130, 6, $san->performance_notes, 0, 'L');
    }

    // Additional Notes
    if ($san->additional_notes) {
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 11); // Increased from 10
      $pdf->Cell(50, 6, 'Additional Notes:', 0, 0);
      $pdf->SetFont('helvetica', '', 11); // Increased from 10
      $pdf->MultiCell(130, 6, $san->additional_notes, 0, 'L');
    }

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render Service Description Section
   */
  protected function renderServiceDescription(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    if (!$san->service_description) {
      return;
    }

    $y = $pdf->GetY();

    // Only add new page if we're near the bottom and still on page 1
    if ($y > 240 && $pdf->getPage() == 1) {
      $pdf->AddPage();
      $this->setPageBackground($pdf);
      $this->addLogoWatermark($pdf);
      $pdf->SetY(25);
      $this->pageBreakAdded = true;
      $this->currentPage = $pdf->getPage();
    }

    $pdf->SetY($pdf->GetY());
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13); // Increased from 12
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'SERVICE DESCRIPTION', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 9);
    $pdf->SetX(18);
    $pdf->SetFont('helvetica', '', 11); // Increased from 10
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    // MultiCell handles pagination automatically
    $pdf->MultiCell(175, 6, $san->service_description, 0, 'L');

    // Ensure we have some space after the description
    $pdf->Ln(4);

    // Add divider after description
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render Service Deliverables Section
   */
  protected function renderServiceDeliverables(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    if (!$san->service_deliverables) {
      return;
    }

    $y = $pdf->GetY();

    // Only add new page if we're near the bottom and still on page 1
    if ($y > 240 && $pdf->getPage() == 1) {
      $pdf->AddPage();
      $this->setPageBackground($pdf);
      $this->addLogoWatermark($pdf);
      $pdf->SetY(25);
      $this->pageBreakAdded = true;
      $this->currentPage = $pdf->getPage();
    }

    $pdf->SetY($pdf->GetY());
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13); // Increased from 12
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'SERVICE DELIVERABLES', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 9);
    $pdf->SetX(18);
    $pdf->SetFont('helvetica', '', 11); // Increased from 10
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    // MultiCell handles pagination automatically
    $pdf->MultiCell(175, 6, $san->service_deliverables, 0, 'L');

    // Ensure we have some space after the deliverables
    $pdf->Ln(4);

    // Add divider after deliverables
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render Services Table - Using Purchase Order Items with flexible description
   */
  protected function renderServicesTable(Fpdi $pdf, $items, ServiceAcknowledgmentNote $san): int
  {
    if (empty($items) || $items->count() === 0) {
      Log::warning('[PDF] No service items found for SAN: ' . $san->id);
      return 0;
    }

    $pageCount = 1;
    $y = $pdf->GetY();

    // If we're on page 1 and near the bottom, add a new page
    if ($pdf->getPage() == 1 && $y > 210) {
      $pdf->AddPage();
      $this->setPageBackground($pdf);
      $this->addLogoWatermark($pdf);
      $pdf->SetY(25);
      $pageCount++;
      $this->pageBreakAdded = true;
      $this->currentPage = $pdf->getPage();
    }

    $pdf->SetY($pdf->GetY());
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13); // Increased from 12
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'SERVICE ITEMS', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 7);
    $pdf->SetX(15);

    // Table Header - Yellow/Gold
    $pdf->SetFont('helvetica', 'B', 11); // Increased from 10
    $pdf->SetFillColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetTextColor(255, 255, 255);

    $pdf->Cell(8, 8, '#', 1, 0, 'C', 1);
    $pdf->Cell(50, 8, 'Service Name', 1, 0, 'L', 1);
    $pdf->Cell(40, 8, 'Description', 1, 0, 'L', 1);
    $pdf->Cell(15, 8, 'UOM', 1, 0, 'C', 1);
    $pdf->Cell(15, 8, 'Qty', 1, 0, 'C', 1);
    $pdf->Cell(25, 8, 'Unit Price', 1, 0, 'R', 1);
    $pdf->Cell(25, 8, 'Total', 1, 1, 'R', 1);

    // Table Body - with alternating yellow-tinted rows
    $pdf->SetFont('helvetica', '', 11); // Increased from 10
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
    $fill = false;
    $counter = 1;
    $subtotal = 0;

    foreach ($items as $item) {
      if ($pdf->GetY() > 240) {
        $pdf->AddPage();
        $this->setPageBackground($pdf);
        $this->addLogoWatermark($pdf);
        $pdf->SetY(25);
        $pageCount++;

        $pdf->SetFont('helvetica', 'B', 13); // Increased from 12
        $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
        $pdf->Cell(180, 8, 'SERVICE ITEMS (Continued)', 0, 1, 'L');

        $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
        $pdf->SetLineWidth(0.8);
        $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

        $pdf->SetY($pdf->GetY() + 7);
        $pdf->SetX(15);

        $pdf->SetFont('helvetica', 'B', 11); // Increased from 10
        $pdf->SetFillColor($this->primary[0], $this->primary[1], $this->primary[2]);
        $pdf->SetTextColor(255, 255, 255);

        $pdf->Cell(8, 8, '#', 1, 0, 'C', 1);
        $pdf->Cell(50, 8, 'Service Name', 1, 0, 'L', 1);
        $pdf->Cell(40, 8, 'Description', 1, 0, 'L', 1);
        $pdf->Cell(15, 8, 'UOM', 1, 0, 'C', 1);
        $pdf->Cell(15, 8, 'Qty', 1, 0, 'C', 1);
        $pdf->Cell(25, 8, 'Unit Price', 1, 0, 'R', 1);
        $pdf->Cell(25, 8, 'Total', 1, 1, 'R', 1);
        $pdf->SetFont('helvetica', '', 11); // Increased from 10
        $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
      }

      $pdf->SetX(15);

      // Alternating row colors - yellow tinted
      if ($fill) {
        $pdf->SetFillColor(255, 248, 210); // Light yellow tint
      } else {
        $pdf->SetFillColor(255, 252, 235); // Very light yellow
      }

      $itemTotal = (float)($item->quantity ?? 0) * (float)($item->unit_price ?? 0);
      $subtotal += $itemTotal;
      $quantity = (float)($item->quantity ?? 0);

      // ✅ Flexible description - Check if description is too long
      $description = $item->description ?? '-';
      $maxDescLength = 35; // Maximum characters before truncating (adjusted for larger font)

      if (strlen($description) > $maxDescLength) {
        $description = substr($description, 0, $maxDescLength) . '...';
      }

      $pdf->Cell(8, 7, $counter, 1, 0, 'C', true);
      $pdf->Cell(50, 7, $item->item_name ?? 'N/A', 1, 0, 'L', true);
      $pdf->Cell(40, 7, $description, 1, 0, 'L', true);
      $pdf->Cell(15, 7, $item->unit_of_measure ?? '-', 1, 0, 'C', true);
      $pdf->Cell(15, 7, number_format($quantity, 0), 1, 0, 'R', true);
      $pdf->Cell(25, 7, number_format((float)($item->unit_price ?? 0), 2), 1, 0, 'R', true);
      $pdf->Cell(25, 7, number_format($itemTotal, 2), 1, 1, 'R', true);

      $fill = !$fill;
      $counter++;
    }

    $this->subtotal = $subtotal;

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);

    return $pageCount;
  }

  /**
   * Render Totals
   */
  protected function renderTotals(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    $subtotal = $this->subtotal ?? 0;
    $totalValue = (float)($san->total_value ?? $subtotal);
    $taxAmount = (float)($san->total_tax ?? 0);
    $discountAmount = (float)($san->total_discount ?? 0);
    $netTotal = (float)($san->net_total ?? ($totalValue + $taxAmount - $discountAmount));

    $x = 115;
    $pdf->SetX($x);
    $pdf->SetFont('helvetica', '', 11); // Increased from 10
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $pdf->SetX($x);
    $pdf->Cell(45, 6, 'Subtotal:', 0, 0, 'R');
    $pdf->Cell(35, 6, number_format($subtotal, 2), 0, 1, 'R');

    if ($taxAmount > 0) {
      $pdf->SetX($x);
      $pdf->Cell(45, 6, 'Tax:', 0, 0, 'R');
      $pdf->Cell(35, 6, number_format($taxAmount, 2), 0, 1, 'R');
    }

    if ($discountAmount > 0) {
      $pdf->SetX($x);
      $pdf->Cell(45, 6, 'Discount:', 0, 0, 'R');
      $pdf->Cell(35, 6, number_format($discountAmount, 2), 0, 1, 'R');
    }

    $pdf->SetX($x);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line($x, $pdf->GetY(), $x + 80, $pdf->GetY());

    $pdf->SetX($x);
    $pdf->SetFont('helvetica', 'B', 13); // Increased from 12
    $pdf->SetTextColor(27, 94, 32);
    $pdf->Cell(45, 7, 'NET TOTAL:', 0, 0, 'R');
    $pdf->Cell(35, 7, number_format($netTotal, 2), 0, 1, 'R');
    $pdf->SetTextColor(0, 0, 0);

    $pdf->Ln(3);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render Terms - Always on a new page
   */
  protected function renderTerms(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13); // Increased from 12
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'TERMS AND CONDITIONS', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 5);
    $pdf->SetX(18);
    $pdf->SetFont('helvetica', '', 11); // Increased from 10
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $terms = [
      '1. This Service Acknowledgment Note confirms the completion of services as listed above.',
      '2. Services rendered have been verified and accepted as per the service agreement.',
      '3. Any discrepancies must be reported within 7 days of service completion.',
      '4. The supplier is responsible for any defects or incomplete work identified.',
      '5. This document serves as proof of service delivery and acceptance.',
      '6. This document is generated after satisfactory completion of services.',
    ];

    foreach ($terms as $term) {
      $pdf->MultiCell(175, 6, $term, 0, 'L');
      $pdf->SetX(18);
    }

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render Footer Note - Clean, simple note without borders or icons
   */
  protected function renderFooterNote(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    $y = $pdf->GetY();

    // Check if we need a new page for footer note
    if ($y > 245) {
      $pdf->AddPage();
      $this->setPageBackground($pdf);
      $this->addLogoWatermark($pdf);
      $pdf->SetY(25);
      $y = $pdf->GetY();
    }

    $pdf->SetY($y + 4);
    $pdf->SetX(15);

    // Simple divider line
    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.5);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());

    $pdf->SetY($pdf->GetY() + 4);
    $pdf->SetX(15);

    $pdf->SetX(15);
    $pdf->SetFont('helvetica', '', 10); // Increased from 9.5
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    // Get PO number
    $poNumber = $san->purchaseOrder?->po_number ?? 'N/A';

    // Simple note text
    $note = "This Service Acknowledgment Note (SAN) confirms the satisfactory completion of services from the supplier. ";
    $note .= "The attached Purchase Order (" . $poNumber . ") is provided for reference and verification. ";
    $note .= "This document is electronically generated and serves as proof of service delivery and acceptance.";

    $pdf->MultiCell(180, 5.5, $note, 0, 'L');

    $pdf->SetY($pdf->GetY() + 2);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'I', 9); // Increased from 8.5
    $pdf->SetTextColor(150, 150, 150);
    $pdf->Cell(180, 4.5, 'This document is electronically generated and requires no physical signature.', 0, 1, 'L');

    $pdf->Ln(2);
  }

  /**
   * APPEND PURCHASE ORDER PDF - STARTS ON A CLEAN NEW PAGE
   */
  protected function appendPurchaseOrderPDF(Fpdi $pdf, ServiceAcknowledgmentNote $san): void
  {
    $purchaseOrder = $san->purchaseOrder;

    if (!$purchaseOrder) {
      Log::warning('[PDF] No Purchase Order to append for SAN: ' . $san->san_number);
      return;
    }

    Log::info('[PDF] Appending Purchase Order PDF for: ' . $purchaseOrder->po_number);

    try {
      $poModel = PurchaseOrder::with([
        'items',
        'supplier',
        'requisition'
      ])->find($purchaseOrder->id);

      if (!$poModel) {
        Log::warning('[PDF] Purchase Order model not found for ID: ' . $purchaseOrder->id);
        $this->renderPurchaseOrderContentDirectly($pdf, null);
        return;
      }

      $poRenderer = new PurchaseOrderPdfRenderer($this->qrCodeService);
      $poPdfContent = $poRenderer->renderWithData($poModel);

      Log::info('[PDF] Purchase Order PDF generated, size: ' . strlen($poPdfContent ?? ''));

      if ($poPdfContent && strlen($poPdfContent) > 100) {
        try {
          if (class_exists('\setasign\Fpdi\Tcpdf\Fpdi')) {
            $pdf->AddPage();

            $tempPoFile = tempnam(sys_get_temp_dir(), 'po_') . '.pdf';
            file_put_contents($tempPoFile, $poPdfContent);

            $pageCount = $pdf->setSourceFile($tempPoFile);
            Log::info('[PDF] Purchase Order PDF has ' . $pageCount . ' pages');

            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
              if ($pageNo > 1) {
                $pdf->AddPage();
              }

              $templateId = $pdf->importPage($pageNo);
              $pdf->useTemplate($templateId, 0, 0, 210, 297);
            }

            @unlink($tempPoFile);

            Log::info('[PDF] Purchase Order PDF merged successfully using FPDI. Pages: ' . $pageCount);
            return;
          } else {
            Log::warning('[PDF] FPDI not available, falling back to direct rendering');
          }
        } catch (\Exception $e) {
          Log::error('[PDF] FPDI merge failed: ' . $e->getMessage());
        }
      } else {
        Log::warning('[PDF] Purchase Order PDF content is empty or too small: ' . strlen($poPdfContent ?? ''));
      }

      Log::info('[PDF] Falling back to direct Purchase Order rendering');
      $this->renderPurchaseOrderContentDirectly($pdf, $poModel);
    } catch (\Exception $e) {
      Log::error('[PDF] Failed to append Purchase Order PDF: ' . $e->getMessage());
      $this->renderPurchaseOrderContentDirectly($pdf, $poModel ?? null);
    }
  }

  /**
   * Render Purchase Order content directly - STARTS ON A CLEAN NEW PAGE
   */
  protected function renderPurchaseOrderContentDirectly(Fpdi $pdf, $poModel = null): void
  {
    if (!$poModel) {
      $purchaseOrder = $this->san?->purchaseOrder;
      if (!$purchaseOrder) {
        Log::warning('[PDF] No Purchase Order data to render directly');
        return;
      }
    } else {
      $purchaseOrder = $poModel;
    }

    Log::info('[PDF] Rendering Purchase Order content directly for: ' . ($purchaseOrder->po_number ?? 'N/A'));

    $pdf->AddPage();
    $this->setPageBackground($pdf);
    $this->addLogoWatermark($pdf);
    $pdf->SetY(20);

    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 8, 'PURCHASE ORDER', 0, 1, 'C');

    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->SetTextColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->Cell(0, 7, $purchaseOrder->po_number ?? 'N/A', 0, 1, 'C');

    $pdf->SetY(38);
    $pdf->SetDrawColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetLineWidth(1);
    $pdf->Line(15, 38, 195, 38);
    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, 40, 195, 40);

    // Supplier Information
    $pdf->SetY(48);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'SUPPLIER INFORMATION', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $supplier = $purchaseOrder->supplier;
    if ($supplier) {
      $fields = [
        ['Company Name:', $supplier->company_name ?? 'N/A'],
        ['Email:', $supplier->company_email ?? 'N/A'],
        ['Phone:', $supplier->company_phone ?? 'N/A'],
        ['Address:', $supplier->company_address ?? 'N/A'],
      ];

      $x = 15;
      $colWidth = 90;
      $rowHeight = 5.5;

      for ($i = 0; $i < count($fields); $i += 2) {
        $pdf->SetX($x);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(40, $rowHeight, $fields[$i][0], 0, 0);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(50, $rowHeight, $fields[$i][1], 0, 0);

        if (isset($fields[$i + 1])) {
          $pdf->SetX($x + $colWidth + 5);
          $pdf->SetFont('helvetica', 'B', 10);
          $pdf->Cell(40, $rowHeight, $fields[$i + 1][0], 0, 0);
          $pdf->SetFont('helvetica', '', 10);
          $pdf->Cell(50, $rowHeight, $fields[$i + 1][1], 0, 1);
        } else {
          $pdf->Ln($rowHeight);
        }
      }
    }

    $pdf->Ln(4);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);

    // Purchase Order Details
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'ORDER DETAILS', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $fields = [
      ['PO Number:', $purchaseOrder->po_number ?? 'N/A'],
      ['Type:', $purchaseOrder->type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'],
      ['Status:', ucfirst($purchaseOrder->status_label ?? $purchaseOrder->status ?? 'Draft')],
      ['Issue Date:', $this->formatDate($purchaseOrder->issue_date)],
      ['Expected Delivery:', $this->formatDate($purchaseOrder->expected_delivery_date)],
      ['Currency:', $purchaseOrder->currency ?? 'KES'],
    ];

    $x = 15;
    $colWidth = 90;
    $rowHeight = 5.5;

    for ($i = 0; $i < count($fields); $i += 2) {
      $pdf->SetX($x);
      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->Cell(45, $rowHeight, $fields[$i][0], 0, 0);
      $pdf->SetFont('helvetica', '', 10);
      $pdf->Cell(45, $rowHeight, $fields[$i][1], 0, 0);

      if (isset($fields[$i + 1])) {
        $pdf->SetX($x + $colWidth + 5);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(45, $rowHeight, $fields[$i + 1][0], 0, 0);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(45, $rowHeight, $fields[$i + 1][1], 0, 1);
      } else {
        $pdf->Ln($rowHeight);
      }
    }

    $pdf->Ln(4);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);

    // PO Items
    $items = $purchaseOrder->items;
    if ($items && $items->count() > 0) {
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 12);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell(180, 7, 'ORDER ITEMS', 0, 1, 'L');

      $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
      $pdf->SetLineWidth(0.6);
      $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

      $pdf->SetY($pdf->GetY() + 8);
      $pdf->SetX(15);

      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->SetFillColor(187, 222, 251);
      $pdf->SetTextColor(0, 0, 0);

      $pdf->Cell(8, 7, '#', 1, 0, 'C', 1);
      $pdf->Cell(50, 7, 'Item Name', 1, 0, 'L', 1);
      $pdf->Cell(40, 7, 'Description', 1, 0, 'L', 1);
      $pdf->Cell(15, 7, 'UOM', 1, 0, 'C', 1);
      $pdf->Cell(15, 7, 'Qty', 1, 0, 'C', 1);
      $pdf->Cell(25, 7, 'Unit Price', 1, 0, 'R', 1);
      $pdf->Cell(25, 7, 'Total', 1, 1, 'R', 1);

      $pdf->SetFont('helvetica', '', 10);
      $fill = false;
      $counter = 1;
      $subtotal = 0;

      foreach ($items as $item) {
        if ($pdf->GetY() > 250) {
          $pdf->AddPage();
          $this->setPageBackground($pdf);
          $this->addLogoWatermark($pdf);
          $pdf->SetY(20);
          $pdf->SetX(15);
          $pdf->SetFont('helvetica', 'B', 10);
          $pdf->SetFillColor(187, 222, 251);
          $pdf->SetTextColor(0, 0, 0);
          $pdf->Cell(8, 7, '#', 1, 0, 'C', 1);
          $pdf->Cell(50, 7, 'Item Name', 1, 0, 'L', 1);
          $pdf->Cell(40, 7, 'Description', 1, 0, 'L', 1);
          $pdf->Cell(15, 7, 'UOM', 1, 0, 'C', 1);
          $pdf->Cell(15, 7, 'Qty', 1, 0, 'C', 1);
          $pdf->Cell(25, 7, 'Unit Price', 1, 0, 'R', 1);
          $pdf->Cell(25, 7, 'Total', 1, 1, 'R', 1);
          $pdf->SetFont('helvetica', '', 10);
        }

        $pdf->SetX(15);
        $pdf->SetFillColor($fill ? 248 : 255, $fill ? 249 : 255, $fill ? 250 : 255);

        $itemTotal = (float)($item->total_price ?? 0);
        $subtotal += $itemTotal;

        $description = $item->description ?? '';
        if (strlen($description) > 30) {
          $description = substr($description, 0, 28) . '...';
        }

        $pdf->Cell(8, 6, $counter, 1, 0, 'C', true);
        $pdf->Cell(50, 6, $item->item_name ?? 'N/A', 1, 0, 'L', true);
        $pdf->Cell(40, 6, $description ?: '-', 1, 0, 'L', true);
        $pdf->Cell(15, 6, $item->unit_of_measure ?? '-', 1, 0, 'C', true);
        $pdf->Cell(15, 6, number_format((float)($item->quantity ?? 0), 0), 1, 0, 'R', true);
        $pdf->Cell(25, 6, number_format((float)($item->unit_price ?? 0), 2), 1, 0, 'R', true);
        $pdf->Cell(25, 6, number_format($itemTotal, 2), 1, 1, 'R', true);

        $fill = !$fill;
        $counter++;
      }

      $pdf->Ln(2);
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->SetFillColor(227, 242, 253);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell(150, 6, 'TOTAL ORDER AMOUNT:', 1, 0, 'R', true);
      $pdf->Cell(33, 6, number_format($subtotal, 2), 1, 1, 'R', true);
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

  protected function formatDateWithTime($date): string
  {
    return $this->formatDate($date, 'd M Y H:i');
  }
}
