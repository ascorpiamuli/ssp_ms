<?php
// app/Services/Procurement/PDF/RequestForQuotationPdfRenderer.php

declare(strict_types=1);

namespace App\Services\Procurement\PDF;

use TCPDF;
use App\Models\QuotationRequest;
use App\Models\Approval;
use App\Models\User;
use App\Models\SignatureSpecimen;
use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use Illuminate\Support\Facades\Log;

class RequestForQuotationPdfRenderer extends BasePdfRenderer
{
  private QRCodeServiceInterface $qrCodeService;
  private bool $copyLabelRendered = false;
  private int $downloadCount = 0;
  private string $copyLabel = '';
  private array $copyColors = [];

  public function __construct(QRCodeServiceInterface $qrCodeService)
  {
    parent::__construct();
    $this->qrCodeService = $qrCodeService;

    // Define copy colors for different download counts
    $this->copyColors = [
      0 => ['bg' => [200, 50, 50], 'text' => [255, 255, 255], 'label' => 'ORIGINAL'],
      1 => ['bg' => [0, 150, 200], 'text' => [255, 255, 255], 'label' => 'COPY 1'],
      2 => ['bg' => [200, 150, 0], 'text' => [255, 255, 255], 'label' => 'COPY 2'],
      3 => ['bg' => [150, 0, 150], 'text' => [255, 255, 255], 'label' => 'COPY 3'],
      4 => ['bg' => [0, 150, 0], 'text' => [255, 255, 255], 'label' => 'COPY 4'],
      5 => ['bg' => [200, 0, 150], 'text' => [255, 255, 255], 'label' => 'COPY 5'],
    ];
  }

  public function render(QuotationRequest $quotation): string
  {
    Log::info('=== PDF GENERATION START ===');
    Log::info('[PDF] Quotation ID: ' . $quotation->id);
    Log::info('[PDF] RFQ Number: ' . $quotation->qtn_number);
    Log::info('[PDF] Download Count: ' . ($quotation->download_count ?? 0));

    // Store download count for copy labeling
    $this->downloadCount = $quotation->download_count ?? 0;
    $this->copyLabel = $this->getCopyLabel($this->downloadCount);

    $this->loadCompanyProfile();
    $this->applyCompanyColors();
    $this->loadAndOptimizeLogo();

    if (in_array($quotation->status, ['cancelled', 'expired'])) {
      $this->setWatermarkText(strtoupper($quotation->status));
    }

    $pdf = $this->initPdf($quotation->qtn_number);

    $this->addLogoWatermark($pdf);

    if ($this->watermarkText) {
      $this->addWatermarkText($pdf, $this->watermarkText);
    }

    // ✅ Render CONFIDENTIAL label at top right (replacing COPY label)
    $this->renderConfidentialLabel($pdf);

    $this->renderHeader($pdf, $quotation);
    $this->renderQuotationInfo($pdf, $quotation);
    $this->renderRequisitionInfo($pdf, $quotation);
    $this->renderItemsTable($pdf, $quotation);
    $this->renderApprovers($pdf, $quotation);
    $this->renderTerms($pdf, $quotation);
    $this->renderSignatures($pdf, $quotation);

    $this->cleanupTempFiles();

    Log::info('=== PDF GENERATION COMPLETE ===');

    return $pdf->Output('', 'S');
  }

  /**
   * Get the copy label based on download count
   */
  protected function getCopyLabel(int $downloadCount): string
  {
    // After 5 copies, use "COPY N" format
    if ($downloadCount > 5) {
      return 'COPY ' . $downloadCount;
    }

    return $this->copyColors[$downloadCount]['label'] ?? 'ORIGINAL';
  }

  /**
   * Get copy colors based on download count
   */
  protected function getCopyColor(int $downloadCount): array
  {
    if ($downloadCount > 5) {
      // For copies beyond 5, use a dark gray
      return [
        'bg' => [80, 80, 80],
        'text' => [255, 255, 255],
        'label' => 'COPY ' . $downloadCount
      ];
    }

    return $this->copyColors[$downloadCount] ?? $this->copyColors[0];
  }

