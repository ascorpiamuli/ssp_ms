<?php
// app/Services/Procurement/PDF/SupplierQuotationPdfRenderer.php

declare(strict_types=1);

namespace App\Services\Procurement\PDF;

use TCPDF;
use App\Models\SupplierQuotation;
use App\Models\SupplierQuotationItem;
use App\Models\User;
use App\Models\Supplier;
use App\Models\SignatureSpecimen;
use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use Illuminate\Support\Facades\Log;

class SupplierQuotationPdfRenderer extends BasePdfRenderer
{
  private QRCodeServiceInterface $qrCodeService;
  private bool $statusLabelRendered = false;
  private int $downloadCount = 0;
  private ?array $supplierData = null;
  private ?array $rfqData = null;
  private ?array $requisitionData = null;
  private float $subtotal = 0;

  public function __construct(QRCodeServiceInterface $qrCodeService)
  {
    parent::__construct();
    $this->qrCodeService = $qrCodeService;
  }

  public function renderWithData(SupplierQuotation $quotation): string
  {
    Log::info('=== SUPPLIER QUOTATION PDF GENERATION START ===');
    Log::info('[PDF] Quotation ID: ' . $quotation->id);
    Log::info('[PDF] Quotation Number: ' . $quotation->quotation_number);
    Log::info('[PDF] Supplier ID: ' . $quotation->supplier_id);
    Log::info('[PDF] Status: ' . $quotation->status);
    Log::info('[PDF] Items Count: ' . ($quotation->items ? $quotation->items->count() : 0));

    // Store download count
    $this->downloadCount = $quotation->download_count ?? 0;

    // Load company profile
    $this->loadCompanyProfile();
    $this->applyCompanyColors();
    $this->loadAndOptimizeLogo();

    // Load supplier directly from database
    $supplier = null;
    if ($quotation->supplier_id) {
      $supplier = Supplier::with(['user'])->find($quotation->supplier_id);
      if ($supplier) {
        Log::info('[PDF] Supplier loaded:', [
          'id' => $supplier->id,
          'company_name' => $supplier->company_name ?? 'N/A',
          'email' => $supplier->company_email ?? 'N/A',
        ]);
      } else {
        Log::warning('[PDF] Supplier NOT found for ID: ' . $quotation->supplier_id);
      }
    }
    $this->supplierData = $supplier ? $supplier->toArray() : null;

    // Load RFQ and requisition
    $rfq = $quotation->quotationRequest;
    if ($rfq) {
      Log::info('[PDF] RFQ loaded:', [
        'id' => $rfq->id,
        'qtn_number' => $rfq->qtn_number,
        'status' => $rfq->status,
        'title' => $rfq->title ?? 'N/A',
      ]);
      $this->rfqData = $rfq->toArray();

      $requisition = $rfq->requisition;
      if ($requisition) {
        $this->requisitionData = $requisition->toArray();
        Log::info('[PDF] Requisition loaded:', [
          'id' => $requisition->id,
          'reference_number' => $requisition->reference_number ?? 'N/A',
        ]);
      }
    } else {
      Log::warning('[PDF] RFQ NOT loaded!');
    }

    // Initialize PDF
    $pdf = $this->initPdf($quotation->quotation_number);

    // Add watermark
    $this->addLogoWatermark($pdf);

    // ============================================
    // PAGE 1: Header + All Info Sections
    // ============================================
    // ✅ Render status label at top right
    $this->renderStatusLabel($pdf, $quotation);

    $this->renderHeader($pdf, $quotation);
    $this->renderSupplierInfo($pdf, $quotation);
    // BUYER INFO REMOVED - was redundant
    $this->renderQuotationDetails($pdf, $quotation);
    $this->renderRFQDetails($pdf, $quotation);
    $this->renderRequisitionDetails($pdf, $quotation);

    // ============================================
    // PAGE 2+: Items + Totals + Terms
    // ============================================
    $pdf->AddPage();
    $this->addLogoWatermark($pdf);
    $pdf->SetY(20);

    $items = $quotation->items ?? [];
    $hasItems = !$items->isEmpty();

    if (!empty($items)) {
      $this->renderItemsTable($pdf, $items, $quotation);
      $this->renderTotals($pdf, $quotation);
      $this->renderTerms($pdf, $quotation);
    } else {
      $pdf->SetY(40);
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 12);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell(180, 10, 'No items found for this quotation.', 0, 1, 'C');

      $this->renderTerms($pdf, $quotation);
    }

