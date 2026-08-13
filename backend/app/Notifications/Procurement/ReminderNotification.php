<?php
// app/Notifications/Procurement/ReminderNotification.php

declare(strict_types=1);

namespace App\Notifications\Procurement;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Log;

class ReminderNotification extends BaseProcurementNotification
{
  protected function getType(): string
  {
    return 'reminder';
  }

  protected function getTitle(): string
  {
    // Get the reminder type with a better default
    $reminderType = $this->data['reminder_type'] ?? 'Reminder';
    $referenceNumber = $this->data['reference_number'] ?? $this->data['qtn_number'] ?? '';

    if ($referenceNumber) {
      return "{$reminderType}: {$referenceNumber}";
    }

    return $reminderType;
  }

  protected function getSubject(): string
  {
    $subject = $this->data['subject'] ?? $this->getTitle();

    // Add urgency indicators
    if ($this->isUrgent()) {
      $subject = "URGENT: " . $subject;
    } elseif ($this->isClosingSoon()) {
      $subject = "CLOSING SOON: " . $subject;
    }

    return $subject;
  }

  protected function getMessage(): string
  {
    // Build a comprehensive message
    $messageParts = [];

    // Main message
    $mainMessage = $this->data['message'] ?? $this->getDefaultMessage();
    $messageParts[] = $mainMessage;

    // Add days left if available
    $daysLeft = $this->getDaysLeft();
    if ($daysLeft !== null) {
      if ($daysLeft <= 0) {
        $messageParts[] = "WARNING: This item is now overdue!";
      } elseif ($daysLeft <= 2) {
        $messageParts[] = "WARNING: This item is due in {$daysLeft} day(s) - please take action immediately!";
      } else {
        $messageParts[] = "You have {$daysLeft} day(s) remaining to respond.";
      }
    }

    // Add closing date if available
    $closingDate = $this->getClosingDate();
    if ($closingDate) {
      $messageParts[] = "Closing Date: {$closingDate}";
    }

    // Add entity reference if available
    $reference = $this->getReferenceNumber();
    if ($reference) {
      $messageParts[] = "Reference: {$reference}";
    }

    // Add supplier count if available
    $supplierCount = $this->getSupplierCount();
    if ($supplierCount !== null) {
      $messageParts[] = "This reminder is being sent to {$supplierCount} supplier(s).";
    }

    return implode("\n\n", $messageParts);
  }

  protected function getDefaultMessage(): string
  {
    $entityType = $this->data['entity_type'] ?? 'procurement item';
    $entityTypeDisplay = ucfirst(str_replace('_', ' ', $entityType));

    $reference = $this->getReferenceNumber();
    if ($reference) {
      return "This is a reminder regarding {$entityTypeDisplay} {$reference}.";
    }

    return "This is a reminder regarding your {$entityTypeDisplay}.";
  }

  protected function getGreeting($notifiable): string
  {
    $name = $notifiable->full_name ?? $notifiable->name ?? 'Supplier';

    // Add a personalized greeting based on context
    if ($this->isUrgent()) {
      return "Dear {$name},";
    }

    return "Dear {$name},";
  }

  protected function getActionUrl(): ?string
  {
    // Check for custom action URL
    $actionUrl = $this->data['action_url'] ?? null;
    if ($actionUrl) {
      return $actionUrl;
    }

    // Try to generate URL from entity data
    $entityId = $this->data['entity_id'] ?? null;
    $entityType = $this->data['entity_type'] ?? null;

    if ($entityId && $entityType) {
      // Handle different entity types
      $routeMap = [
        'quotation' => 'procurement/request-for-quotations',
        'qtn' => 'procurement/request-for-quotations',
        'rfq' => 'procurement/request-for-quotations',
        'tender' => 'procurement/tenders',
        'contract' => 'procurement/contracts',
        'purchase_order' => 'procurement/purchase-orders',
        'po' => 'procurement/purchase-orders',
      ];

      $basePath = $routeMap[$entityType] ?? "procurement/{$entityType}s";
      return url("/{$basePath}/{$entityId}");
    }

    // Fallback to procurement dashboard
    return url('/procurement');
  }

  protected function getActionText(): string
  {
    if ($this->isUrgent()) {
      return 'Take Action Now';
    }

    if ($this->isClosingSoon()) {
      return 'View & Respond';
    }

    return parent::getActionText();
  }

