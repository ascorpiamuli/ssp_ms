<?php
// app/Helpers/DateHelper.php

namespace App\Helpers;

use Carbon\Carbon;

class DateHelper
{
  /**
   * Format date for display
   */
  public static function formatDate($date, string $format = 'M d, Y'): ?string
  {
    if (!$date) return null;

    $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
    return $carbon->format($format);
  }

  /**
   * Format date with time
   */
  public static function formatDateTime($date): ?string
  {
    if (!$date) return null;

    $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
    return $carbon->format('M d, Y H:i');
  }

  /**
   * Get human readable time difference
   */
  public static function timeAgo($date): string
  {
    if (!$date) return 'Never';

    $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
    return $carbon->diffForHumans();
  }

  /**
   * Check if date is today
   */
  public static function isToday($date): bool
  {
    if (!$date) return false;

    $carbon = $date instanceof Carbon ? $date : Carbon::parse($date);
    return $carbon->isToday();
  }

  /**
   * Get age from date of birth
   */
  public static function age($dateOfBirth): ?int
  {
    if (!$dateOfBirth) return null;

    $carbon = $dateOfBirth instanceof Carbon ? $dateOfBirth : Carbon::parse($dateOfBirth);
    return $carbon->age;
  }
}
