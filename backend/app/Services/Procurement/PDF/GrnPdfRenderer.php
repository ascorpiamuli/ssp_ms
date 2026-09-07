<?php
// app/Services/Procurement/PDF/GrnPdfRenderer.php

declare(strict_types=1);

namespace App\Services\Procurement\PDF;

use setasign\Fpdi\Tcpdf\Fpdi;
use App\Models\GoodsReceivedNote;
use App\Models\Supplier;
use App\Models\SignatureSpecimen;
use App\Models\PurchaseOrder;
use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use Illuminate\Support\Facades\Log;

class GrnPdfRenderer extends BasePdfRenderer
{
  private QRCodeServiceInterface $qrCodeService;
  private bool $confidentialLabelRendered = false;
  private int $downloadCount = 0;
  private ?GoodsReceivedNote $grn = null;
  private float $subtotal = 0;

  // Blue color scheme
  private array $bluePrimary = [26, 35, 126];
  private array $blueSecondary = [52, 73, 94];
  private array $blueGold = [41, 128, 185];

  // Blue background color
  private array $blueBackground = [235, 245, 255];

  public function __construct(QRCodeServiceInterface $qrCodeService)
  {
    parent::__construct();
    $this->qrCodeService = $qrCodeService;

    // Override colors with blue scheme
    $this->primary = $this->bluePrimary;
    $this->secondary = $this->blueSecondary;
    $this->gold = $this->blueGold;
  }

