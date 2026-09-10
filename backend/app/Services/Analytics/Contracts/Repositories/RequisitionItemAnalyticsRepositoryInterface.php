<?php
// app/services/analytics/contracts/repositories/RequisitionItemAnalyticsRepositoryInterface.php

declare(strict_types=1);

namespace App\Services\Analytics\Contracts\Repositories;

use Illuminate\Support\Collection;

/**
 * Requisition Item Analytics Repository Interface
 * Handles requisition item-specific analytics queries
 */
interface RequisitionItemAnalyticsRepositoryInterface
{
    /**
     * Get top requested items
     */
    public function getTopItems(int $limit = 10, array $filters = []): Collection;

    /**
     * Get quality inspection stats
     */
    public function getQualityInspectionStats(array $filters = []): array;

    /**
     * Get procurement completion rate
     */
    public function getProcurementCompletionRate(array $filters = []): float;

    /**
     * Get items below reorder level
     */
    public function getBelowReorderLevel(array $filters = []): Collection;
}