  /**
   * Render CONFIDENTIAL Label - Top Right, First Page Only
   * Same position, size, and format as the original COPY label
   */
  protected function renderConfidentialLabel(TCPDF $pdf): void
  {
    if ($this->copyLabelRendered) {
      return;
    }

    $y = 2;
    $x = 144; // Position at top right (same as original)

    // Same colors as the original COPY label
    $colors = [
      'bg' => [200, 50, 50],  // Red background (same as ORIGINAL)
      'text' => [255, 255, 255] // White text
    ];

    $pdf->SetY($y);
    $pdf->SetX($x);

    $pdf->SetFillColor($colors['bg'][0], $colors['bg'][1], $colors['bg'][2]);
    $pdf->SetTextColor($colors['text'][0], $colors['text'][1], $colors['text'][2]);
    $pdf->SetFont('helvetica', 'B', 10);

    $label = 'CONFIDENTIAL';
    // Same width calculation as original
    $width = strlen($label) * 6 + 10;
    if ($width < 40) $width = 40;
    if ($width > 65) $width = 65;

    // Rounded rectangle with border - same as original
    $pdf->RoundedRect($x, $y, $width, 7, 2, '1111', 'F');

    // Center the text - same as original
    $pdf->SetXY($x + 2, $y + 1.5);
    $pdf->Cell($width - 4, 4, $label, 0, 1, 'C');

    // Reset text color
    $pdf->SetTextColor(0, 0, 0);

    $this->copyLabelRendered = true;
  }

  protected function generateQrCode(string $data): ?string
  {
    return $this->qrCodeService->generateQrCode($data);
  }

  /**
   * Render Header with Title moved here
   */
  protected function renderHeader(TCPDF $pdf, QuotationRequest $quotation): void
  {
    $pdf->SetY(15);

    // QR CODE
    $this->renderQrCode($pdf, $quotation);

    // LOGO
    $this->renderLogo($pdf);

    // COMPANY INFO
    $this->renderCompanyInfo($pdf);

    $this->addHeaderLine($pdf, 48);

    // REQUEST FOR QUOTATION
    $pdf->SetY(55);
    $pdf->SetFont('helvetica', 'B', 20);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(0, 9, 'REQUEST FOR QUOTATION', 0, 1, 'C');

    // RFQ Number
    $pdf->SetY(64);
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->SetTextColor($this->secondary[0], $this->secondary[1], $this->secondary[2]);
    $pdf->Cell(0, 9, $quotation->qtn_number, 0, 1, 'C');

    // ✅ Title - moved here (below RFQ number)
    $pdf->SetY(74);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
    $pdf->Cell(0, 6, $quotation->title, 0, 1, 'C');

    $pdf->SetY(82);
  }

  protected function renderQrCode(TCPDF $pdf, QuotationRequest $quotation): void
  {
    $frontendUrl = config('app.frontend_url') ?? env('FRONTEND_URL', 'https://sspmis.pasbestventures.com');
    $qrData = $frontendUrl . '/quotations/' . $quotation->id . '/view';
    $qrData = "RFQ: " . $quotation->qtn_number . " | " . $qrData;

    $qrPath = $this->generateQrCode($qrData);
    if ($qrPath && file_exists($qrPath)) {
      $pdf->Image($qrPath, 95, 12, 20, 20);
      $this->qrCodeService->cleanupTempFiles($qrPath);
      Log::info('[PDF] QR Code added to PDF');
    }
  }

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
   * Render Quotation Info - Title removed, replaced with RFQ Type
   */
  protected function renderQuotationInfo(TCPDF $pdf, QuotationRequest $quotation): void
  {
    $pdf->SetX(15);
    $this->addSectionHeader($pdf, 'REQUEST FOR QUOTATION INFORMATION');

    // Keep original formatting - no bolding
    // Title removed - now using RFQ Type instead
    $this->addFieldPair($pdf, 'RFQ Type', $quotation->type ?? 'Standard', 15, 28, 55, false);
    $this->addFieldPair($pdf, 'Issue Date', $this->formatDate($quotation->issue_date), 110, 30, 0, true);

    $this->addFieldPair($pdf, 'Closing Date', $this->formatDate($quotation->closing_date), 15, 28, 55, false);
    $this->addFieldPair($pdf, 'Closing Time', $this->formatDate($quotation->closing_time, 'H:i'), 110, 30, 0, true);

    $pdf->Ln(5);
  }

