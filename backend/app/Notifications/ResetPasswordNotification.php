<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
  use Queueable;

  public $token;

  public function __construct($token)
  {
    $this->token = $token;
  }

  public function via($notifiable)
  {
    return ['mail'];
  }

  public function toMail($notifiable)
  {
    // Get the frontend URL from config
    $frontendUrl = config('app.frontend_url', 'http://localhost:3000');

    // Build the reset URL for your frontend
    $resetUrl = $frontendUrl . '/reset-password?' . http_build_query([
      'token' => $this->token,
      'email' => $notifiable->email
    ]);

    return (new MailMessage)
      ->subject('Reset Your Password - SSPMIS')
      ->greeting('Hello ' . ($notifiable->full_name ?? 'User') . '!')
      ->line('You are receiving this email because we received a password reset request for your account.')
      ->action('Reset Password', $resetUrl)
      ->line('This password reset link will expire in 60 minutes.')
      ->line('If you did not request a password reset, no further action is required.')
      ->salutation('Regards, SSPMIS Team');
  }
}
