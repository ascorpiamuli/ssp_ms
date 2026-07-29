<?php
// app/Services/Procurement/Contracts/Repositories/InvoiceRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Procurement\Contracts\Repositories;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use Illuminate\Pagination\LengthAwarePaginator;

interface InvoiceRepositoryInterface
{
  /**
   * Find an invoice by ID.
   */
  public function findInvoice(int $id): ?Invoice;

  /**
   * Find an invoice by ID or fail.
   */
  public function findInvoiceOrFail(int $id): Invoice;

  /**
   * Find an invoice item by ID.
   */
  public function findInvoiceItem(int $id): ?InvoiceItem;

  /**
   * Get all invoices for a purchase order.
   */
  public function getInvoicesForPurchaseOrder(int $purchaseOrderId): array;

  /**
   * Get all invoices for a supplier.
   */
  public function getInvoicesForSupplier(int $supplierId): array;

  /**
   * Get all invoices for a requisition.
   */
  public function getInvoicesForRequisition(int $requisitionId): array;

  /**
   * Get an invoice by invoice number.
   */
  public function getInvoiceByNumber(string $invoiceNumber): ?Invoice;

  /**
   * Create an invoice.
   */
  public function createInvoice(array $data): Invoice;

  /**
   * Create an invoice item.
   */
  public function createInvoiceItem(array $data): InvoiceItem;

  /**
   * Update an invoice.
   */
  public function updateInvoice(int $id, array $data): Invoice;

  /**
   * Update an invoice item.
   */
  public function updateInvoiceItem(int $id, array $data): InvoiceItem;

  /**
   * Get pending invoices.
   */
  public function getPendingInvoices(): array;

  /**
   * Get verified invoices.
   */
  public function getVerifiedInvoices(): array;

  /**
   * Get approved invoices.
   */
  public function getApprovedInvoices(): array;

  /**
   * Get paid invoices.
   */
  public function getPaidInvoices(): array;

  /**
   * Get overdue invoices.
   */
  public function getOverdueInvoices(): array;

  /**
   * Get invoices by matching status.
   */
  public function getInvoicesByMatchingStatus(string $matchingStatus): array;

  /**
   * Paginate invoices.
   */
  public function paginateInvoices(int $perPage = 15): LengthAwarePaginator;

  /**
   * Get invoice items.
   */
  public function getInvoiceItems(int $invoiceId): array;

  /**
   * Get invoices for matching.
   */
  public function getInvoicesForMatching(): array;

  /**
   * Delete an invoice item.
   */
  public function deleteInvoiceItem(int $id): bool;

  /**
   * Get invoice statistics.
   */
  public function getInvoiceStatistics(): array;
}