  protected function renderRequisitionInfo(TCPDF $pdf, QuotationRequest $quotation): void
  {
    $requisition = $quotation->requisition;

    $pdf->SetX(15);
    $this->addSectionHeader($pdf, 'REQUISITION INFORMATION');

    // Keep original formatting - no bolding
    $this->addFieldPair($pdf, 'Requisition No.', $requisition->reference_number, 15, 40, 55, false);
    $this->addFieldPair($pdf, 'Department', $requisition->department->name ?? 'N/A', 110, 35, 0, true);

    $this->addFieldPair($pdf, 'Priority', ucfirst($requisition->priority ?? 'Normal'), 15, 40, 55, false);
    $this->addFieldPair($pdf, 'Status', ucfirst($requisition->status ?? 'Pending'), 110, 35, 0, true);

    $pdf->Ln(5);
  }

  protected function renderItemsTable(TCPDF $pdf, QuotationRequest $quotation): void
  {
    $items = $this->getItemsArray($quotation);

    if (empty($items)) {
      return;
    }

    $y = $pdf->GetY();

    if ($y > 180) {
      $pdf->AddPage();
      $this->addLogoWatermark($pdf);
      if ($this->watermarkText) {
        $this->addWatermarkText($pdf, $this->watermarkText);
      }
      $y = 20;
      $pdf->SetY($y);
    }

    $pdf->SetX(15);
    $this->addSectionHeader($pdf, 'ITEMS REQUIRED');

    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetFillColor(187, 222, 251);
    $pdf->SetTextColor(0, 0, 0);

    $pdf->Cell(9, 9, '#', 1, 0, 'C', 1);
    $pdf->Cell(60, 9, 'Item Name', 1, 0, 'L', 1);
    $pdf->Cell(18, 9, 'UOM', 1, 0, 'C', 1);
    $pdf->Cell(18, 9, 'Qty', 1, 0, 'C', 1);
    $pdf->Cell(22, 9, 'Delivery', 1, 0, 'C', 1);
    $pdf->Cell(40, 9, 'Specifications', 1, 1, 'C', 1);

    $pdf->SetFont('helvetica', '', 10);
    $fill = false;
    $counter = 1;

    foreach ($items as $item) {
      $pdf->SetFillColor($fill ? 248 : 255, $fill ? 249 : 255, $fill ? 250 : 255);

      $pdf->Cell(9, 8, $counter, 1, 0, 'C', true);
      $pdf->Cell(60, 8, $item['item_name'] ?? $item['name'] ?? '', 1, 0, 'L', true);
      $pdf->Cell(18, 8, $item['unit_of_measure'] ?? $item['unit'] ?? '', 1, 0, 'C', true);
      $pdf->Cell(18, 8, number_format((float)($item['quantity'] ?? 0), 0), 1, 0, 'R', true);
      $pdf->Cell(22, 8, $item['delivery_days'] ?? '-', 1, 0, 'C', true);
      $pdf->Cell(40, 8, $item['specifications'] ?? '', 1, 1, 'L', true);

      $fill = !$fill;
      $counter++;
    }

    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetFillColor(227, 242, 253);
    $pdf->SetTextColor($this->primary[0], $this->primary[1], $this->primary[2]);
    $pdf->Cell(143, 9, 'TOTAL ITEMS:', 1, 0, 'R', true);
    $pdf->Cell(25, 9, count($items), 1, 1, 'C', true);

    $pdf->Ln(5);
  }

  protected function renderApprovers(TCPDF $pdf, QuotationRequest $quotation): void
  {
    $requisition = $quotation->requisition;

    $approvals = Approval::where('requisition_id', $requisition->id)
      ->orderBy('created_at', 'ASC')
      ->get();

    if ($approvals->count() == 0 && !$requisition->hod_approver_id) {
      return;
    }

    $y = $pdf->GetY();

    if ($y > 210) {
      $pdf->AddPage();
      $this->addLogoWatermark($pdf);
      if ($this->watermarkText) {
        $this->addWatermarkText($pdf, $this->watermarkText);
      }
      $y = 20;
      $pdf->SetY($y);
    }

    $pdf->SetX(15);
    $this->addSectionHeader($pdf, 'APPROVERS');

    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetFillColor(187, 222, 251);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(50, 9, 'Role', 1, 0, 'L', 1);
    $pdf->Cell(65, 9, 'Name', 1, 0, 'L', 1);
    $pdf->Cell(30, 9, 'Status', 1, 0, 'C', 1);
    $pdf->Cell(35, 9, 'Date', 1, 1, 'C', 1);

    $approvers = $this->buildApproversList($requisition, $approvals);

    $pdf->SetFont('helvetica', '', 10);
    $fill = false;

    foreach ($approvers as $approver) {
      $pdf->SetFillColor($fill ? 248 : 255, $fill ? 249 : 255, $fill ? 250 : 255);

      $isApproved = $approver['status'] == 'Approved';
      $statusColor = $isApproved ? $this->success : $this->warning;

      $pdf->Cell(50, 8, $approver['role'], 1, 0, 'L', true);
      $pdf->Cell(65, 8, $approver['name'], 1, 0, 'L', true);

      $pdf->SetTextColor($statusColor[0], $statusColor[1], $statusColor[2]);
      $pdf->Cell(30, 8, $approver['status'], 1, 0, 'C', true);
      $pdf->SetTextColor(0, 0, 0);

      $dateValue = $approver['date'] ? $this->formatDate($approver['date']) : '-';
      $pdf->Cell(35, 8, $dateValue, 1, 1, 'C', true);

      $fill = !$fill;
    }

    $pdf->Ln(5);
  }

