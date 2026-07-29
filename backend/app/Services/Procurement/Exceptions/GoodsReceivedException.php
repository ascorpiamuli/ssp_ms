<?php
// app/Services/Procurement/Exceptions/GoodsReceivedException.php

declare(strict_types=1);

namespace App\Services\Procurement\Exceptions;

class GoodsReceivedException extends ProcurementException
{
    public static function grnNotFound(int $id): self
    {
        return new self("GRN #{$id} not found.");
    }

    public static function sanNotFound(int $id): self
    {
        return new self("SAN #{$id} not found.");
    }

    public static function poNotFound(int $id): self
    {
        return new self("Purchase Order #{$id} not found.");
    }

    public static function poMustBeLpo(): self
    {
        return new self('GRN can only be created for LPOs (goods).');
    }

    public static function poMustBeLso(): self
    {
        return new self('SAN can only be created for LSOs (services).');
    }

    public static function poAlreadyCompleted(): self
    {
        return new self('Cannot create GRN/SAN for a completed PO.');
    }

    public static function noItems(): self
    {
        return new self('GRN/SAN must have at least one item.');
    }

    public static function grnAlreadySubmitted(): self
    {
        return new self('GRN has already been submitted.');
    }

    public static function sanAlreadySubmitted(): self
    {
        return new self('SAN has already been submitted.');
    }

    public static function grnMustBeSubmitted(): self
    {
        return new self('GRN must be submitted before approval.');
    }

    public static function sanMustBeSubmitted(): self
    {
        return new self('SAN must be submitted before approval.');
    }

    public static function poItemNotFound(int $id): self
    {
        return new self("PO Item #{$id} not found.");
    }

    public static function requisitionNotFound(int $id): self
    {
        return new self("Requisition #{$id} not found.");
    }
}
