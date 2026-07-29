<?php
// app/Services/Procurement/Contracts/Services/InvoiceServiceInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Services;

use App\Models\Invoice;
use App\Services\Procurement\DTOs\InvoiceDTO;

interface InvoiceServiceInterface
{
  /**
   * Submit an invoice.
   */
  public function submitInvoice(InvoiceDTO $dto): Invoice;

  /**
   * Get an invoice by ID.
   */
  public function getInvoice(int $invoiceId): Invoice;

  /**
   * Get all invoices for a purchase order.
   */
  public function getInvoicesForPurchaseOrder(int $purchaseOrderId): array;

  /**
   * Get all invoices for a supplier.
   */
  public function getInvoicesForSupplier(int $supplierId): array;

  /**
   * Perform three-way matching on an invoice.
   */
  public function performThreeWayMatching(int $invoiceId): Invoice;

  /**
   * Verify an invoice.
   */
  public function verifyInvoice(int $invoiceId, int $userId, ?string $notes = null): Invoice;

  /**
   * Approve an invoice.
   */
  public function approveInvoice(int $invoiceId, int $userId, ?string $notes = null): Invoice;

  /**
   * Mark an invoice as paid.
   */
  public function markInvoicePaid(int $invoiceId): Invoice;

  /**
   * Mark an invoice as disputed.
   */
  public function markInvoiceDisputed(int $invoiceId, string $reason): Invoice;

  /**
   * Cancel an invoice.
   */
  public function cancelInvoice(int $invoiceId, string $reason): Invoice;

  /**
   * Send an invoice back to supplier.
   */
  public function sendInvoiceBack(int $invoiceId, string $reason): Invoice;

  /**
   * Get invoice summary.
   */
  public function getInvoiceSummary(int $invoiceId): array;

  /**
   * Generate invoice PDF.
   */
  public function generateInvoicePdf(int $invoiceId): string;

  /**
   * Get invoice matching status.
   */
  public function getMatchingStatus(int $invoiceId): array;

  /**
   * Get pending invoices.
   */
  public function getPendingInvoices(): array;

  /**
   * Get overdue invoices.
   */
  public function getOverdueInvoices(): array;

  /**
   * Get invoices for matching.
   */
  public function getInvoicesForMatching(): array;

  /**
   * Update invoice items.
   */
  public function updateInvoiceItems(int $invoiceId, array $items): Invoice;
}
