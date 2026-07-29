<?php
// app/Services/Procurement/DTOs/TenderDTO.php

declare(strict_types=1);

namespace App\Services\Procurement\DTOs;

use Carbon\Carbon;

class TenderDTO extends BaseDTO
{
  public function __construct(
    public readonly int $requisitionId,
    public readonly string $title,
    public readonly ?string $description,
    public readonly Carbon $issueDate,
    public readonly Carbon $closingDate,
    public readonly ?string $closingTime,
    public readonly ?string $tenderDocumentPath,
    public readonly ?string $evaluationCriteria,
    public readonly ?float $estimatedValue,
    public readonly array $bidders,
    public readonly ?string $tenderNumber,
    public readonly array $metadata = []
  ) {}

  public static function fromArray(array $data): self
  {
    return new self(
      requisitionId: $data['requisition_id'],
      title: $data['title'],
      description: $data['description'] ?? null,
      issueDate: Carbon::parse($data['issue_date'] ?? now()),
      closingDate: Carbon::parse($data['closing_date'] ?? now()->addDays(14)),
      closingTime: $data['closing_time'] ?? null,
      tenderDocumentPath: $data['tender_document_path'] ?? null,
      evaluationCriteria: $data['evaluation_criteria'] ?? null,
      estimatedValue: $data['estimated_value'] ?? null,
      bidders: $data['bidders'] ?? [],
      tenderNumber: $data['tender_number'] ?? null,
      metadata: $data['metadata'] ?? []
    );
  }

  public function toArray(): array
  {
    return [
      'requisition_id' => $this->requisitionId,
      'title' => $this->title,
      'description' => $this->description,
      'issue_date' => $this->issueDate->toDateString(),
      'closing_date' => $this->closingDate->toDateString(),
      'closing_time' => $this->closingTime,
      'tender_document_path' => $this->tenderDocumentPath,
      'evaluation_criteria' => $this->evaluationCriteria,
      'estimated_value' => $this->estimatedValue,
      'bidders' => $this->bidders,
      'tender_number' => $this->tenderNumber,
      'metadata' => $this->metadata,
    ];
  }
}