  protected function buildApproversList($requisition, $approvals): array
  {
    $approvers = [];
    $levelMap = [
      'hod' => 'Head of Department',
      'accountant' => 'Accountant/Finance',
      'principal' => 'Principal/Head of Institution',
      'final' => 'Director/Finance Administrator',
    ];

    if ($approvals->count() > 0) {
      foreach ($approvals as $approval) {
        $level = $levelMap[$approval->level] ?? ucfirst($approval->level);
        $approverName = $this->getUserName($approval->approver_id);

        $status = 'Pending';
        $date = null;

        if ($approval->status === 'approved' || $approval->approved_at) {
          $status = 'Approved';
          $date = $approval->approved_at;
        } elseif ($approval->status === 'declined' || $approval->declined_at) {
          $status = 'Declined';
          $date = $approval->declined_at;
        }

        $approvers[] = [
          'role' => $level,
          'name' => $approverName,
          'status' => $status,
          'date' => $date,
        ];
      }
    } else {
      $fields = [
        ['hod_approver_id', 'hod_approved_at', 'Head of Department'],
        ['accountant_approver_id', 'accountant_approved_at', 'Accountant/Finance'],
        ['principal_approver_id', 'principal_approved_at', 'Principal/Head of Institution'],
        ['final_approver_id', 'final_approved_at', 'Director/Finance Administrator'],
      ];

      foreach ($fields as $field) {
        $userId = $requisition->{$field[0]};
        $date = $requisition->{$field[1]};
        $name = $userId ? $this->getUserName($userId) : 'Not Assigned';
        $status = $date ? 'Approved' : 'Pending';

        $approvers[] = [
          'role' => $field[2],
          'name' => $name,
          'status' => $status,
          'date' => $date,
        ];
      }
    }

    return $approvers;
  }

  protected function getUserName(?int $userId): string
  {
    if (!$userId) return 'Not Assigned';
    $user = User::find($userId);
    if (!$user) return 'Unknown';
    return $user->full_name ?? ($user->first_name . ' ' . $user->last_name);
  }

  protected function renderTerms(TCPDF $pdf, QuotationRequest $quotation): void
  {
    $y = $pdf->GetY();

    if ($y > 230) {
      $pdf->AddPage();
      $this->addLogoWatermark($pdf);
      if ($this->watermarkText) {
        $this->addWatermarkText($pdf, $this->watermarkText);
      }
      $y = 20;
      $pdf->SetY($y);
    }

    $pdf->SetY($y + 2);
    $pdf->SetX(15);
    $this->addSectionHeader($pdf, 'TERMS AND CONDITIONS');

    $terms = [
      '1. This Request for Quotation is for the supply of goods/services as listed above.',
      '2. Suppliers must quote with their best prices inclusive of all taxes.',
      '3. Delivery must be made within the specified timeframe.',
      '4. Payment terms: ' . ($quotation->payment_terms ?? 'As per school policy'),
      '5. Delivery terms: ' . ($quotation->delivery_terms ?? 'As per school policy'),
      '6. The school reserves the right to accept or reject any quotation.',
      '7. Acceptance of quotation constitutes a binding contract.',
    ];

    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
    $pdf->SetX(18);

    foreach ($terms as $term) {
      $pdf->MultiCell(175, 6, $term, 0, 'L');
      $pdf->SetX(18);
    }

    $pdf->Ln(2);
  }

