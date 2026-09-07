<?php
// app/Services/Procurement/Utilities/PdfGenerator.php

declare(strict_types=1);

namespace App\Services\Procurement\Utilities;

use App\Models\SupplierQuotation;
use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use App\Services\Procurement\PDF\PurchaseOrderPdfRenderer;
use App\Services\Procurement\PDF\RequestForQuotationPdfRenderer;
use App\Services\Procurement\PDF\SupplierQuotationPdfRenderer;
use App\Services\Procurement\PDF\GrnPdfRenderer;
use App\Services\Procurement\PDF\SanPdfRenderer;
use App\Services\Signatures\Contracts\Services\QRCodeServiceInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PdfGenerator implements PdfGeneratorInterface
{
  protected string $storagePath = 'procurement/pdfs/';
  protected array $config = [];
  protected QRCodeServiceInterface $qrCodeService;

  /**
   * Constructor with dependency injection
   */
  public function __construct(QRCodeServiceInterface $qrCodeService)
  {
    $this->qrCodeService = $qrCodeService;

    $this->config = [
      'paper_size' => 'A4',
      'orientation' => 'P',
      'font' => 'helvetica',
      'font_size' => 10,
      'margin_left' => 15,
      'margin_right' => 15,
      'margin_top' => 15,
      'margin_bottom' => 15,
    ];
  }

  /**
   * Generate Quotation PDF
   */
  public function generateQuotation($quotation): string
  {
    // Pass the QR Code service to the renderer
    $renderer = new RequestForQuotationPdfRenderer($this->qrCodeService);
    return $renderer->render($quotation);
  }

  /**
   * Generate Supplier Quotation PDF
   *
   * @param \App\Models\SupplierQuotation $supplierQuotation
   * @return string PDF content
   */
  public function generateSupplierQuotation($supplierQuotation): string
  {
    // Use the QuotationPdfRenderer for supplier quotations
    $renderer = new SupplierQuotationPdfRenderer($this->qrCodeService);
    return $renderer->renderWithData($supplierQuotation);
  }

  /**
   * Generate Purchase Order PDF
   */
  public function generatePurchaseOrder($purchaseOrder): string
  {
    $renderer = new PurchaseOrderPdfRenderer($this->qrCodeService);
    return $renderer->renderWithData($purchaseOrder);
  }

  /**
   * Generate GRN PDF
   */
  public function generateGrn($grn): string
  {
    // TODO: Implement GrnPdfRenderer
    $renderer = new GrnPdfRenderer($this->qrCodeService);
    return $renderer->renderWithData($grn);
  }

  /**
   * Generate SAN PDF
   */
  public function generateSan($san): string
  {
    // TODO: Implement SanPdfRenderer
    $renderer = new SanPdfRenderer($this->qrCodeService);
    return $renderer->renderWithData($san);
  }

  /**
   * Generate Invoice PDF
   */
  public function generateInvoice($invoice): string
  {
    // TODO: Implement InvoicePdfRenderer
    return $this->generatePlaceholderPDF('Invoice', $invoice->invoice_number ?? 'N/A');
  }

  /**
   * Generate Payment Voucher PDF
   */
  public function generatePaymentVoucher($voucher): string
  {
    // TODO: Implement PaymentVoucherPdfRenderer
    return $this->generatePlaceholderPDF('Payment Voucher', $voucher->voucher_number ?? 'N/A');
  }

  /**
   * Generate Cheque PDF
   */
  public function generateCheque($cheque): string
  {
    // TODO: Implement ChequePdfRenderer
    return $this->generatePlaceholderPDF('Cheque', $cheque->cheque_number ?? 'N/A');
  }

  /**
   * Generate Contract PDF
   */
  public function generateContract($contract): string
  {
    // TODO: Implement ContractPdfRenderer
    return $this->generatePlaceholderPDF('Contract', $contract->contract_number ?? 'N/A');
  }

  /**
   * Generate Tender PDF
   */
  public function generateTender($tender): string
  {
    // TODO: Implement TenderPdfRenderer
    return $this->generatePlaceholderPDF('Tender', $tender->tender_number ?? 'N/A');
  }

  /**
   * Generate Report PDF
   */
  public function generateReport(string $reportType, array $data): string
  {
    // TODO: Implement ReportPdfRenderer
    return $this->generatePlaceholderPDF('Report - ' . ucwords(str_replace('_', ' ', $reportType)), '');
  }

  /**
   * Save PDF to storage
   */
  public function savePdf(string $content, string $filename, string $path = null): string
  {
    $path = $path ?? $this->storagePath . date('Y/m/d/');
    $fullPath = $path . $filename;

    if (!Str::endsWith($filename, '.pdf')) {
      $fullPath .= '.pdf';
    }

    Storage::put($fullPath, $content);
    return $fullPath;
  }

  /**
   * Stream PDF to browser
   */
  public function streamPdf(string $content, string $filename): void
  {
    if (!Str::endsWith($filename, '.pdf')) {
      $filename .= '.pdf';
    }

    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . $filename . '"');
    header('Cache-Control: private, max-age=0, must-revalidate');
    header('Pragma: public');
    echo $content;
    exit;
  }

  /**
   * Download PDF
   */
  public function downloadPdf(string $content, string $filename): void
  {
    if (!Str::endsWith($filename, '.pdf')) {
      $filename .= '.pdf';
    }

    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . strlen($content));
    echo $content;
    exit;
  }

  /**
   * Set configuration
   */
  public function setConfig(array $config): void
  {
    $this->config = array_merge($this->config, $config);
  }

  /**
   * Get configuration
   */
  public function getConfig(): array
  {
    return $this->config;
  }

  /**
   * Add watermark
   */
  public function addWatermark(string $content, string $text): string
  {
    return $content;
  }

  /**
   * Add digital signature
   */
  public function addDigitalSignature(string $content, string $certificatePath, string $password): string
  {
    return $content;
  }

  /**
   * Merge PDFs
   */
  public function mergePdfs(array $pdfContents): string
  {
    return $pdfContents[0] ?? '';
  }

  /**
   * Get PDF metadata
   */
  public function getPdfMetadata(string $content): array
  {
    return [];
  }

  /**
   * Validate PDF
   */
  public function validatePdf(string $content): bool
  {
    $header = substr($content, 0, 5);
    return $header === '%PDF-';
  }

  /**
   * Extract text from PDF
   */
  public function extractText(string $content): string
  {
    return '';
  }

  /**
   * Generate placeholder PDF for unimplemented types
   */
  protected function generatePlaceholderPDF(string $title, string $reference): string
  {
    $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->SetCreator(config('app.name'));
    $pdf->SetAuthor(config('app.name'));
    $pdf->SetTitle($title);
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);
    $pdf->SetMargins(15, 15, 15);
    $pdf->AddPage();
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 10, $title, 0, 1, 'C');
    $pdf->SetFont('helvetica', '', 12);
    $pdf->Cell(0, 10, 'Reference: ' . $reference, 0, 1, 'C');
    $pdf->SetY(50);
    $pdf->SetFont('helvetica', 'I', 10);
    $pdf->SetTextColor(153, 153, 153);
    $pdf->Cell(0, 10, 'PDF generation for this document type is being implemented.', 0, 1, 'C');
    $pdf->Cell(0, 10, 'Please check back later.', 0, 1, 'C');
    return $pdf->Output('', 'S');
  }

  /**
   * Generate Supplier Quotation PDF with pre-loaded data.
   */
  public function generateSupplierQuotationWithData(SupplierQuotation $quotation): string
  {
    Log::info('[PDF] generateSupplierQuotationWithData - START', [
      'quotation_id' => $quotation->id,
      'supplier_loaded' => $quotation->relationLoaded('supplier'),
    ]);

    // ✅ If supplier is not loaded, load it now
    if (!$quotation->relationLoaded('supplier')) {
      $quotation->load('supplier');
      Log::info('[PDF] Supplier loaded manually');
    }

    // ✅ Load RFQ if not loaded
    if (!$quotation->relationLoaded('quotationRequest')) {
      $quotation->load(['quotationRequest', 'quotationRequest.requisition']);
      Log::info('[PDF] RFQ loaded manually');
    }

    // ✅ Check if supplier exists after loading
    if ($quotation->supplier) {
      Log::info('[PDF] Supplier found after loading', [
        'id' => $quotation->supplier->id,
        'name' => $quotation->supplier->company_name ?? $quotation->supplier->name,
      ]);
    } else {
      Log::warning('[PDF] Supplier still not found after loading');
    }

    $renderer = new SupplierQuotationPdfRenderer($this->qrCodeService);
    return $renderer->renderWithData($quotation);
  }
}
