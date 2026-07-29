<?php
// app/Services/Procurement/DTOs/GoodsReceivedDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

class GoodsReceivedDTO extends BaseDTO
{
  public function __construct(
    public readonly int $purchaseOrderId,
    public readonly string $type, // grn or san
    public readonly Carbon $receivedDate,
    public readonly ?string $receivedTime,
    public readonly ?string $referenceNumber,
    public readonly ?string $deliveryNoteNumber,
    public readonly ?string $carrier,
    public readonly ?string $waybillNumber,
    public readonly ?string $vehicleNumber,
    public readonly ?string $deliveryCondition,
    public readonly ?string $serviceDescription,
    public readonly ?Carbon $serviceStartDate,
    public readonly ?Carbon $serviceEndDate,
    public readonly ?string $serviceProvider,
    public readonly ?string $serviceDeliverables,
    public readonly string $approvalLevel, // hod or principal
    public readonly array $items,
    public readonly ?string $notes,
    public readonly array $metadata = []
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      purchaseOrderId: $data['purchase_order_id'],
      type: $data['type'],
      receivedDate: Carbon::parse($data['received_date'] ?? now()),
      receivedTime: $data['received_time'] ?? null,
      referenceNumber: $data['reference_number'] ?? null,
      deliveryNoteNumber: $data['delivery_note_number'] ?? null,
      carrier: $data['carrier'] ?? null,
      waybillNumber: $data['waybill_number'] ?? null,
      vehicleNumber: $data['vehicle_number'] ?? null,
      deliveryCondition: $data['delivery_condition'] ?? null,
      serviceDescription: $data['service_description'] ?? null,
      serviceStartDate: isset($data['service_start_date']) ? Carbon::parse($data['service_start_date']) : null,
      serviceEndDate: isset($data['service_end_date']) ? Carbon::parse($data['service_end_date']) : null,
      serviceProvider: $data['service_provider'] ?? null,
      serviceDeliverables: $data['service_deliverables'] ?? null,
      approvalLevel: $data['approval_level'] ?? 'hod',
      items: $data['items'] ?? [],
      notes: $data['notes'] ?? null,
      metadata: $data['metadata'] ?? []
    );
  }

  public function toArray(): array
  {
    return [
      'purchase_order_id' => $this->purchaseOrderId,
      'type' => $this->type,
      'received_date' => $this->receivedDate->toDateString(),
      'received_time' => $this->receivedTime,
      'reference_number' => $this->referenceNumber,
      'delivery_note_number' => $this->deliveryNoteNumber,
      'carrier' => $this->carrier,
      'waybill_number' => $this->waybillNumber,
      'vehicle_number' => $this->vehicleNumber,
      'delivery_condition' => $this->deliveryCondition,
      'service_description' => $this->serviceDescription,
      'service_start_date' => $this->formatDate($this->serviceStartDate),
      'service_end_date' => $this->formatDate($this->serviceEndDate),
      'service_provider' => $this->serviceProvider,
      'service_deliverables' => $this->serviceDeliverables,
      'approval_level' => $this->approvalLevel,
      'items' => $this->items,
      'notes' => $this->notes,
      'metadata' => $this->metadata,
    ];
  }
}
