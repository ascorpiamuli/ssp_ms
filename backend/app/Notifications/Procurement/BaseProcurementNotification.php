<?php
// app/Notifications/Procurement/BaseProcurementNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

abstract class BaseProcurementNotification extends Notification
{
  use Queueable;

  protected array $data;
  protected ?string $requisitionId;
  protected ?string $referenceNumber;

  public function __construct(array $data = [])
  {
    $this->data = $data;

    // Handle requisition_id - convert to string if it exists
    $this->requisitionId = isset($data['requisition_id'])
      ? (string) $data['requisition_id']
      : null;

    $this->referenceNumber = $data['reference_number'] ?? null;
    $this->onQueue('notifications');
  }

  /**
   * Get the notification's delivery channels.
   */
  public function via($notifiable): array
  {
    return ['mail', 'database'];
  }

  /**
   * Get the mail representation of the notification.
   */
  public function toMail($notifiable): MailMessage
  {
    $mail = (new MailMessage)
      ->subject($this->getSubject())
      ->greeting($this->getGreeting($notifiable))
      ->line($this->getMessage());

    if ($this->getActionUrl()) {
      $mail->action($this->getActionText(), $this->getActionUrl());
    }

    foreach ($this->getAdditionalLines() as $line) {
      $mail->line($line);
    }

    $mail->salutation($this->getSalutation());

    return $mail;
  }

  /**
   * Get the array representation of the notification.
   */
  public function toArray($notifiable): array
  {
    return [
      'type' => $this->getType(),
      'title' => $this->getTitle(),
      'message' => $this->getMessage(),
      'requisition_id' => $this->requisitionId,
      'reference_number' => $this->referenceNumber,
      'data' => $this->data,
      'action_url' => $this->getActionUrl(),
      'action_text' => $this->getActionText(),
      'created_at' => now()->toDateTimeString(),
    ];
  }

  /**
   * Get the database notification representation.
   */
  public function toDatabase($notifiable): array
  {
    return [
      'type' => $this->getType(),
      'title' => $this->getTitle(),
      'message' => $this->getMessage(),
      'requisition_id' => $this->requisitionId,
      'reference_number' => $this->referenceNumber,
      'data' => $this->data,
      'action_url' => $this->getActionUrl(),
      'action_text' => $this->getActionText(),
      'created_at' => now()->toDateTimeString(),
    ];
  }

  abstract protected function getType(): string;
  abstract protected function getTitle(): string;
  abstract protected function getMessage(): string;

  protected function getSubject(): string
  {
    return $this->getTitle();
  }

  protected function getGreeting($notifiable): string
  {
    $name = $notifiable->full_name ?? $notifiable->name ?? 'User';
    return "Hello {$name},";
  }

  protected function getActionUrl(): ?string
  {
    return $this->data['action_url'] ?? null;
  }

  protected function getActionText(): string
  {
    return $this->data['action_text'] ?? 'View Details';
  }

  protected function getAdditionalLines(): array
  {
    return $this->data['additional_lines'] ?? [];
  }

  protected function getSalutation(): string
  {
    return 'Regards,<br>' . config('app.name') . ' Team';
  }
}