  protected function renderSignatures(TCPDF $pdf, QuotationRequest $quotation): void
  {
    $y = $pdf->GetY() + 2;

    if ($y > 245) {
      $pdf->AddPage();
      $this->addLogoWatermark($pdf);
      if ($this->watermarkText) {
        $this->addWatermarkText($pdf, $this->watermarkText);
      }
      $y = 20;
      $pdf->SetY($y);
    }

    $signatures = $this->getSignatureSpecimens($quotation);

    if (!empty($signatures)) {
      $this->renderDigitalSignatures($pdf, $signatures);
    } else {
      $this->renderFallbackSignatures($pdf);
    }

    $pdf->SetFont('helvetica', 'I', 9);
    $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
    $pdf->Cell(0, 6, 'NOTE: Please print and sign in duplicate (Original: Procurement, Duplicate: Supplier)', 0, 1, 'C');
  }

  /**
   * Render Digital Signatures with QR Codes - Arranged in Approval Order
   */
  protected function renderDigitalSignatures(TCPDF $pdf, array $signatures): void
  {
    $pdf->SetX(15);
    $this->addSectionHeader($pdf, 'DIGITAL APPROVER SIGNATURES');

    // Define approval order
    $approvalOrder = [
      'hod' => 1,
      'accountant' => 2,
      'principal' => 3,
      'final' => 4,
    ];

    // Sort signatures by approval order
    uasort($signatures, function ($a, $b) use ($approvalOrder) {
      $levelA = $a->approval_level ?? 'hod';
      $levelB = $b->approval_level ?? 'hod';

      $orderA = $approvalOrder[$levelA] ?? 99;
      $orderB = $approvalOrder[$levelB] ?? 99;

      return $orderA <=> $orderB;
    });

    $numPerRow = 4;
    $totalSignatures = count($signatures);
    $rows = ceil($totalSignatures / $numPerRow);

    $usableWidth = 180;
    $padding = 4;
    $colWidth = ($usableWidth - ($padding * ($numPerRow - 1))) / $numPerRow;
    $qrSize = 18;
    $rowHeight = 50;

    $pdf->SetY($pdf->GetY() + 2);
    $startY = $pdf->GetY();

    $signaturesArray = array_values($signatures);

    for ($row = 0; $row < $rows; $row++) {
      for ($col = 0; $col < $numPerRow; $col++) {
        $index = ($row * $numPerRow) + $col;
        if ($index >= $totalSignatures) break;

        $specimen = $signaturesArray[$index];
        $user = $specimen->user;
        $fullName = $user ? ($user->full_name ?? $user->first_name . ' ' . $user->last_name) : 'Unknown';
        $roleLabel = $user->role_label ?? 'Approver';

        $x = 15 + ($col * ($colWidth + $padding));
        $yBlock = $startY + ($row * $rowHeight);

        if ($yBlock + $rowHeight > 270) {
          $pdf->AddPage();
          $this->addLogoWatermark($pdf);
          if ($this->watermarkText) {
            $this->addWatermarkText($pdf, $this->watermarkText);
          }
          $startY = 20;
          $yBlock = $startY + ($row * $rowHeight);
        }

        $pdf->SetY($yBlock);

        // QR Code
        $qrX = $x + (($colWidth - $qrSize) / 2);
        $this->renderSignatureQrCode($pdf, $specimen, $qrX, $yBlock + 2, $qrSize);

        // "Scan to verify signature" label
        $labelY = $yBlock + $qrSize + 3;
        $pdf->SetFont('helvetica', 'I', 6);
        $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
        $pdf->SetXY($x, $labelY);
        $pdf->Cell($colWidth, 3, 'Scan to verify signature', 0, 0, 'C');

        // Name and Role
        $textY = $labelY + 4;

        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
        $pdf->SetXY($x, $textY);
        $pdf->Cell($colWidth, 4, $fullName, 0, 0, 'C');

        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
        $pdf->SetXY($x, $textY + 4);
        $pdf->Cell($colWidth, 3, $roleLabel, 0, 0, 'C');

        // Signature line
        $lineY = $textY + 10;
        $pdf->SetY($lineY);
        $pdf->SetX($x);
        $pdf->SetFont('helvetica', '', 7);
        $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
        $pdf->Cell($colWidth, 3, '___________________', 0, 0, 'C');

        $pdf->SetY($lineY + 4);
        $pdf->SetX($x);
        $pdf->SetFont('helvetica', '', 6);
        $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
        $pdf->Cell($colWidth, 2, 'Signature', 0, 0, 'C');
      }
    }

    $pdf->SetY($startY + ($rows * $rowHeight) + 5);
  }

