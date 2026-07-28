<?php
// app/Notifications/RequisitionNotification.php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\RequisitionNotification as RequisitionNotificationModel;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RequisitionNotificationMail extends Notification implements ShouldQueue
{
  use Queueable;

  /**
   * @var RequisitionNotificationModel
   */
  protected RequisitionNotificationModel $notification;

  /**
   * @var array
   */
  protected array $channels;

  /**
   * Create a new notification instance.
   */
  public function __construct(RequisitionNotificationModel $notification, array $channels = ['mail', 'database'])
  {
    $this->notification = $notification;
    $this->channels = $channels;
  }

  /**
   * Get the notification's delivery channels.
   *
   * @return array<int, string>
   */
  public function via(object $notifiable): array
  {
    return $this->channels;
  }

  /**
   * Get the mail representation of the notification.
   */
  public function toMail(object $notifiable): MailMessage
  {
    $data = $this->notification->data ?? [];
    $action = $data['action'] ?? 'view';
    $url = $data['url'] ?? config('app.frontend_url');

    $mailMessage = (new MailMessage)
      ->subject($this->notification->subject)
      ->greeting('Hello ' . ($notifiable->full_name ?? 'User') . '!')
      ->line($this->notification->message)
      ->line('')
      ->line('**Requisition Details:**');

    // Add requisition details
    if (isset($data['reference_number'])) {
      $mailMessage->line("- **Reference Number:** {$data['reference_number']}");
    }
    if (isset($data['amount'])) {
      $mailMessage->line("- **Amount:** KSh " . number_format($data['amount'], 2));
    }
    if (isset($data['level'])) {
      $mailMessage->line("- **Level:** " . ucfirst($data['level']));
    }
    if (isset($data['reason'])) {
      $mailMessage->line("- **Reason:** {$data['reason']}");
    }
    if (isset($data['requester'])) {
      $mailMessage->line("- **Requester:** {$data['requester']}");
    }
    if (isset($data['department'])) {
      $mailMessage->line("- **Department:** {$data['department']}");
    }
    if (isset($data['days_pending'])) {
      $mailMessage->line("- **Days Pending:** {$data['days_pending']}");
    }

    // Add action button
    $buttonText = match ($action) {
      'approve' => 'Review & Approve',
      'revise' => 'Revise Requisition',
      'view' => 'View Requisition',
      'review' => 'Review Requisition',
      default => 'View Details'
    };

    $mailMessage->action($buttonText, $url)
      ->line('Thank you for using our application!');

    return $mailMessage;
  }

  /**
   * Get the array representation of the notification.
   *
   * @return array<string, mixed>
   */
  public function toArray(object $notifiable): array
  {
    return [
      'id' => $this->notification->id,
      'requisition_id' => $this->notification->requisition_id,
      'type' => $this->notification->type,
      'subject' => $this->notification->subject,
      'message' => $this->notification->message,
      'data' => $this->notification->data,
      'sent_by' => $this->notification->sent_by,
      'created_at' => $this->notification->created_at->toISOString(),
    ];
  }

  /**
   * Get the database representation of the notification.
   *
   * @return array<string, mixed>
   */
  public function toDatabase(object $notifiable): array
  {
    return [
      'id' => $this->notification->id,
      'requisition_id' => $this->notification->requisition_id,
      'type' => $this->notification->type,
      'subject' => $this->notification->subject,
      'message' => $this->notification->message,
      'data' => $this->notification->data,
      'sent_by' => $this->notification->sent_by,
    ];
  }
}
