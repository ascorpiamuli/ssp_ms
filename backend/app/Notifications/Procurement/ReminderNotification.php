<?php
// app/Notifications/Procurement/ReminderNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

class ReminderNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'reminder';
  }

  protected function getTitle(): string
  {
    $reminderType = $this->data['reminder_type'] ?? 'Reminder';
    return $reminderType;
  }

  protected function getMessage(): string
  {
    $message = $this->data['message'] ?? 'This is a reminder notification.';
    $daysLeft = $this->data['days_left'] ?? null;

    if ($daysLeft) {
      $message .= " You have {$daysLeft} day(s) remaining.";
    }

    return $message;
  }

  protected function getActionUrl(): ?string
  {
    $actionUrl = $this->data['action_url'] ?? null;
    if ($actionUrl) {
      return $actionUrl;
    }

    $entityId = $this->data['entity_id'] ?? null;
    $entityType = $this->data['entity_type'] ?? null;
    if ($entityId && $entityType) {
      return url("/procurement/{$entityType}s/{$entityId}");
    }
    return url('/procurement');
  }

  protected function getAdditionalLines(): array
  {
    $lines = [];
    if (isset($this->data['deadline'])) {
      $lines[] = "⏰ Deadline: {$this->data['deadline']}";
    }
    if (isset($this->data['priority']) && $this->data['priority'] === 'high') {
      $lines[] = "🔴 This is a high priority reminder.";
    }
    return $lines;
  }
}