  /**
   * Render Signature QR Code
   */
  protected function renderSignatureQrCode(TCPDF $pdf, SignatureSpecimen $specimen, float $x, float $y, float $size): void
  {
    if (!$specimen->qr_code_image) {
      $pdf->Rect($x, $y, $size, $size, 'D');
      $pdf->SetFont('helvetica', '', 8);
      $pdf->SetXY($x, $y + 8);
      $pdf->Cell($size, 4, 'No QR', 0, 0, 'C');
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

  protected function renderFallbackSignatures(TCPDF $pdf): void
  {
    $pdf->SetX(15);
    $this->addSectionHeader($pdf, 'SIGNATURES');

    $pdf->SetY($pdf->GetY() + 2);

    $signatureLines = [
      ['Prepared By', '___________________', '___________________'],
      ['Approved By', '___________________', '___________________'],
      ['Received By', '___________________', '___________________'],
    ];

    $width = 180 / count($signatureLines);
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);

    foreach ($signatureLines as $i => $sig) {
      $x = 15 + ($i * $width);

      $pdf->SetX($x);
      $pdf->SetFont('helvetica', 'B', 10);
      $pdf->Cell($width, 6, $sig[0], 0, 0, 'C');

      $pdf->SetY($pdf->GetY() + 10);
      $pdf->SetX($x);
      $pdf->SetFont('helvetica', '', 10);
      $pdf->SetTextColor($this->textLight[0], $this->textLight[1], $this->textLight[2]);
      $pdf->Cell($width, 6, 'Signature: ' . $sig[1], 0, 0, 'C');

      $pdf->SetY($pdf->GetY() + 8);
      $pdf->SetX($x);
      $pdf->SetTextColor($this->textDark[0], $this->textDark[1], $this->textDark[2]);
      $pdf->Cell($width, 6, 'Date: ' . $sig[2], 0, 0, 'C');

      $pdf->SetY($pdf->GetY() - 18);
    }

    $pdf->SetY($pdf->GetY() + 24);
  }

  protected function getItemsArray(QuotationRequest $quotation): array
  {
    $items = $quotation->requisition->items ?? [];
    if ($items instanceof \Illuminate\Database\Eloquent\Collection) {
      return $items->toArray();
    }
    return is_array($items) ? $items : [];
  }

  protected function getSignatureSpecimens(QuotationRequest $quotation): array
  {
    $requisition = $quotation->requisition;
    $approverIds = $this->getApproverIds($requisition);

    if (empty($approverIds)) {
      return [];
    }

    $specimens = SignatureSpecimen::whereIn('user_id', $approverIds)
      ->where('is_verified', true)
      ->where('status', 'approved')
      ->with('user')
      ->get();

    $signatures = [];
    foreach ($specimens as $specimen) {
      // Get approval level for sorting
      $specimen->approval_level = $this->getApprovalLevel($requisition, $specimen->user_id);
      $signatures[$specimen->user_id] = $specimen;
    }

    return $signatures;
  }

  /**
   * Get approval level for a user
   */
  protected function getApprovalLevel($requisition, int $userId): string
  {
    $levelMap = [
      'hod_approver_id' => 'hod',
      'accountant_approver_id' => 'accountant',
      'principal_approver_id' => 'principal',
      'final_approver_id' => 'final',
    ];

    foreach ($levelMap as $field => $level) {
      if ($requisition->{$field} == $userId) {
        return $level;
      }
    }

    // Check approvals table
    $approval = Approval::where('requisition_id', $requisition->id)
      ->where('approver_id', $userId)
      ->first();

    if ($approval) {
      return $approval->level ?? 'hod';
    }

    return 'hod';
  }

  protected function getApproverIds($requisition): array
  {
    $approverIds = [];

    $approvals = Approval::where('requisition_id', $requisition->id)
      ->orderBy('created_at', 'ASC')
      ->get();

    if ($approvals->count() > 0) {
      foreach ($approvals as $approval) {
        if ($approval->approver_id) {
          $approverIds[] = $approval->approver_id;
        }
      }
    } else {
      $fields = ['hod_approver_id', 'accountant_approver_id', 'principal_approver_id', 'final_approver_id'];
      foreach ($fields as $field) {
        if ($requisition->{$field}) {
          $approverIds[] = $requisition->{$field};
        }
      }
    }

    return array_unique(array_filter($approverIds));
  }
}
