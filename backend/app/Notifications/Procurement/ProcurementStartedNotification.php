<?php
// app/Notifications/Procurement/ProcurementStartedNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ProcurementStartedNotification extends Notification implements ShouldQueue
{
  use Queueable;

  protected array $data;

  public function __construct(array $data = [])
  {
    $this->data = $data;
    $this->onQueue('notifications');
  }

  public function via($notifiable): array
  {
    return ['mail', 'database'];
  }

  public function toMail($notifiable): MailMessage
  {
    $referenceNumber = $this->data['reference_number'] ?? 'N/A';
    $title = $this->data['title'] ?? 'N/A';

    return (new MailMessage)
      ->subject("Procurement Started - {$referenceNumber}")
      ->greeting("Hello {$notifiable->full_name},")
      ->line("Procurement has been initiated for requisition {$referenceNumber}.")
      ->line("Title: {$title}")
      ->action('View Procurement', url("/procurement/status"))
      ->line('Please monitor the procurement process.');
  }

  public function toArray($notifiable): array
  {
    return [
      'type' => 'procurement_started',
      'title' => 'Procurement Started',
      'message' => "Procurement initiated for requisition {$this->data['reference_number']}",
      'requisition_id' => $this->data['requisition_id'] ?? null,
      'reference_number' => $this->data['reference_number'] ?? null,
      'title' => $this->data['title'] ?? null,
      'action_url' => '/procurement/status',
      'created_at' => now()->toDateTimeString(),
    ];
  }
}
