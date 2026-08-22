<?php
// app/Services/Procurement/PDF/PurchaseOrderPdfRenderer.php

declare(strict_types=1);

namespace App\Services\Procurement\PDF;

use TCPDF;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use App\Models\User;
use App\Models\SignatureSpecimen;
use App\Models\SupplierQuotation;
use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use Illuminate\Support\Facades\Log;

class PurchaseOrderPdfRenderer extends BasePdfRenderer
{
  private QRCodeServiceInterface $qrCodeService;
  private bool $confidentialLabelRendered = false;
  private int $downloadCount = 0;
  private ?PurchaseOrder $purchaseOrder = null;

  // ✅ Class properties
  private ?array $supplierData = null;
  private ?array $requisitionData = null;
  private ?array $quotationData = null;
  private float $subtotal = 0;

  public function __construct(QRCodeServiceInterface $qrCodeService)
  {
    parent::__construct();
    $this->qrCodeService = $qrCodeService;
  }

  public function renderWithData(PurchaseOrder $purchaseOrder): string
  {
    Log::info('=== PURCHASE ORDER PDF GENERATION START ===');
    Log::info('[PDF] PO ID: ' . $purchaseOrder->id);
    Log::info('[PDF] PO Number: ' . $purchaseOrder->po_number);
    Log::info('[PDF] Supplier ID: ' . $purchaseOrder->supplier_id);
    Log::info('[PDF] Status: ' . $purchaseOrder->status);
    Log::info('[PDF] Download Count: ' . ($purchaseOrder->download_count ?? 0));
    Log::info('[PDF] Items Count: ' . ($purchaseOrder->items ? $purchaseOrder->items->count() : 0));
    Log::info('[PDF] Type: ' . $purchaseOrder->type);

    // Store purchase order for status checking
    $this->purchaseOrder = $purchaseOrder;
    $this->downloadCount = $purchaseOrder->download_count ?? 0;

    // Load company profile
    $this->loadCompanyProfile();
    $this->applyCompanyColors();
    $this->loadAndOptimizeLogo();

    // Load supplier directly from database
    $supplier = null;
    if ($purchaseOrder->supplier_id) {
      $supplier = Supplier::with(['user'])->find($purchaseOrder->supplier_id);
      if ($supplier) {
        Log::info('[PDF] Supplier loaded:', [
          'id' => $supplier->id,
          'company_name' => $supplier->company_name ?? 'N/A',
          'email' => $supplier->company_email ?? 'N/A',
        ]);
      } else {
        Log::warning('[PDF] Supplier NOT found for ID: ' . $purchaseOrder->supplier_id);
      }
    }
    $this->supplierData = $supplier ? $supplier->toArray() : null;

    // Load requisition
    $requisition = $purchaseOrder->requisition;
    if ($requisition) {
      $this->requisitionData = $requisition->toArray();
      Log::info('[PDF] Requisition loaded:', [
        'id' => $requisition->id,
        'reference_number' => $requisition->reference_number ?? 'N/A',
      ]);
    } else {
      Log::warning('[PDF] Requisition NOT loaded!');
    }

    // Load Supplier Quotation
    $quotation = null;
    if ($purchaseOrder->supplier_quotation_id) {
      $quotation = SupplierQuotation::with(['items'])->find($purchaseOrder->supplier_quotation_id);
      if ($quotation) {
        Log::info('[PDF] Supplier Quotation loaded:', [
          'id' => $quotation->id,
          'quotation_number' => $quotation->quotation_number ?? 'N/A',
        ]);
      } else {
        Log::warning('[PDF] Supplier Quotation NOT found for ID: ' . $purchaseOrder->supplier_quotation_id);
      }
    }
    $this->quotationData = $quotation ? $quotation->toArray() : null;

    // Initialize PDF
    $pdf = $this->initPdf($purchaseOrder->po_number);

    // Add watermark
    $this->addLogoWatermark($pdf);

    // ============================================
    // PAGE 1: Header + All Info Sections
    // ============================================
    $this->renderConfidentialLabel($pdf);
    $this->renderHeader($pdf, $purchaseOrder);
    $this->renderSupplierInfo($pdf, $purchaseOrder);
    // BUYER INFO REMOVED - was redundant
    $this->renderPurchaseOrderDetails($pdf, $purchaseOrder);
    $this->renderSupplierQuotationInfo($pdf, $purchaseOrder);
    $this->renderRequisitionDetails($pdf, $purchaseOrder);

    // ============================================
    // PAGE 2+: Items + Totals + Terms + Approvals
    // ============================================
    $pdf->AddPage();
    $this->addLogoWatermark($pdf);
    $pdf->SetY(20);

    $items = $purchaseOrder->items ?? [];
    $hasItems = !$items->isEmpty();

    if (!empty($items)) {
      $this->renderItemsTable($pdf, $items, $purchaseOrder);
      $this->renderTotals($pdf, $purchaseOrder);
      $this->renderTerms($pdf, $purchaseOrder);
      $this->renderApprovalsSection($pdf, $purchaseOrder);
    } else {
      $pdf->SetY(40);
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 12);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell(180, 10, 'No items found for this purchase order.', 0, 1, 'C');

      $this->renderTerms($pdf, $purchaseOrder);
      $this->renderApprovalsSection($pdf, $purchaseOrder);
    }

