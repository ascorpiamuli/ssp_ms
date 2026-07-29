<?php
// app/Services/Procurement/Utilities/PdfGenerator.php

declare(strict_types=1);

namespace App\Services\Procurement\Utilities;

use App\Services\Procurement\Contracts\Utilities\PdfGeneratorInterface;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use TCPDF;

class PdfGenerator implements PdfGeneratorInterface
{
  protected array $config;
  protected string $storagePath = 'procurement/pdfs/';

  public function __construct()
  {
    $this->config = [
      'paper_size' => 'A4',
      'orientation' => 'P',
      'font' => 'helvetica',
      'font_size' => 10,
      'margin_left' => 15,
      'margin_right' => 15,
      'margin_top' => 15,
      'margin_bottom' => 15,
      'header_height' => 20,
      'footer_height' => 10,
    ];
  }

  public function generateQuotation($quotation): string
  {
    $pdf = $this->initPdf('Quotation Request');
    $html = $this->renderQuotationHtml($quotation);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generatePurchaseOrder($purchaseOrder): string
  {
    $pdf = $this->initPdf('Purchase Order');
    $html = $this->renderPurchaseOrderHtml($purchaseOrder);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generateGrn($grn): string
  {
    $pdf = $this->initPdf('Goods Received Note');
    $html = $this->renderGrnHtml($grn);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generateSan($san): string
  {
    $pdf = $this->initPdf('Service Acknowledgment Note');
    $html = $this->renderSanHtml($san);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generateInvoice($invoice): string
  {
    $pdf = $this->initPdf('Invoice');
    $html = $this->renderInvoiceHtml($invoice);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generatePaymentVoucher($voucher): string
  {
    $pdf = $this->initPdf('Payment Voucher');
    $html = $this->renderPaymentVoucherHtml($voucher);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generateCheque($cheque): string
  {
    $pdf = $this->initPdf('Cheque');
    $html = $this->renderChequeHtml($cheque);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generateContract($contract): string
  {
    $pdf = $this->initPdf('Contract');
    $html = $this->renderContractHtml($contract);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generateTender($tender): string
  {
    $pdf = $this->initPdf('Tender');
    $html = $this->renderTenderHtml($tender);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

  public function generateReport(string $reportType, array $data): string
  {
    $pdf = $this->initPdf('Report - ' . ucwords(str_replace('_', ' ', $reportType)));
    $html = $this->renderReportHtml($reportType, $data);
    $pdf->writeHTML($html);
    return $pdf->Output('', 'S');
  }

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

  public function setConfig(array $config): void
  {
    $this->config = array_merge($this->config, $config);
  }

  public function getConfig(): array
  {
    return $this->config;
  }

  public function addWatermark(string $content, string $text): string
  {
    // This would require PDF manipulation library
    // For now, return the content unchanged
    return $content;
  }

  public function addDigitalSignature(string $content, string $certificatePath, string $password): string
  {
    // This would require PDF signing library
    // For now, return the content unchanged
    return $content;
  }

  public function mergePdfs(array $pdfContents): string
  {
    // This would require PDF merging library
    // For now, return the first PDF
    return $pdfContents[0] ?? '';
  }

  public function getPdfMetadata(string $content): array
  {
    // This would require PDF parsing library
    // For now, return empty array
    return [];
  }

  public function validatePdf(string $content): bool
  {
    // Check if content is a valid PDF
    $header = substr($content, 0, 5);
    return $header === '%PDF-';
  }

  public function extractText(string $content): string
  {
    // This would require PDF text extraction library
    // For now, return empty string
    return '';
  }

  /**
   * Initialize TCPDF instance.
   */
  protected function initPdf(string $title): TCPDF
  {
    $pdf = new TCPDF(
      $this->config['orientation'],
      'mm',
      $this->config['paper_size'],
      true,
      'UTF-8',
      false
    );

    $pdf->SetCreator(config('app.name'));
    $pdf->SetAuthor(config('app.name'));
    $pdf->SetTitle($title);
    $pdf->SetSubject($title);
    $pdf->SetKeywords('procurement, ' . strtolower($title));

    // Remove default header/footer
    $pdf->setPrintHeader(false);
    $pdf->setPrintFooter(false);

    // Set margins
    $pdf->SetMargins(
      $this->config['margin_left'],
      $this->config['margin_top'],
      $this->config['margin_right']
    );

    // Set font
    $pdf->SetFont($this->config['font'], '', $this->config['font_size']);

    // Add a page
    $pdf->AddPage();

    // Add branding
    $this->addBranding($pdf);

    return $pdf;
  }

  /**
   * Add school branding to PDF.
   */
  protected function addBranding(TCPDF $pdf): void
  {
    $schoolName = config('app.name');
    $schoolLogo = Storage::exists('public/logo.png') ? 'public/logo.png' : null;

    $html = <<<HTML
        <div style="text-align: center; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 10px;">
            <h1 style="color: #1a237e;">{$schoolName}</h1>
            <p style="font-size: 12px; color: #666;">Procurement Document</p>
        </div>
        HTML;

    $pdf->writeHTML($html);
  }

  /**
   * Render quotation HTML.
   */
  protected function renderQuotationHtml($quotation): string
  {
    return $this->renderView('procurement.pdf.quotation', ['quotation' => $quotation]);
  }

  /**
   * Render purchase order HTML.
   */
  protected function renderPurchaseOrderHtml($purchaseOrder): string
  {
    return $this->renderView('procurement.pdf.purchase_order', ['po' => $purchaseOrder]);
  }

  /**
   * Render GRN HTML.
   */
  protected function renderGrnHtml($grn): string
  {
    return $this->renderView('procurement.pdf.grn', ['grn' => $grn]);
  }

  /**
   * Render SAN HTML.
   */
  protected function renderSanHtml($san): string
  {
    return $this->renderView('procurement.pdf.san', ['san' => $san]);
  }

  /**
   * Render invoice HTML.
   */
  protected function renderInvoiceHtml($invoice): string
  {
    return $this->renderView('procurement.pdf.invoice', ['invoice' => $invoice]);
  }

  /**
   * Render payment voucher HTML.
   */
  protected function renderPaymentVoucherHtml($voucher): string
  {
    return $this->renderView('procurement.pdf.payment_voucher', ['voucher' => $voucher]);
  }

  /**
   * Render cheque HTML.
   */
  protected function renderChequeHtml($cheque): string
  {
    return $this->renderView('procurement.pdf.cheque', ['cheque' => $cheque]);
  }

  /**
   * Render contract HTML.
   */
  protected function renderContractHtml($contract): string
  {
    return $this->renderView('procurement.pdf.contract', ['contract' => $contract]);
  }

  /**
   * Render tender HTML.
   */
  protected function renderTenderHtml($tender): string
  {
    return $this->renderView('procurement.pdf.tender', ['tender' => $tender]);
  }

  /**
   * Render report HTML.
   */
  protected function renderReportHtml(string $reportType, array $data): string
  {
    return $this->renderView("procurement.pdf.reports.{$reportType}", ['data' => $data]);
  }

  /**
   * Render a view.
   */
  protected function renderView(string $view, array $data): string
  {
    if (view()->exists($view)) {
      return view($view, $data)->render();
    }

    // Fallback HTML generation
    return $this->generateFallbackHtml($view, $data);
  }

  /**
   * Generate fallback HTML if view doesn't exist.
   */
  protected function generateFallbackHtml(string $view, array $data): string
  {
    $html = '<h1>' . ucwords(str_replace('_', ' ', $view)) . '</h1>';
    $html .= '<hr>';

    foreach ($data as $key => $value) {
      $html .= '<h3>' . ucwords(str_replace('_', ' ', $key)) . '</h3>';
      if (is_array($value) || is_object($value)) {
        $html .= '<pre>' . print_r($value, true) . '</pre>';
      } else {
        $html .= '<p>' . $value . '</p>';
      }
      $html .= '<hr>';
    }

    return $html;
  }

  /**
   * Get the storage path.
   */
  protected function getStoragePath(): string
  {
    return $this->storagePath;
  }
}