  /**
   * ✅ Override initPdf to add blue background
   */
  protected function initPdf(string $title): Fpdi
  {
    $pdf = new Fpdi('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator('SSPMS');
    $pdf->SetAuthor('SSPMS');
    $pdf->SetTitle($title);
    $pdf->SetSubject('Goods Received Note');
    $pdf->SetKeywords('GRN, Goods Received, Procurement');

    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(15, 10, 15);
    $pdf->SetHeaderMargin(3);
    $pdf->SetFooterMargin(10);
    $pdf->SetAutoPageBreak(true, 15);

    $pdf->AddPage();
    $this->setPageBackground($pdf);

    return $pdf;
  }

  /**
   * ✅ Set page background color to blue
   */
  private function setPageBackground(Fpdi $pdf): void
  {
    $pdf->SetFillColor(
      $this->blueBackground[0],
      $this->blueBackground[1],
      $this->blueBackground[2]
    );
    $pdf->Rect(0, 0, 210, 297, 'F');
  }

  public function renderWithData(GoodsReceivedNote $grn): string
  {
    Log::info('=== GRN PDF GENERATION START ===');
    Log::info('[PDF] GRN ID: ' . $grn->id);
    Log::info('[PDF] GRN Number: ' . $grn->grn_number);
    Log::info('[PDF] PO Number: ' . ($grn->purchaseOrder?->po_number ?? 'N/A'));
    Log::info('[PDF] Status: ' . $grn->status);
    Log::info('[PDF] Items Count: ' . $grn->items->count());

    $this->grn = $grn;
    $this->downloadCount = $grn->download_count ?? 0;

    $this->loadCompanyProfile();
    $this->applyCompanyColors();
    $this->loadAndOptimizeLogo();

    $pdf = $this->initPdf($grn->grn_number);
    $this->addLogoWatermark($pdf);

    // ============================================
    // PAGE 1: Header + All Info Sections
    // ============================================
    $this->renderConfidentialLabel($pdf);
    $this->renderHeader($pdf, $grn);
    $this->renderSupplierInfo($pdf, $grn);
    $this->renderGrnDetails($pdf, $grn);
    $this->renderPurchaseOrderDetails($pdf, $grn);

    // ============================================
    // PAGE 2+: Items + Totals + Terms + Footer Note
    // ============================================
    $pdf->AddPage();
    $this->setPageBackground($pdf);
    $this->addLogoWatermark($pdf);
    $pdf->SetY(20);

    $items = $grn->items;
    $hasItems = !$items->isEmpty();

    if ($hasItems) {
      $this->renderItemsTable($pdf, $items, $grn);
      $this->renderTotals($pdf, $grn);
      $this->renderTerms($pdf, $grn);
      $this->renderFooterNote($pdf, $grn);
    } else {
      $pdf->SetY(40);
      $pdf->SetX(15);
      $pdf->SetFont('helvetica', 'B', 13);
      $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
      $pdf->Cell(180, 10, 'No items found for this GRN.', 0, 1, 'C');

      $this->renderTerms($pdf, $grn);
      $this->renderFooterNote($pdf, $grn);
    }

    // ============================================
    // APPEND PURCHASE ORDER PDF - STARTS ON A CLEAN NEW PAGE
    // ============================================
    $this->appendPurchaseOrderPDF($pdf, $grn);

    $this->cleanupTempFiles();

    Log::info('=== GRN PDF GENERATION COMPLETE ===');

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
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetTextColor(255, 255, 255);

    $label = 'CONFIDENTIAL';
    $width = 50;

    $pdf->RoundedRect($x, $y, $width, 7, 2, '1111', 'F');

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
  protected function renderHeader(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $pdf->SetY(15);

    // QR CODE
    $this->renderQrCode($pdf, $grn);

    // LOGO
    $this->renderLogo($pdf);

    // COMPANY INFO
    $this->renderCompanyInfo($pdf);

    $this->addHeaderLine($pdf, 48);

    $pdf->SetY(55);
    $pdf->SetFont('helvetica', 'B', 22);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 10, 'GOODS RECEIVED NOTE', 0, 1, 'C');

    $pdf->SetY(65);
    $pdf->SetFont('helvetica', 'B', 18);
    $pdf->SetTextColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->Cell(0, 10, $grn->grn_number, 0, 1, 'C');

    $pdf->SetY(78);
  }

  /**
   * Render QR Code for GRN
   */
  protected function renderQrCode(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $frontendUrl = config('app.frontend_url') ?? env('FRONTEND_URL', 'https://sspmis.pasbestventures.com');
    $qrData = $frontendUrl . '/goods-received/' . $grn->id . '/view';
    $qrData = "GRN: " . $grn->grn_number . " | " . $qrData;

    $qrPath = $this->generateQrCode($qrData);
    if ($qrPath && file_exists($qrPath)) {
      $pdf->Image($qrPath, 95, 12, 22, 22);
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

    $pdf->SetFont('helvetica', 'B', 15);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetXY($rightX, 8);
    $pdf->Cell(80, 8, $this->getCompanyName(), 0, 1, 'R');

    $pdf->SetFont('helvetica', '', 11);
    $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
    $pdf->SetX($rightX);
    $pdf->Cell(80, 6, $this->getCompanyAddress(), 0, 1, 'R');

    $pdf->SetX($rightX);
    $pdf->Cell(80, 6, 'Tel: ' . $this->getCompanyPhone(), 0, 1, 'R');

    $pdf->SetX($rightX);
    $pdf->Cell(80, 6, 'Email: ' . $this->getCompanyEmail(), 0, 1, 'R');
  }

  /**
   * Add Header Line - Blue
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
   * Render Supplier Information
   */
  protected function renderSupplierInfo(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $supplier = $grn->purchaseOrder?->supplier;
    $y = $pdf->GetY() + 2;

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'SUPPLIER INFORMATION', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 9);
    $pdf->SetFont('helvetica', '', 11);
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
      $rowHeight = 6.5;

      for ($i = 0; $i < count($fields); $i += 2) {
        $pdf->SetX($x);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(40, $rowHeight, $fields[$i][0], 0, 0);
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(50, $rowHeight, $fields[$i][1], 0, 0);

        if (isset($fields[$i + 1])) {
          $pdf->SetX($x + $colWidth + 5);
          $pdf->SetFont('helvetica', 'B', 11);
          $pdf->Cell(40, $rowHeight, $fields[$i + 1][0], 0, 0);
          $pdf->SetFont('helvetica', '', 11);
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
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render GRN Details
   */
  protected function renderGrnDetails(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'RECEIVED GOODS DETAILS', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 9);
    $pdf->SetFont('helvetica', '', 11);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $fields = [
      ['GRN Number:', $grn->grn_number],
      ['Status:', ucfirst($grn->status_label ?? $grn->status ?? 'Draft')],
      ['Received Date:', $this->formatDate($grn->received_date)],
      ['Received Time:', $grn->received_time ?? 'N/A'],
      ['Delivery Note:', $grn->delivery_note_number ?? 'N/A'],
      ['Carrier:', $grn->carrier ?? 'N/A'],
      ['Waybill Number:', $grn->waybill_number ?? 'N/A'],
      ['Vehicle Number:', $grn->vehicle_number ?? 'N/A'],
      ['Delivery Condition:', $grn->delivery_condition ?? 'N/A'],
    ];

    $x = 15;
    $colWidth = 90;
    $rowHeight = 6.5;

    for ($i = 0; $i < count($fields); $i += 2) {
      $pdf->SetX($x);
      $pdf->SetFont('helvetica', 'B', 11);
      $pdf->Cell(40, $rowHeight, $fields[$i][0], 0, 0);
      $pdf->SetFont('helvetica', '', 11);
      $pdf->Cell(50, $rowHeight, $fields[$i][1], 0, 0);

      if (isset($fields[$i + 1])) {
        $pdf->SetX($x + $colWidth + 5);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(40, $rowHeight, $fields[$i + 1][0], 0, 0);
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(50, $rowHeight, $fields[$i + 1][1], 0, 1);
      } else {
        $pdf->Ln($rowHeight);
      }
    }

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render Purchase Order Details
   */
  protected function renderPurchaseOrderDetails(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $po = $grn->purchaseOrder;
    if (!$po) {
      return;
    }

    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'PURCHASE ORDER REFERENCE', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 9);
    $pdf->SetFont('helvetica', '', 11);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $fields = [
      ['PO Number:', $po->po_number ?? 'N/A'],
      ['PO Type:', $po->type === 'lpo' ? 'LPO (Goods)' : 'LSO (Services)'],
      ['PO Status:', ucfirst($po->status_label ?? $po->status ?? 'N/A')],
      ['Issue Date:', $this->formatDate($po->issue_date)],
      ['Expected Delivery:', $this->formatDate($po->expected_delivery_date)],
      ['PO Total:', number_format((float)($po->total_amount ?? 0), 2)],
    ];

    $x = 15;
    $colWidth = 90;
    $rowHeight = 6.5;

    for ($i = 0; $i < count($fields); $i += 2) {
      $pdf->SetX($x);
      $pdf->SetFont('helvetica', 'B', 11);
      $pdf->Cell(40, $rowHeight, $fields[$i][0], 0, 0);
      $pdf->SetFont('helvetica', '', 11);
      $pdf->Cell(50, $rowHeight, $fields[$i][1], 0, 0);

      if (isset($fields[$i + 1])) {
        $pdf->SetX($x + $colWidth + 5);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(40, $rowHeight, $fields[$i + 1][0], 0, 0);
        $pdf->SetFont('helvetica', '', 11);
        $pdf->Cell(50, $rowHeight, $fields[$i + 1][1], 0, 1);
      } else {
        $pdf->Ln($rowHeight);
      }
    }

    $pdf->Ln(2);
    $pdf->SetDrawColor(200, 200, 200);
    $pdf->SetLineWidth(0.4);
    $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
    $pdf->Ln(2);
  }

  /**
   * Render Items Table - With CONDITION column instead of Description
   */
  protected function renderItemsTable(Fpdi $pdf, $items, GoodsReceivedNote $grn): int
  {
    if (empty($items)) {
      Log::warning('[PDF] No items found for GRN: ' . $grn->id);
      return 0;
    }

    $pageCount = 1;
    $y = $pdf->GetY();

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'RECEIVED ITEMS', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 7);
    $pdf->SetX(15);

    // Table Header - Blue with CONDITION instead of DESCRIPTION
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetFillColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->SetTextColor(255, 255, 255);

    $pdf->Cell(8, 8, '#', 1, 0, 'C', 1);
    $pdf->Cell(50, 8, 'Item Name', 1, 0, 'L', 1);
    $pdf->Cell(40, 8, 'Condition', 1, 0, 'L', 1);
    $pdf->Cell(15, 8, 'UOM', 1, 0, 'C', 1);
    $pdf->Cell(15, 8, 'Qty', 1, 0, 'C', 1);
    $pdf->Cell(25, 8, 'Unit Price', 1, 0, 'R', 1);
    $pdf->Cell(25, 8, 'Total', 1, 1, 'R', 1);

    // Table Body - with alternating blue-tinted rows
    $pdf->SetFont('helvetica', '', 11);
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
        $pdf->SetX(15);
        $pageCount++;

        $pdf->SetFont('helvetica', 'B', 13);
        $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
        $pdf->Cell(180, 8, 'RECEIVED ITEMS (Continued)', 0, 1, 'L');

        $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
        $pdf->SetLineWidth(0.8);
        $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

        $pdf->SetY($pdf->GetY() + 7);
        $pdf->SetX(15);

        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetFillColor($this->primary[0], $this->primary[1], $this->primary[2]);
        $pdf->SetTextColor(255, 255, 255);

        $pdf->Cell(8, 8, '#', 1, 0, 'C', 1);
        $pdf->Cell(50, 8, 'Item Name', 1, 0, 'L', 1);
        $pdf->Cell(40, 8, 'Condition', 1, 0, 'L', 1);
        $pdf->Cell(15, 8, 'UOM', 1, 0, 'C', 1);
        $pdf->Cell(15, 8, 'Qty', 1, 0, 'C', 1);
        $pdf->Cell(25, 8, 'Unit Price', 1, 0, 'R', 1);
        $pdf->Cell(25, 8, 'Total', 1, 1, 'R', 1);
        $pdf->SetFont('helvetica', '', 11);
        $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
      }

      $pdf->SetX(15);

      // Alternating row colors - blue tinted
      if ($fill) {
        $pdf->SetFillColor(225, 235, 250); // Light blue tint
      } else {
        $pdf->SetFillColor(245, 248, 255); // Very light blue
      }

      $itemTotal = (float)($item->received_quantity ?? 0) * (float)($item->unit_price ?? 0);
      $subtotal += $itemTotal;
      $quantity = (float)($item->received_quantity ?? 0);

      // Get condition/quality status
      $condition = $item->condition_notes ?? $item->quality_status_label ?? '-';
      if (strlen($condition) > 35) {
        $condition = substr($condition, 0, 33) . '...';
      }

      $pdf->Cell(8, 7, $counter, 1, 0, 'C', true);
      $pdf->Cell(50, 7, $item->item_name ?? 'N/A', 1, 0, 'L', true);
      $pdf->Cell(40, 7, $condition, 1, 0, 'L', true);
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
  protected function renderTotals(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $subtotal = $this->subtotal ?? 0;
    $totalAmount = (float)($grn->total_value ?? $subtotal);
    $taxAmount = (float)($grn->total_tax ?? 0);
    $discountAmount = (float)($grn->total_discount ?? 0);
    $netTotal = (float)($grn->net_total ?? ($totalAmount + $taxAmount - $discountAmount));

    $x = 115;
    $pdf->SetX($x);
    $pdf->SetFont('helvetica', '', 11);
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
    $pdf->SetFont('helvetica', 'B', 13);
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
   * Render Terms
   */
  protected function renderTerms(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $y = $pdf->GetY();

    if ($y > 230) {
      $pdf->AddPage();
      $this->setPageBackground($pdf);
      $this->addLogoWatermark($pdf);
      $pdf->SetY(25);
      $y = $pdf->GetY();
    }

    $pdf->SetY($y);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'B', 13);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(180, 8, 'TERMS AND CONDITIONS', 0, 1, 'L');

    $pdf->SetDrawColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->SetLineWidth(0.8);
    $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);

    $pdf->SetY($pdf->GetY() + 5);
    $pdf->SetX(18);
    $pdf->SetFont('helvetica', '', 11);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    $terms = [
      '1. This Goods Received Note confirms receipt of goods as listed above.',
      '2. Goods received are subject to quality inspection as per the purchase order.',
      '3. Any discrepancies must be reported within 7 days of receipt.',
      '4. The supplier is responsible for any damages or shortages identified.',
      '5. This document serves as proof of delivery and acceptance.',
      '6. This document is generated after correct receipt of the goods.',
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
  protected function renderFooterNote(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $y = $pdf->GetY();

    // Check if we need a new page
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
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    // Get PO number
    $poNumber = $grn->purchaseOrder?->po_number ?? 'N/A';

    // Simple note text
    $note = "This Goods Received Note (GRN) confirms receipt of goods from the supplier. ";
    $note .= "The attached Purchase Order (" . $poNumber . ") is provided for reference and verification. ";
    $note .= "This document is electronically generated and serves as proof of delivery and acceptance.";

    $pdf->MultiCell(180, 5.5, $note, 0, 'L');

    $pdf->SetY($pdf->GetY() + 2);
    $pdf->SetX(15);
    $pdf->SetFont('helvetica', 'I', 9);
    $pdf->SetTextColor(150, 150, 150);
    $pdf->Cell(180, 4.5, 'This document is electronically generated and requires no physical signature.', 0, 1, 'L');

    $pdf->Ln(2);
  }

  /**
   * APPEND PURCHASE ORDER PDF - STARTS ON A CLEAN NEW PAGE
   * Same approach as appending Supplier Quotation in PurchaseOrderPdfRenderer
   */
  protected function appendPurchaseOrderPDF(Fpdi $pdf, GoodsReceivedNote $grn): void
  {
    $purchaseOrder = $grn->purchaseOrder;

    if (!$purchaseOrder) {
      Log::warning('[PDF] No Purchase Order to append for GRN: ' . $grn->grn_number);
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
      $purchaseOrder = $this->grn?->purchaseOrder;
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
