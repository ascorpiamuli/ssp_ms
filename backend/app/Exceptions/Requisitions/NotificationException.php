<?php
// app/Exceptions/Requisitions/NotificationException.php

declare(strict_types=1);

namespace App\Exceptions\Requisitions;

/**
 * Exception thrown when notification operations fail
 *
 * Used for:
 * - Email sending failures
 * - SMS sending failures
 * - Broadcast failures
 * - Notification configuration errors
 */
class NotificationException extends RequisitionException
{
  /**
   * @var string Error code
   */
  protected string $errorCode = 'NOTIFICATION_ERROR';

  /**
   * Create a new notification exception
   *
   * @param string $message
   * @param int $code
   * @param \Throwable|null $previous
   * @param array $context
   */
  public function __construct(
    string $message = 'An error occurred while sending notification',
    int $code = 500,
    ?\Throwable $previous = null,
    array $context = []
  ) {
    parent::__construct($message, $code, $previous, $context);
  }

  /**
   * Create exception for email send failure
   *
   * @param string $email
   * @param string $reason
   * @return self
   */
  public static function emailFailed(string $email, string $reason): self
  {
    return new self(
      "Failed to send email to '{$email}': {$reason}",
      500,
      null,
      ['email' => $email, 'reason' => $reason]
    );
  }

  /**
   * Create exception for SMS send failure
   *
   * @param string $phone
   * @param string $reason
   * @return self
   */
  public static function smsFailed(string $phone, string $reason): self
  {
    return new self(
      "Failed to send SMS to '{$phone}': {$reason}",
      500,
      null,
      ['phone' => $phone, 'reason' => $reason]
    );
  }

  /**
   * Create exception for broadcast failure
   *
   * @param string $channel
   * @param string $reason
   * @return self
   */
  public static function broadcastFailed(string $channel, string $reason): self
  {
    return new self(
      "Failed to broadcast on channel '{$channel}': {$reason}",
      500,
      null,
      ['channel' => $channel, 'reason' => $reason]
    );
  }

  /**
   * Create exception for invalid channel
   *
   * @param string $channel
   * @param array $validChannels
   * @return self
   */
  public static function invalidChannel(string $channel, array $validChannels): self
  {
    return new self(
      "Invalid notification channel '{$channel}'. Valid: " . implode(', ', $validChannels),
      400,
      null,
      ['channel' => $channel, 'valid_channels' => $validChannels]
    );
  }

  /**
   * Create exception for notification not found
   *
   * @param int $notificationId
   * @return self
   */
  public static function notFound(int $notificationId): self
  {
    return new self(
      "Notification #{$notificationId} not found",
      404,
      null,
      ['notification_id' => $notificationId]
    );
  }

  /**
   * Create exception for template missing
   *
   * @param string $templateName
   * @return self
   */
  public static function templateMissing(string $templateName): self
  {
    return new self(
      "Notification template '{$templateName}' not found",
      404,
      null,
      ['template' => $templateName]
    );
  }
}
