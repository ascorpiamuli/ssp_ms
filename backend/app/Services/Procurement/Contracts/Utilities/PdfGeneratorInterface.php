<?php
// app/Services/Procurement/Contracts/Utilities/PdfGeneratorInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Utilities;

interface PdfGeneratorInterface
{
  /**
   * Generate a Quotation PDF.
   */
  public function generateQuotation($quotation): string;

  /**
   * Generate a Purchase Order PDF.
   */
  public function generatePurchaseOrder($purchaseOrder): string;

  /**
   * Generate a Goods Received Note PDF.
   */
  public function generateGrn($grn): string;

  /**
   * Generate a Service Acknowledgment Note PDF.
   */
  public function generateSan($san): string;

  /**
   * Generate an Invoice PDF.
   */
  public function generateInvoice($invoice): string;

  /**
   * Generate a Payment Voucher PDF.
   */
  public function generatePaymentVoucher($voucher): string;

  /**
   * Generate a Cheque PDF.
   */
  public function generateCheque($cheque): string;

  /**
   * Generate a Contract PDF.
   */
  public function generateContract($contract): string;

  /**
   * Generate a Tender PDF.
   */
  public function generateTender($tender): string;

  /**
   * Generate a report PDF.
   */
  public function generateReport(string $reportType, array $data): string;

  /**
   * Save PDF to storage.
   */
  public function savePdf(string $content, string $filename, string $path = null): string;

  /**
   * Stream PDF to browser.
   */
  public function streamPdf(string $content, string $filename): void;

  /**
   * Download PDF as attachment.
   */
  public function downloadPdf(string $content, string $filename): void;

  /**
   * Set PDF configuration.
   */
  public function setConfig(array $config): void;

  /**
   * Get PDF configuration.
   */
  public function getConfig(): array;

  /**
   * Add watermark to PDF.
   */
  public function addWatermark(string $content, string $text): string;



  /**
   * Add digital signature to PDF.
   */
  public function addDigitalSignature(string $content, string $certificatePath, string $password): string;

  /**
   * Merge multiple PDFs.
   */
  public function mergePdfs(array $pdfContents): string;

  /**
   * Get PDF metadata.
   */
  public function getPdfMetadata(string $content): array;

  /**
   * Validate PDF integrity.
   */
  public function validatePdf(string $content): bool;

  /**
   * Extract text from PDF.
   */
  public function extractText(string $content): string;

}