  protected function getAdditionalLines(): array
  {
    $lines = [];

    // Add deadline with formatting
    if (isset($this->data['deadline'])) {
      $lines[] = "Deadline: {$this->data['deadline']}";
    }

    // Add priority indicator
    if ($this->isHighPriority()) {
      $lines[] = "Priority: High - Please prioritize this request";
    }

    // Add instructions if provided
    if (isset($this->data['instructions'])) {
      $lines[] = "Instructions: {$this->data['instructions']}";
    }

    // Add contact person if provided
    if (isset($this->data['contact_person'])) {
      $lines[] = "Contact: {$this->data['contact_person']}";
    }

    // Add contact email if provided
    if (isset($this->data['contact_email'])) {
      $lines[] = "Email: {$this->data['contact_email']}";
    }

    // Add notes if provided
    if (isset($this->data['notes'])) {
      $lines[] = "Notes: {$this->data['notes']}";
    }

    return $lines;
  }

  protected function getSalutation(): string
  {
    if ($this->isUrgent()) {
      return "Thank you for your urgent attention to this matter.\n\nRegards,\n" . config('app.name') . " Team";
    }

    return "Thank you for your cooperation.\n\nRegards,\n" . config('app.name') . " Team";
  }

  /**
   * Get the mail representation of the notification.
   */
  public function toMail($notifiable): MailMessage
  {
    Log::info('📧 [ReminderNotification] Building email', [
      'notifiable_id' => $notifiable->id ?? null,
      'notifiable_email' => $notifiable->email ?? null,
      'subject' => $this->getSubject()
    ]);

    try {
      $mail = (new MailMessage)
        ->subject($this->getSubject())
        ->greeting($this->getGreeting($notifiable))
        ->line($this->getMessage());

      // Add action button with better styling
      if ($this->getActionUrl()) {
        $mail->action($this->getActionText(), $this->getActionUrl());
      }

      // Add additional information as a callout
      $additionalLines = $this->getAdditionalLines();
      if (!empty($additionalLines)) {
        $mail->line('---');
        foreach ($additionalLines as $line) {
          $mail->line($line);
        }
        $mail->line('---');
      }

      // Add a note about urgency if applicable
      if ($this->isUrgent()) {
        $mail->line('This is an urgent reminder requiring your immediate attention.');
      } elseif ($this->isClosingSoon()) {
        $mail->line('This reminder is time-sensitive. Please respond before the deadline.');
      }

      // Add expiration note if applicable
      if ($this->isExpiring()) {
        $mail->line('This reminder will expire soon. Please take action before the deadline passes.');
      }

      $mail->salutation($this->getSalutation());

      Log::info('✅ [ReminderNotification] Email built successfully', [
        'notifiable_email' => $notifiable->email ?? null
      ]);

      return $mail;
    } catch (\Exception $e) {
      Log::error('❌ [ReminderNotification] Failed to build email', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
      ]);
      throw $e;
    }
  }

  // Helper methods
  private function getDaysLeft(): ?int
  {
    if (isset($this->data['days_left'])) {
      return (int) $this->data['days_left'];
    }

    // Try to calculate from closing_date
    if (isset($this->data['closing_date'])) {
      try {
        $closingDate = new \DateTime($this->data['closing_date']);
        $now = new \DateTime();
        $interval = $now->diff($closingDate);
        $days = (int) $interval->format('%r%a');
        return $days;
      } catch (\Exception $e) {
        return null;
      }
    }

    return null;
  }

  private function getClosingDate(): ?string
  {
    return $this->data['closing_date'] ?? $this->data['deadline'] ?? null;
  }

  private function getReferenceNumber(): ?string
  {
    return $this->data['reference_number'] ??
      $this->data['qtn_number'] ??
      $this->data['rfq_number'] ??
      $this->data['reference'] ?? null;
  }

  private function getSupplierCount(): ?int
  {
    if (isset($this->data['supplier_count'])) {
      return (int) $this->data['supplier_count'];
    }

    if (isset($this->data['supplier_ids']) && is_array($this->data['supplier_ids'])) {
      return count($this->data['supplier_ids']);
    }

    return null;
  }

  private function isUrgent(): bool
  {
    // Check if this is marked as urgent
    if (isset($this->data['priority']) && $this->data['priority'] === 'urgent') {
      return true;
    }

    // Check days left
    $daysLeft = $this->getDaysLeft();
    if ($daysLeft !== null && $daysLeft <= 1) {
      return true;
    }

    return false;
  }

  private function isHighPriority(): bool
  {
    return isset($this->data['priority']) &&
      in_array($this->data['priority'], ['high', 'urgent']);
  }

  private function isClosingSoon(): bool
  {
    $daysLeft = $this->getDaysLeft();
    return $daysLeft !== null && $daysLeft <= 3 && $daysLeft > 0;
  }

  private function isExpiring(): bool
  {
    $daysLeft = $this->getDaysLeft();
    return $daysLeft !== null && $daysLeft < 0;
  }
}