    // ============================================
    // APPEND SUPPLIER QUOTATION PDF - STARTS ON A CLEAN NEW PAGE
    // ============================================
    $this->appendSupplierQuotationPDF($pdf, $purchaseOrder);

    $this->cleanupTempFiles();

    Log::info('=== PURCHASE ORDER PDF GENERATION COMPLETE ===');

    return $pdf->Output('', 'S');
  }

  /**
   * Render Confidential Label - Top Right, First Page Only
   */
  protected function renderConfidentialLabel(TCPDF $pdf): void
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
    $pdf->SetFont('helvetica', 'B', 9);

    $label = 'CONFIDENTIAL';
    $width = 50;

    $pdf->RoundedRect($x, $y, $width, 6, 2, '1111', 'F');

    $pdf->SetXY($x + 2, $y + 1.2);
    $pdf->Cell($width - 4, 3.5, $label, 0, 1, 'C');

    $pdf->SetTextColor(0, 0, 0);

    $this->confidentialLabelRendered = true;
  }

  protected function generateQrCode(string $data): ?string
  {
    return $this->qrCodeService->generateQrCode($data);
  }

  /**
   * Render Header - Matches Quotation Header Style
   */
  protected function renderHeader(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
  {
    $pdf->SetY(15);

    // QR CODE
    $this->renderQrCode($pdf, $purchaseOrder);

    // LOGO
    $this->renderLogo($pdf);

    // COMPANY INFO
    $this->renderCompanyInfo($pdf);

    $this->addHeaderLine($pdf, 48);

    $pdf->SetY(55);
    $pdf->SetFont('helvetica', 'B', 20);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 9, $purchaseOrder->type === 'lpo' ? 'LOCAL PURCHASE ORDER' : 'LOCAL SERVICE ORDER', 0, 1, 'C');

    $pdf->SetY(64);
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->SetTextColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->Cell(0, 9, $purchaseOrder->po_number, 0, 1, 'C');

    $pdf->SetY(75);
  }

  /**
   * Render QR Code for Purchase Order
   */
  protected function renderQrCode(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
  {
    $frontendUrl = config('app.frontend_url') ?? env('FRONTEND_URL', 'https://sspmis.pasbestventures.com');
    $qrData = $frontendUrl . '/purchase-orders/' . $purchaseOrder->id . '/view';
    $qrData = "PO: " . $purchaseOrder->po_number . " | " . $qrData;

    $qrPath = $this->generateQrCode($qrData);
    if ($qrPath && file_exists($qrPath)) {
      $pdf->Image($qrPath, 95, 12, 20, 20);
      $this->qrCodeService->cleanupTempFiles($qrPath);
      Log::info('[PDF] QR Code added to PDF');
    }
  }

  /**
   * Render Logo
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
   * Render Company Info
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
   * Add Header Line
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

  protected function renderSupplierInfo(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
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

  protected function renderPurchaseOrderDetails(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
  {
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'PURCHASE ORDER DETAILS', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $fields = [
      ['PO Number:', $purchaseOrder->po_number],
      ['Type:', $purchaseOrder->type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'],
      ['Status:', ucfirst($purchaseOrder->status_label ?? $purchaseOrder->status ?? 'Draft')],
      ['Title:', $purchaseOrder->title ?? 'N/A'],
      ['Issue Date:', $this->formatDate($purchaseOrder->issue_date)],
      ['Expected Delivery:', $this->formatDate($purchaseOrder->expected_delivery_date)],
      ['Currency:', $purchaseOrder->currency ?? 'KES'],
      ['Validity Period:', ($purchaseOrder->validity_period_days ?? 30) . ' days'],
    ];

    if ($purchaseOrder->contract_number) {
      $fields[] = ['Contract No:', $purchaseOrder->contract_number];
    }

    if ($purchaseOrder->actual_delivery_date) {
      $fields[] = ['Actual Delivery:', $this->formatDate($purchaseOrder->actual_delivery_date)];
    }

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
   * Render Supplier Quotation Information
   */
  protected function renderSupplierQuotationInfo(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
  {
    $quotation = $this->quotationData ? (object) $this->quotationData : null;
    if (!$quotation) {
      return;
    }

    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'SUPPLIER QUOTATION INFORMATION', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $fields = [
      ['Quotation No:', $quotation->quotation_number ?? 'N/A'],
      ['Supplier Reference:', $quotation->supplier_reference_no ?? 'N/A'],
      ['Submission Date:', $this->formatDate($quotation->submission_date ?? null)],
      ['Validity Date:', $this->formatDate($quotation->validity_date ?? null)],
      ['Delivery Time:', $quotation->delivery_time ?? 'N/A'],
      ['Payment Terms:', $quotation->payment_terms ?? 'N/A'],
      ['Quotation Status:', $quotation->status_label ?? 'N/A'],
      ['Quotation Amount:', $quotation->formatted_total_amount ?? 'N/A'],
    ];

    $x = 15;
    $colWidth = 90;
    $rowHeight = 5.5;

    for ($i = 0; $i < count($fields); $i += 2) {
      $pdf->SetX($x);
      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->Cell(50, $rowHeight, $fields[$i][0], 0, 0);
      $pdf->SetFont('helvetica', '', 10);
      $pdf->Cell(40, $rowHeight, $fields[$i][1], 0, 0);

      if (isset($fields[$i + 1])) {
        $pdf->SetX($x + $colWidth + 5);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(50, $rowHeight, $fields[$i + 1][0], 0, 0);
        $pdf->SetFont('helvetica', '', 10);
        $pdf->Cell(40, $rowHeight, $fields[$i + 1][1], 0, 1);
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

  protected function renderRequisitionDetails(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
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
   * Render Items Table - With Description Column
   */
  protected function renderItemsTable(TCPDF $pdf, $items, PurchaseOrder $purchaseOrder): int
  {
    if (empty($items)) {
      Log::warning('[PDF] No items found for purchase order: ' . $purchaseOrder->id);
      return 0;
    }

    $pageCount = 1;
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'ORDER ITEMS', 0, 1, 'L');

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
    $pdf->Cell(50, 7, 'Item Name', 1, 0, 'L', 1);
    $pdf->Cell(40, 7, 'Description', 1, 0, 'L', 1);
    $pdf->Cell(15, 7, 'UOM', 1, 0, 'C', 1);
    $pdf->Cell(15, 7, 'Qty', 1, 0, 'C', 1);
    $pdf->Cell(25, 7, 'Unit Price', 1, 0, 'R', 1);
    $pdf->Cell(25, 7, 'Total', 1, 1, 'R', 1);

    // Table Body
    $pdf->SetFont('helvetica', '', 10);
    $fill = false;
    $counter = 1;
    $subtotal = 0;

    foreach ($items as $item) {
      // Check if we need a new page
      if ($pdf->GetY() > 240) {
        $pdf->AddPage();
        $this->addLogoWatermark($pdf);
        $pdf->SetY(25);
        $pdf->SetX(15);
        $pageCount++;

        // Re-render table header on new page
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
        $pdf->Cell(180, 7, 'ORDER ITEMS (Continued)', 0, 1, 'L');

        $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
        $pdf->SetLineWidth(0.6);
        $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

        $pdf->SetY($pdf->GetY() + 6);
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
      $quantity = (float)($item->quantity ?? 0);

      // Truncate description if too long
      $description = $item->description ?? '';
      if (strlen($description) > 30) {
        $description = substr($description, 0, 28) . '...';
      }

      $pdf->Cell(8, 6, $counter, 1, 0, 'C', true);
      $pdf->Cell(50, 6, $item->item_name ?? 'N/A', 1, 0, 'L', true);
      $pdf->Cell(40, 6, $description ?: '-', 1, 0, 'L', true);
      $pdf->Cell(15, 6, $item->unit_of_measure ?? '-', 1, 0, 'C', true);
      $pdf->Cell(15, 6, number_format($quantity, 0), 1, 0, 'R', true);
      $pdf->Cell(25, 6, number_format((float)($item->unit_price ?? 0), 2), 1, 0, 'R', true);
      $pdf->Cell(25, 6, number_format($itemTotal, 2), 1, 1, 'R', true);

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

  protected function renderTotals(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
  {
    $subtotal = $this->subtotal ?? 0;
    $totalAmount = (float)($purchaseOrder->total_amount ?? $subtotal);
    $taxAmount = (float)($purchaseOrder->tax_amount ?? 0);

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

    $pdf->SetX($x);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->Line($x, $pdf->GetY(), $x + 80, $pdf->GetY());

    $pdf->SetX($x);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor(27, 94, 32);
    $pdf->Cell(45, 6, 'TOTAL:', 0, 0, 'R');
    $pdf->Cell(35, 6, number_format($totalAmount, 2), 0, 1, 'R');
    $pdf->SetTextColor(0, 0, 0);

    $pdf->Ln(3);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.3);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  protected function renderTerms(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
  {
    $y = $pdf->GetY();

    if ($y > 230) {
      $pdf->AddPage();
      $this->addLogoWatermark($pdf);
      $pdf->SetY(25);
      $y = $pdf->GetY();
    }

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
      '1. This purchase order is valid for the period specified above.',
      '2. Prices are inclusive of all taxes unless otherwise stated.',
      '3. Delivery terms: ' . ($purchaseOrder->delivery_terms ?? 'As per agreement'),
      '4. Payment terms: ' . ($purchaseOrder->payment_terms ?? 'As per agreement'),
      '5. ' . ($purchaseOrder->special_conditions ?? 'No special conditions apply.'),
      '6. The supplier shall deliver goods/services as per the specifications.',
      '7. The school reserves the right to reject goods that do not meet specifications.',
      '8. This order constitutes a binding contract upon acceptance.',
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
   * Render Approvals Section - QR Code After Label, Before Name
   * Layout: Label → QR Code → Name → Role → Date → Signature Line
   */
  protected function renderApprovalsSection(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
  {
    $y = $pdf->GetY();

    // Check if we need a new page for approvals
    if ($y > 210) {
      $pdf->AddPage();
      $this->addLogoWatermark($pdf);
      $pdf->SetY(25);
      $y = $pdf->GetY();
    }

    $pdf->SetY($y);
    $pdf->SetX(15);
    $this->addSectionHeader($pdf, 'APPROVALS & SIGNATURES');

    // Get the approval data from the purchase order
    $approvalData = $this->getApprovalData($purchaseOrder);

    // Get signature specimens for users
    $signatures = $this->getSignatureSpecimens($purchaseOrder);

    // Render the approvals grid
    $this->renderApprovalsGrid($pdf, $approvalData, $signatures);
  }

  /**
   * Get approval data from purchase order
   */
  protected function getApprovalData(PurchaseOrder $purchaseOrder): array
  {
    return [
      'generated' => [
        'label' => 'Generated By',
        'name' => $purchaseOrder->generatedBy?->full_name ?? $purchaseOrder->generated_by ?? '—',
        'role' => $purchaseOrder->generatedBy?->role_display_name ?? 'Staff',
        'date' => $purchaseOrder->created_at,
        'user_id' => $purchaseOrder->generated_by,
      ],
      'checked' => [
        'label' => 'Checked By',
        'name' => $purchaseOrder->checkedBy?->full_name ?? $purchaseOrder->checked_by ?? '—',
        'role' => $purchaseOrder->checkedBy?->role_display_name ?? 'HOD',
        'date' => $purchaseOrder->checked_at,
        'user_id' => $purchaseOrder->checked_by,
      ],
      'endorsed' => [
        'label' => 'Endorsed By',
        'name' => $purchaseOrder->endorsedBy?->full_name ?? $purchaseOrder->endorsed_by ?? '—',
        'role' => $purchaseOrder->endorsedBy?->role_display_name ?? 'Accountant',
        'date' => $purchaseOrder->endorsed_at,
        'user_id' => $purchaseOrder->endorsed_by,
      ],
      'approved' => [
        'label' => 'Approved By',
        'name' => $purchaseOrder->approvedBy?->full_name ?? $purchaseOrder->approved_by ?? '—',
        'role' => $purchaseOrder->approvedBy?->role_display_name ?? 'Director',
        'date' => $purchaseOrder->approved_at,
        'user_id' => $purchaseOrder->approved_by,
      ],
    ];
  }

  /**
   * Get signature specimens for users
   */
  protected function getSignatureSpecimens(PurchaseOrder $purchaseOrder): array
  {
    $userIds = [];

    // Collect all user IDs from approval data
    if ($purchaseOrder->generated_by) $userIds[] = $purchaseOrder->generated_by;
    if ($purchaseOrder->checked_by) $userIds[] = $purchaseOrder->checked_by;
    if ($purchaseOrder->endorsed_by) $userIds[] = $purchaseOrder->endorsed_by;
    if ($purchaseOrder->approved_by) $userIds[] = $purchaseOrder->approved_by;

    if (empty($userIds)) {
      return [];
    }

    $specimens = SignatureSpecimen::whereIn('user_id', $userIds)
      ->where('is_verified', true)
      ->where('status', 'approved')
      ->with('user')
      ->get();

    $signatures = [];
    foreach ($specimens as $specimen) {
      $signatures[$specimen->user_id] = $specimen;
    }

    return $signatures;
  }

  /**
   * Render Approvals Grid - NO BORDERS, QR Code After Label
   * Layout: Label → QR Code → Name → Role → Date → Signature Line
   */
  protected function renderApprovalsGrid(TCPDF $pdf, array $approvalData, array $signatures): void
  {
    $colCount = 4;
    $colWidth = 42;
    $padding = 6;
    $usableWidth = ($colWidth * $colCount) + ($padding * ($colCount - 1));
    $startX = (210 - $usableWidth) / 2;
    $startY = $pdf->GetY() + 8;
    $rowHeight = 65;
    $qrSize = 18;

    $pdf->SetY($startY);
    $approvalItems = array_values($approvalData);

    for ($col = 0; $col < $colCount; $col++) {
      $x = $startX + ($col * ($colWidth + $padding));
      $y = $startY;

      $data = $approvalItems[$col] ?? null;
      if (!$data) continue;

      // ✅ NO BORDER - Clean text layout

      // Title / Label (Top)
      $pdf->SetXY($x, $y);
      $pdf->SetFont('helvetica', 'B', 8);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell($colWidth, 5, $data['label'], 0, 1, 'C');

      // ✅ QR Code (After Label, Before Name)
      $qrY = $y + 5;
      $qrX = $x + (($colWidth - $qrSize) / 2);

      $userSignature = isset($data['user_id']) && isset($signatures[$data['user_id']])
        ? $signatures[$data['user_id']]
        : null;

      if ($userSignature && $userSignature->qr_code_image) {
        $this->renderSignatureQrCode($pdf, $userSignature, $qrX, $qrY, $qrSize);
      } else {
        // QR placeholder
        $pdf->SetXY($x + 2, $qrY + 6);
        $pdf->SetFont('helvetica', 'I', 6);
        $pdf->SetTextColor(180, 180, 180);
        $pdf->Cell($colWidth - 4, 4, '[No Signature]', 0, 1, 'C');
      }

      // Name (After QR)
      $nameY = $qrY + $qrSize + 2;
      $pdf->SetXY($x, $nameY);
      $pdf->SetFont('helvetica', 'B', 9);
      $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
      $pdf->Cell($colWidth, 5, $data['name'], 0, 1, 'C');

      // Role (in brackets) - Below Name
      $roleY = $nameY + 5;
      $pdf->SetXY($x, $roleY);
      $pdf->SetFont('helvetica', 'I', 6.5);
      $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
      $pdf->Cell($colWidth, 4, '(' . ($data['role'] ?? '—') . ')', 0, 1, 'C');

      // Date - Below Role
      $dateY = $roleY + 4;
      $pdf->SetXY($x, $dateY);
      $pdf->SetFont('helvetica', 'I', 6.5);
      $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
      $pdf->Cell($colWidth, 4, $data['date'] ? $this->formatDate($data['date']) : 'Not signed', 0, 1, 'C');

      // Signature line - Below Date
      $lineY = $dateY + 4;
      $pdf->SetXY($x + 2, $lineY);
      $pdf->SetFont('helvetica', '', 6);
      $pdf->SetTextColor(150, 150, 150);
      $pdf->Cell($colWidth - 4, 3, '_________________', 0, 1, 'C');
    }

    $pdf->SetY($startY + $rowHeight + 6);
  }

  /**
   * Render Signature QR Code
   */
  protected function renderSignatureQrCode(TCPDF $pdf, $specimen, float $x, float $y, float $size): void
  {
    if (!$specimen->qr_code_image) {
      // Draw empty square placeholder
      $pdf->Rect($x, $y, $size, $size, 'D');
      $pdf->SetFont('helvetica', '', 6);
      $pdf->SetXY($x, $y + 6);
      $pdf->Cell($size, 4, 'N/A', 0, 0, 'C');
      return;
    }

    $qrData = $specimen->qr_code_image;

    if (str_starts_with($qrData, 'data:')) {
      $parts = explode(',', $qrData);
      if (count($parts) >= 2) {
        $tempFileBase = tempnam(sys_get_temp_dir(), 'qr_');
        if ($tempFileBase !== false) {
          $tempFile = $tempFileBase . '.png';
          file_put_contents($tempFile, base64_decode($parts[1]));

          if (file_exists($tempFile)) {
            $pdf->Image($tempFile, $x, $y, $size, $size);
            @unlink($tempFile);
          }
        }
      }
    } else {
      $pdf->Image($qrData, $x, $y, $size, $size);
    }
  }

  /**
   * Add Section Header with underline
   */
  protected function addSectionHeader(TCPDF $pdf, string $title): void
  {
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, $title, 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);
    $pdf->Ln(4);
  }

  /**
   * APPEND SUPPLIER QUOTATION PDF - STARTS ON A CLEAN NEW PAGE
   * Same approach as appending RFQ in SupplierQuotationPdfRenderer
   */
  protected function appendSupplierQuotationPDF(TCPDF $pdf, PurchaseOrder $purchaseOrder): void
  {
    $quotation = $this->quotationData ? (object) $this->quotationData : null;

    if (!$quotation) {
      Log::warning('[PDF] No Supplier Quotation to append for PO: ' . $purchaseOrder->po_number);
      return;
    }

    Log::info('[PDF] Appending Supplier Quotation PDF for: ' . $quotation->quotation_number);

    try {
      $quotationModel = SupplierQuotation::with([
        'items',
        'supplier'
      ])->find($quotation->id);

      if (!$quotationModel) {
        Log::warning('[PDF] Supplier Quotation model not found for ID: ' . $quotation->id);
        $this->renderSupplierQuotationContentDirectly($pdf, null);
        return;
      }

      $quotationRenderer = new SupplierQuotationPdfRenderer($this->qrCodeService);
      $quotationPdfContent = $quotationRenderer->renderWithData($quotationModel);

      Log::info('[PDF] Supplier Quotation PDF generated, size: ' . strlen($quotationPdfContent ?? ''));

      if ($quotationPdfContent && strlen($quotationPdfContent) > 100) {
        try {
          if (class_exists('\setasign\Fpdi\Tcpdf\Fpdi')) {
            $pdf->AddPage();

            $tempQuotationFile = tempnam(sys_get_temp_dir(), 'quotation_') . '.pdf';
            file_put_contents($tempQuotationFile, $quotationPdfContent);

            $pageCount = $pdf->setSourceFile($tempQuotationFile);
            Log::info('[PDF] Supplier Quotation PDF has ' . $pageCount . ' pages');

            for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
              if ($pageNo > 1) {
                $pdf->AddPage();
              }

              $templateId = $pdf->importPage($pageNo);
              $pdf->useTemplate($templateId, 0, 0, 210, 297);
            }

            @unlink($tempQuotationFile);

            Log::info('[PDF] Supplier Quotation PDF merged successfully using FPDI. Pages: ' . $pageCount);
            return;
          } else {
            Log::warning('[PDF] FPDI not available, falling back to direct rendering');
          }
        } catch (\Exception $e) {
          Log::error('[PDF] FPDI merge failed: ' . $e->getMessage());
        }
      } else {
        Log::warning('[PDF] Supplier Quotation PDF content is empty or too small: ' . strlen($quotationPdfContent ?? ''));
      }

      Log::info('[PDF] Falling back to direct Supplier Quotation rendering');
      $this->renderSupplierQuotationContentDirectly($pdf, $quotationModel);
    } catch (\Exception $e) {
      Log::error('[PDF] Failed to append Supplier Quotation PDF: ' . $e->getMessage());
      $this->renderSupplierQuotationContentDirectly($pdf, $quotationModel ?? null);
    }
  }

  /**
   * Render Supplier Quotation content directly - STARTS ON A CLEAN NEW PAGE
   */
  protected function renderSupplierQuotationContentDirectly(TCPDF $pdf, $quotationModel = null): void
  {
    if (!$quotationModel) {
      $quotation = $this->quotationData ? (object) $this->quotationData : null;
      if (!$quotation) {
        Log::warning('[PDF] No Supplier Quotation data to render directly');
        return;
      }
    } else {
      $quotation = $quotationModel;
    }

    Log::info('[PDF] Rendering Supplier Quotation content directly for: ' . ($quotation->quotation_number ?? 'N/A'));

    $pdf->AddPage();
    $this->addLogoWatermark($pdf);
    $pdf->SetY(20);

    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 8, 'SUPPLIER QUOTATION', 0, 1, 'C');

    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->SetTextColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->Cell(0, 7, $quotation->quotation_number ?? 'N/A', 0, 1, 'C');

    $pdf->SetY(38);
    $pdf->SetDrawColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetLineWidth(1);
    $pdf->Line(15, 38, 195, 38);
    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, 40, 195, 40);

    // Supplier Information
    $pdf->SetY(48);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'SUPPLIER INFORMATION', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $supplier = $quotation->supplier;
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

    // Quotation Details
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 7, 'QUOTATION DETAILS', 0, 1, 'L');

    $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
    $pdf->SetLineWidth(0.6);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 8);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $fields = [
      ['Quotation Number:', $quotation->quotation_number ?? 'N/A'],
      ['Status:', ucfirst($quotation->status_label ?? $quotation->status ?? 'Pending')],
      ['Submission Date:', $this->formatDate($quotation->submission_date ?? null)],
      ['Validity Date:', $this->formatDate($quotation->validity_date ?? null)],
      ['Currency:', $quotation->currency ?? 'KES'],
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

    // Quoted Items
    $items = $quotation->items;
    if ($items && $items->count() > 0) {
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 12);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell(180, 7, 'QUOTED ITEMS', 0, 1, 'L');

      $pdf->SetDrawColor($this->gold[0], $this->gold[1], $this->gold[2]);
      $pdf->SetLineWidth(0.6);
      $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

      $pdf->SetY($pdf->GetY() + 8);
      $pdf->SetX(15);

      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->SetFillColor(187, 222, 251);
      $pdf->SetTextColor(0, 0, 0);

      $pdf->Cell(8, 7, '#', 1, 0, 'C', 1);
      $pdf->Cell(60, 7, 'Item Name', 1, 0, 'L', 1);
      $pdf->Cell(15, 7, 'UOM', 1, 0, 'C', 1);
      $pdf->Cell(18, 7, 'Qty', 1, 0, 'C', 1);
      $pdf->Cell(28, 7, 'Unit Price', 1, 0, 'R', 1);
      $pdf->Cell(33, 7, 'Total', 1, 1, 'R', 1);

      $pdf->SetFont('helvetica', '', 10);
      $fill = false;
      $counter = 1;
      $subtotal = 0;

      foreach ($items as $item) {
        if ($pdf->GetY() > 250) {
          $pdf->AddPage();
          $this->addLogoWatermark($pdf);
          $pdf->SetY(20);
          $pdf->SetX(15);
          $pdf->SetFont('helvetica', 'B', 10);
          $pdf->SetFillColor(187, 222, 251);
          $pdf->SetTextColor(0, 0, 0);
          $pdf->Cell(8, 7, '#', 1, 0, 'C', 1);
          $pdf->Cell(60, 7, 'Item Name', 1, 0, 'L', 1);
          $pdf->Cell(15, 7, 'UOM', 1, 0, 'C', 1);
          $pdf->Cell(18, 7, 'Qty', 1, 0, 'C', 1);
          $pdf->Cell(28, 7, 'Unit Price', 1, 0, 'R', 1);
          $pdf->Cell(33, 7, 'Total', 1, 1, 'R', 1);
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
        $pdf->Cell(33, 6, number_format($itemTotal, 2), 1, 1, 'R', true);

        $fill = !$fill;
        $counter++;
      }

      $pdf->Ln(2);
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->SetFillColor(227, 242, 253);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell(150, 6, 'TOTAL QUOTED AMOUNT:', 1, 0, 'R', true);
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