    // ============================================
    // Append RFQ PDF (clean pages - NO collisions)
    // ============================================
    $this->appendRFQPDF($pdf, $quotation);

    $this->cleanupTempFiles();

    Log::info('=== SUPPLIER QUOTATION PDF GENERATION COMPLETE ===');

    return $pdf->Output('', 'S');
  }

  /**
   * Get the status label and color for the quotation
   */
  protected function getStatusLabelAndColor(SupplierQuotation $quotation): array
  {
    $status = $quotation->status;
    $verificationStatus = $quotation->verification_status;

    // If verified and accepted, show as accepted
    if ($status === 'accepted') {
      return [
        'label' => 'ACCEPTED',
        'bg' => [0, 150, 0],
        'text' => [255, 255, 255]
      ];
    }

    // If rejected
    if ($status === 'rejected') {
      return [
        'label' => 'REJECTED',
        'bg' => [200, 50, 50],
        'text' => [255, 255, 255]
      ];
    }

    // If evaluated but not accepted/rejected
    if ($status === 'evaluated') {
      return [
        'label' => 'EVALUATED',
        'bg' => [150, 0, 150],
        'text' => [255, 255, 255]
      ];
    }

    // If verified but not evaluated
    if ($verificationStatus === 'verified' && $status === 'submitted') {
      return [
        'label' => 'VERIFIED',
        'bg' => [0, 150, 200],
        'text' => [255, 255, 255]
      ];
    }

    // If rejected during verification
    if ($verificationStatus === 'rejected') {
      return [
        'label' => 'REJECTED',
        'bg' => [200, 50, 50],
        'text' => [255, 255, 255]
      ];
    }

    // If verification pending
    if ($verificationStatus === 'pending' || $verificationStatus === null) {
      return [
        'label' => 'PENDING',
        'bg' => [200, 150, 0],
        'text' => [255, 255, 255]
      ];
    }

    // Default: PENDING
    return [
      'label' => 'PENDING',
      'bg' => [200, 150, 0],
      'text' => [255, 255, 255]
    ];
  }

  /**
   * Render Status Label - Top Right, First Page Only
   */
  protected function renderStatusLabel(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    if ($this->statusLabelRendered) {
      return;
    }

    $y = 2;
    $x = 144;

    $statusData = $this->getStatusLabelAndColor($quotation);

    $pdf->SetY($y);
    $pdf->SetX($x);

    $pdf->SetFillColor($statusData['bg'][0], $statusData['bg'][1], $statusData['bg'][2]);
    $pdf->SetTextColor($statusData['text'][0], $statusData['text'][1], $statusData['text'][2]);
    $pdf->SetFont('helvetica', 'B', 10);

    $label = $statusData['label'];
    $width = strlen($label) * 6 + 10;
    if ($width < 40) $width = 40;
    if ($width > 65) $width = 65;

    // Rounded rectangle with border
    $pdf->RoundedRect($x, $y, $width, 7, 2, '1111', 'F');

    // Center the text
    $pdf->SetXY($x + 2, $y + 1.5);
    $pdf->Cell($width - 4, 4, $label, 0, 1, 'C');

    // Reset text color
    $pdf->SetTextColor(0, 0, 0);

    $this->statusLabelRendered = true;
  }

  protected function generateQrCode(string $data): ?string
  {
    return $this->qrCodeService->generateQrCode($data);
  }

  /**
   * Render Header - Matches RFQ Header Style with QR Code
   */
  protected function renderHeader(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    $pdf->SetY(15);

    // QR CODE
    $this->renderQrCode($pdf, $quotation);

    // LOGO
    $this->renderLogo($pdf);

    // COMPANY INFO
    $this->renderCompanyInfo($pdf);

    $this->addHeaderLine($pdf, 48);

    $pdf->SetY(55);
    $pdf->SetFont('helvetica', 'B', 20);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 9, 'SUPPLIER QUOTATION', 0, 1, 'C');

    $pdf->SetY(64);
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->SetTextColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->Cell(0, 9, $quotation->quotation_number, 0, 1, 'C');

    $pdf->SetY(75);
  }

  /**
   * Render QR Code for Supplier Quotation
   */
  protected function renderQrCode(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    $frontendUrl = config('app.frontend_url') ?? env('FRONTEND_URL', 'https://sspmis.pasbestventures.com');
    $qrData = $frontendUrl . '/supplier-quotations/' . $quotation->id . '/view';
    $qrData = "Quotation: " . $quotation->quotation_number . " | " . $qrData;

    $qrPath = $this->generateQrCode($qrData);
    if ($qrPath && file_exists($qrPath)) {
      $pdf->Image($qrPath, 95, 12, 20, 20);
      $this->qrCodeService->cleanupTempFiles($qrPath);
      Log::info('[PDF] QR Code added to PDF');
    }
  }

  /**
   * Render Logo - Matches RFQ Logo Style
   */
  protected function renderLogo(TCPDF $pdf): void
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
   * Render Company Info - Matches RFQ Company Info Style
   */
  protected function renderCompanyInfo(TCPDF $pdf): void
  {
    $rightX = 210 - 15 - 80;

    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetXY($rightX, 8);
    $pdf->Cell(80, 7, $this->getCompanyName(), 0, 1, 'R');

    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
    $pdf->SetX($rightX);
    $pdf->Cell(80, 5.5, $this->getCompanyAddress(), 0, 1, 'R');

    $pdf->SetX($rightX);
    $pdf->Cell(80, 5.5, 'Tel: ' . $this->getCompanyPhone(), 0, 1, 'R');

    $pdf->SetX($rightX);
    $pdf->Cell(80, 5.5, 'Email: ' . $this->getCompanyEmail(), 0, 1, 'R');
  }

  /**
   * Add Header Line - Matches RFQ Header Line Style
   */
  protected function addHeaderLine(TCPDF $pdf, float $y): void
  {
    $pdf->SetY($y);
    $pdf->SetDrawColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetLineWidth(1);
    $pdf->Line(15, $y, 195, $y);
    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $y + 2, 195, $y + 2);
  }

  protected function renderSupplierInfo(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    $supplier = $this->supplierData ? (object) $this->supplierData : null;
    $y = $pdf->GetY() + 2;

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'SUPPLIER INFORMATION', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    if ($supplier) {
      $fields = [
        ['Company Name:', $supplier->company_name ?? 'N/A'],
        ['Email:', $supplier->company_email ?? 'N/A'],
        ['Phone:', $supplier->company_phone ?? 'N/A'],
        ['Address:', $supplier->company_address ?? 'N/A'],
        ['Registration No:', $supplier->company_registration ?? 'N/A'],
        ['Tax ID/PIN:', $supplier->tax_id ?? 'N/A'],
        ['Contact Person:', $supplier->contact_person_name ?? 'N/A'],
        ['Category:', $supplier->category_label ?? $supplier->category ?? 'N/A'],
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
    } else {
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'I', 11);
      $pdf->Cell(180, 6, 'No supplier information available', 0, 1);
    }

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  // renderBuyerInfo() REMOVED - was redundant

  protected function renderQuotationDetails(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'QUOTATION DETAILS', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $fields = [
      ['Quotation Number:', $quotation->quotation_number],
      ['Status:', ucfirst($quotation->status_label ?? $quotation->status ?? 'Pending')],
      ['Submission Date:', $this->formatDate($quotation->submission_date)],
      ['Validity Date:', $this->formatDate($quotation->validity_date)],
      ['Currency:', $quotation->currency ?? 'KES'],
      ['Submission Method:', $quotation->submission_method_label ?? 'System'],
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

    if ($quotation->supplier_reference_no) {
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->Cell(45, $rowHeight, 'Supplier Reference:', 0, 0);
      $pdf->SetFont('helvetica', '', 10);
      $pdf->Cell(135, $rowHeight, $quotation->supplier_reference_no, 0, 1);
    }

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render RFQ Details - FIXED: Title on its own row, timestamp formatted
   */
  protected function renderRFQDetails(TCPDF $pdf): void
  {
    $rfq = $this->rfqData ? (object) $this->rfqData : null;
    if (!$rfq) {
      return;
    }

    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'RFQ INFORMATION', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $x = 15;
    $colWidth = 90;
    $rowHeight = 5.5;

    // ✅ Title on its own row (FULL WIDTH)
    $pdf->SetX($x);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(35, $rowHeight, 'Title:', 0, 0);
    $pdf->SetFont('helvetica', '', 10);
    $titleX = $x + 35;
    $titleMaxWidth = 180 - 35;
    $pdf->SetX($titleX);
    $pdf->MultiCell($titleMaxWidth, $rowHeight, $rfq->title ?? 'N/A', 0, 'L');

    // Get Y position after MultiCell
    $currentY = $pdf->GetY();

    // Row 1: RFQ Number + Issue Date
    $pdf->SetY($currentY);
    $pdf->SetX($x);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(35, $rowHeight, 'RFQ Number:', 0, 0);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(55, $rowHeight, $rfq->qtn_number ?? 'N/A', 0, 0);

    $pdf->SetX($x + $colWidth + 5);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(35, $rowHeight, 'Issue Date:', 0, 0);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(55, $rowHeight, $this->formatDate($rfq->issue_date ?? null), 0, 1);

    $currentY = $pdf->GetY();

    // Row 2: RFQ Status + Closing Date
    $pdf->SetY($currentY);
    $pdf->SetX($x);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(35, $rowHeight, 'RFQ Status:', 0, 0);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(55, $rowHeight, $rfq->status_label ?? $rfq->status ?? 'N/A', 0, 0);

    $pdf->SetX($x + $colWidth + 5);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(35, $rowHeight, 'Closing Date:', 0, 0);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(55, $rowHeight, $this->formatDate($rfq->closing_date ?? null), 0, 1);

    $currentY = $pdf->GetY();

    // Row 3: Closing Time (FULL WIDTH - formatted readable)
    $pdf->SetY($currentY);
    $pdf->SetX($x);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(35, $rowHeight, 'Closing Time:', 0, 0);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->Cell(145, $rowHeight, $this->formatTime($rfq->closing_time ?? 'N/A'), 0, 1);

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Format time for display - handles ISO timestamps
   * e.g., "2026-08-20T14:00:00.000000Z" → "02:00 PM"
   */
  protected function formatTime($time): string
  {
    if (!$time || $time === 'N/A') {
      return 'N/A';
    }

    try {
      // If it's an ISO timestamp like "2026-08-20T14:00:00.000000Z"
      if (is_string($time) && preg_match('/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', $time)) {
        $date = new \DateTime($time);
        return $date->format('h:i A');
      }

      // If it's a time string like "14:00:00"
      if (is_string($time) && preg_match('/^\d{2}:\d{2}:\d{2}/', $time)) {
        $date = new \DateTime($time);
        return $date->format('h:i A');
      }

      // If it's a DateTime object
      if ($time instanceof \DateTime) {
        return $time->format('h:i A');
      }

      // If it's already formatted like "02:00 PM"
      if (is_string($time) && preg_match('/\d{2}:\d{2} (AM|PM)/', $time)) {
        return $time;
      }

      return $time;
    } catch (\Exception $e) {
      return $time;
    }
  }

  protected function renderRequisitionDetails(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    $requisition = $this->requisitionData ? (object) $this->requisitionData : null;
    if (!$requisition) {
      return;
    }

    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'REQUISITION INFORMATION', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $department = isset($requisition->department) ? $requisition->department : null;

    $fields = [
      ['Requisition No:', $requisition->reference_number ?? 'N/A'],
      ['Department:', $department->name ?? 'N/A'],
      ['Priority:', $requisition->priority ?? 'Normal'],
      ['Status:', $requisition->status ?? 'Pending'],
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

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render Items Table - Supports pagination for many items
   */
  protected function renderItemsTable(TCPDF $pdf, $items, SupplierQuotation $quotation): int
  {
    if (empty($items)) {
      Log::warning('[PDF] No items found for quotation: ' . $quotation->id);
      return 0;
    }

    $pageCount = 1;
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'QUOTED ITEMS', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 6);
    $pdf->SetX(15);

    // Table Header
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetFillColor(187, 222, 251);
    $pdf->SetTextColor(0, 0, 0);

    $pdf->Cell(8, 7, '#', 1, 0, 'C', 1);
    $pdf->Cell(60, 7, 'Item Name', 1, 0, 'L', 1);
    $pdf->Cell(15, 7, 'UOM', 1, 0, 'C', 1);
    $pdf->Cell(18, 7, 'Qty', 1, 0, 'C', 1);
    $pdf->Cell(28, 7, 'Unit Price', 1, 0, 'R', 1);
    $pdf->Cell(33, 7, 'Total', 1, 0, 'R', 1);
    $pdf->Cell(22, 7, 'Delivery', 1, 1, 'C', 1);

    // Table Body
    $pdf->SetFont('helvetica', '', 10);
    $fill = false;
    $counter = 1;
    $subtotal = 0;

    foreach ($items as $item) {
      if ($pdf->GetY() > 240) {
        $pdf->AddPage();
        $this->addLogoWatermark($pdf);
        $pdf->SetY(25);
        $pdf->SetX(15);
        $pageCount++;

        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
        $pdf->Cell(180, 7, 'QUOTED ITEMS (Continued)', 0, 1, 'L');

        $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
        $pdf->SetLineWidth(0.6);
        $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

        $pdf->SetY($pdf->GetY() + 6);
        $pdf->SetX(15);

        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(187, 222, 251);
        $pdf->SetTextColor(0, 0, 0);

        $pdf->Cell(8, 7, '#', 1, 0, 'C', 1);
        $pdf->Cell(60, 7, 'Item Name', 1, 0, 'L', 1);
        $pdf->Cell(15, 7, 'UOM', 1, 0, 'C', 1);
        $pdf->Cell(18, 7, 'Qty', 1, 0, 'C', 1);
        $pdf->Cell(28, 7, 'Unit Price', 1, 0, 'R', 1);
        $pdf->Cell(33, 7, 'Total', 1, 0, 'R', 1);
        $pdf->Cell(22, 7, 'Delivery', 1, 1, 'C', 1);
        $pdf->SetFont('helvetica', '', 10);
      }

      $pdf->SetX(15);
      $pdf->SetFillColor($fill ? 248 : 255, $fill ? 249 : 255, $fill ? 250 : 255);

      $itemTotal = (float)($item->total_price ?? 0);
      $subtotal += $itemTotal;

      $pdf->Cell(8, 6, $counter, 1, 0, 'C', true);
      $pdf->Cell(60, 6, $item->item_name ?? 'N/A', 1, 0, 'L', true);
      $pdf->Cell(15, 6, $item->unit_of_measure ?? '-', 1, 0, 'C', true);
      $pdf->Cell(18, 6, number_format((float)($item->quantity ?? 0), 0), 1, 0, 'R', true);
      $pdf->Cell(28, 6, number_format((float)($item->unit_price ?? 0), 2), 1, 0, 'R', true);
      $pdf->Cell(33, 6, number_format($itemTotal, 2), 1, 0, 'R', true);
      $pdf->Cell(22, 6, $item->delivery_days ? $item->delivery_days . ' days' : '-', 1, 1, 'C', true);

      $fill = !$fill;
      $counter++;
    }

    $this->subtotal = $subtotal;

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);

    return $pageCount;
  }

  protected function renderTotals(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    $subtotal = $this->subtotal ?? 0;
    $netAmount = (float)($quotation->net_amount ?? 0);
    $taxAmount = (float)($quotation->tax_amount ?? 0);
    $discountAmount = (float)($quotation->discount_amount ?? 0);

    $x = 115;
    $pdf->SetX($x);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $pdf->SetX($x);
    $pdf->Cell(45, 5, 'Subtotal:', 0, 0, 'R');
    $pdf->Cell(35, 5, number_format($subtotal, 2), 0, 1, 'R');

    if ($taxAmount > 0) {
      $pdf->SetX($x);
      $pdf->Cell(45, 5, 'Tax:', 0, 0, 'R');
      $pdf->Cell(35, 5, number_format($taxAmount, 2), 0, 1, 'R');
    }

    if ($discountAmount > 0) {
      $pdf->SetX($x);
      $pdf->SetTextColor(27, 94, 32);
      $pdf->Cell(45, 5, 'Discount:', 0, 0, 'R');
      $pdf->Cell(35, 5, '-' . number_format($discountAmount, 2), 0, 1, 'R');
      $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
    }

    $pdf->SetX($x);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line($x, $pdf->GetY(), $x + 80, $pdf->GetY());

    $pdf->SetX($x);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor(27, 94, 32);
    $pdf->Cell(45, 6, 'NET TOTAL:', 0, 0, 'R');
    $pdf->Cell(35, 6, number_format($netAmount, 2), 0, 1, 'R');
    $pdf->SetTextColor(0, 0, 0);

    $pdf->Ln(3);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  protected function renderTerms(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'TERMS AND CONDITIONS', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 4);
    $pdf->SetX(18);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $terms = [
      '1. This quotation is valid for the period specified above.',
      '2. Prices are inclusive of all taxes unless otherwise stated.',
      '3. Delivery terms: ' . ($quotation->delivery_terms ?? 'As per quotation'),
      '4. Payment terms: ' . ($quotation->payment_terms ?? 'As per quotation'),
      '5. Warranty terms: ' . ($quotation->warranty_terms ?? 'As per quotation'),
      '6. The supplier warrants that goods/services meet the specifications.',
      '7. Acceptance of this quotation constitutes a binding contract.',
      '8. The school reserves the right to accept or reject any quotation.',
    ];

    foreach ($terms as $term) {
      $pdf->MultiCell(175, 5, $term, 0, 'L');
      $pdf->SetX(18);
    }

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * APPEND RFQ PDF - STARTS ON A CLEAN NEW PAGE
   */
  protected function appendRFQPDF(TCPDF $pdf, SupplierQuotation $quotation): void
  {
    $rfq = $this->rfqData ? (object) $this->rfqData : null;

    if (!$rfq) {
      Log::warning('[PDF] No RFQ to append for quotation: ' . $quotation->id);
      return;
    }

    Log::info('[PDF] Appending RFQ PDF for: ' . $rfq->qtn_number);

    try {
      $rfqModel = \App\Models\QuotationRequest::with([
        'requisition',
        'requisition.department',
        'requisition.items',
        'generatedBy',
        'supplierQuotations'
      ])->find($rfq->id);

      if (!$rfqModel) {
        Log::warning('[PDF] RFQ model not found for ID: ' . $rfq->id);
        $this->renderRFQContentDirectly($pdf, null);
        return;
      }

      $rfqRenderer = new RequestForQuotationPdfRenderer($this->qrCodeService);
      $rfqPdfContent = $rfqRenderer->render($rfqModel);

      Log::info('[PDF] RFQ PDF generated, size: ' . strlen($rfqPdfContent ?? ''));

      if ($rfqPdfContent && strlen($rfqPdfContent) > 100) {
        try {
          if (class_exists('\setasign\Fpdi\Tcpdf\Fpdi')) {
            $pdf->AddPage();

            $tempRfqFile = tempnam(sys_get_temp_dir(), 'rfq_') . '.pdf';
            file_put_contents($tempRfqFile, $rfqPdfContent);

            $pageCount = $pdf->setSourceFile($tempRfqFile);
            Log::info('[PDF] RFQ PDF has ' . $pageCount . ' pages');

            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
              if ($pageNo > 1) {
                $pdf->AddPage();
              }

              $templateId = $pdf->importPage($pageNo);
              $pdf->useTemplate($templateId, 0, 0, 210, 297);
            }

            @unlink($tempRfqFile);

            Log::info('[PDF] RFQ PDF merged successfully using FPDI. Pages: ' . $pageCount);
            return;
          } else {
            Log::warning('[PDF] FPDI not available, falling back to direct rendering');
          }
        } catch (\Exception $e) {
          Log::error('[PDF] FPDI merge failed: ' . $e->getMessage());
        }
      } else {
        Log::warning('[PDF] RFQ PDF content is empty or too small: ' . strlen($rfqPdfContent ?? ''));
      }

      Log::info('[PDF] Falling back to direct RFQ rendering');
      $this->renderRFQContentDirectly($pdf, $rfqModel);
    } catch (\Exception $e) {
      Log::error('[PDF] Failed to append RFQ PDF: ' . $e->getMessage());
      $this->renderRFQContentDirectly($pdf, $rfqModel ?? null);
    }
  }

  /**
   * Render RFQ content directly - STARTS ON A CLEAN NEW PAGE
   */
  protected function renderRFQContentDirectly(TCPDF $pdf, $rfqModel = null): void
  {
    if (!$rfqModel) {
      $rfq = $this->rfqData ? (object) $this->rfqData : null;
      if (!$rfq) {
        Log::warning('[PDF] No RFQ data to render directly');
        return;
      }
    } else {
      $rfq = $rfqModel;
    }

    $requisition = $rfq->requisition;

    Log::info('[PDF] Rendering RFQ content directly for: ' . ($rfq->qtn_number ?? 'N/A'));

    $pdf->AddPage();
    $this->addLogoWatermark($pdf);
    $pdf->SetY(20);

    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 8, 'REQUEST FOR QUOTATION', 0, 1, 'C');

    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->SetTextColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->Cell(0, 7, $rfq->qtn_number ?? 'N/A', 0, 1, 'C');

    $pdf->SetY(38);
    $pdf->SetDrawColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetLineWidth(1);
    $pdf->Line(15, 38, 195, 38);
    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, 40, 195, 40);

    $pdf->SetY(48);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'REQUEST FOR QUOTATION INFORMATION', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $fields = [
      ['Title:', $rfq->title ?? 'N/A'],
      ['Issue Date:', $this->formatDate($rfq->issue_date ?? null)],
      ['Closing Date:', $this->formatDate($rfq->closing_date ?? null)],
      ['Closing Time:', $this->formatTime($rfq->closing_time ?? 'N/A')],
    ];

    $x = 15;
    $colWidth = 90;
    $rowHeight = 6;

    for ($i = 0; $i < count($fields); $i += 2) {
      $pdf->SetX($x);
      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->Cell(30, $rowHeight, $fields[$i][0], 0, 0);
      $pdf->SetFont('helvetica', '', 10);
      $pdf->Cell(60, $rowHeight, $fields[$i][1], 0, 0);

      if (isset($fields[$i + 1])) {
        $pdf->SetX($x + $colWidth + 5);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(30, $rowHeight, $fields[$i + 1][0], 0, 0);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(60, $rowHeight, $fields[$i + 1][1], 0, 1);
      } else {
        $pdf->Ln($rowHeight);
      }
    }

    $pdf->Ln(4);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);

    if ($requisition) {
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 12);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell(180, 7, 'REQUISITION INFORMATION', 0, 1, 'L');

      $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
      $pdf->SetLineWidth(0.6);
      $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

      $pdf->SetY($pdf->GetY() + 8);
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', '', 10);
      $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

      $department = $requisition->department;
      $fields2 = [
        ['Requisition No.:', $requisition->reference_number ?? 'N/A'],
        ['Department:', $department->name ?? 'N/A'],
        ['Priority:', ucfirst($requisition->priority ?? 'Normal')],
        ['Status:', ucfirst($requisition->status ?? 'Pending')],
      ];

      for ($i = 0; $i < count($fields2); $i += 2) {
        $pdf->SetX($x);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(40, $rowHeight, $fields2[$i][0], 0, 0);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(50, $rowHeight, $fields2[$i][1], 0, 0);

        if (isset($fields2[$i + 1])) {
          $pdf->SetX($x + $colWidth + 5);
          $pdf->SetFont('helvetica', 'B', 10);
          $pdf->Cell(40, $rowHeight, $fields2[$i + 1][0], 0, 0);
          $pdf->SetFont('helvetica', '', 10);
          $pdf->Cell(50, $rowHeight, $fields2[$i + 1][1], 0, 1);
        } else {
          $pdf->Ln($rowHeight);
        }
      }

      $pdf->Ln(4);
      $pdf->SetDrawColor(200, 200, 200);
      $pdf->SetLineWidth(0.3);
      $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
      $pdf->Ln(2);

      $items = $requisition->items;
      if ($items && $items->count() > 0) {
        $pdf->SetX(15);
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
        $pdf->Cell(180, 7, 'ITEMS REQUIRED', 0, 1, 'L');

        $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
        $pdf->SetLineWidth(0.6);
        $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

        $pdf->SetY($pdf->GetY() + 8);
        $pdf->SetX(15);

        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(187, 222, 251);
        $pdf->SetTextColor(0, 0, 0);

        $pdf->Cell(9, 7, '#', 1, 0, 'C', 1);
        $pdf->Cell(65, 7, 'Item Name', 1, 0, 'L', 1);
        $pdf->Cell(20, 7, 'UOM', 1, 0, 'C', 1);
        $pdf->Cell(20, 7, 'Qty', 1, 0, 'C', 1);
        $pdf->Cell(25, 7, 'Delivery', 1, 0, 'C', 1);
        $pdf->Cell(35, 7, 'Specifications', 1, 1, 'C', 1);

        $pdf->SetFont('helvetica', '', 10);
        $fill = false;
        $counter = 1;

        foreach ($items as $item) {
          if ($pdf->GetY() > 250) {
            $pdf->AddPage();
            $this->addLogoWatermark($pdf);
            $pdf->SetY(20);
            $pdf->SetX(15);
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->SetFillColor(187, 222, 251);
            $pdf->SetTextColor(0, 0, 0);
            $pdf->Cell(9, 7, '#', 1, 0, 'C', 1);
            $pdf->Cell(65, 7, 'Item Name', 1, 0, 'L', 1);
            $pdf->Cell(20, 7, 'UOM', 1, 0, 'C', 1);
            $pdf->Cell(20, 7, 'Qty', 1, 0, 'C', 1);
            $pdf->Cell(25, 7, 'Delivery', 1, 0, 'C', 1);
            $pdf->Cell(35, 7, 'Specifications', 1, 1, 'C', 1);
            $pdf->SetFont('helvetica', '', 10);
          }

          $pdf->SetX(15);
          $pdf->SetFillColor($fill ? 248 : 255, $fill ? 249 : 255, $fill ? 250 : 255);

          $pdf->Cell(9, 6, $counter, 1, 0, 'C', true);
          $pdf->Cell(65, 6, $item->item_name ?? 'N/A', 1, 0, 'L', true);
          $pdf->Cell(20, 6, $item->unit_of_measure ?? '-', 1, 0, 'C', true);
          $pdf->Cell(20, 6, number_format((float)($item->quantity ?? 0), 0), 1, 0, 'R', true);
          $pdf->Cell(25, 6, $item->delivery_days ?? '-', 1, 0, 'C', true);
          $pdf->Cell(35, 6, $item->specifications ?? '', 1, 1, 'L', true);

          $fill = !$fill;
          $counter++;
        }

        $pdf->Ln(2);
        $pdf->SetX(15);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(227, 242, 253);
        $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
        $pdf->Cell(154, 6, 'TOTAL ITEMS:', 1, 0, 'R', true);
        $pdf->Cell(25, 6, $items->count(), 1, 1, 'C', true);
      }
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
}
