<?php
// app/Helpers/NumberHelper.php

namespace App\Helpers;

class NumberHelper
{
  /**
   * Format number with commas
   */
  public static function format(int|float $number, int $decimals = 0): string
  {
    return number_format($number, $decimals);
  }

  /**
   * Format currency
   */
  public static function currency(int|float $amount, string $currency = 'KES'): string
  {
    return $currency . ' ' . number_format($amount, 2);
  }

  /**
   * Format percentage
   */
  public static function percentage(int|float $value, int $total, int $decimals = 1): string
  {
    if ($total === 0) return '0%';

    $percentage = ($value / $total) * 100;
    return number_format($percentage, $decimals) . '%';
  }

  /**
   * Abbreviate large numbers (1.2K, 1.5M, 2.3B)
   */
  public static function abbreviate(int $number): string
  {
    if ($number < 1000) {
      return (string) $number;
    }

    if ($number < 1000000) {
      return round($number / 1000, 1) . 'K';
    }

    if ($number < 1000000000) {
      return round($number / 1000000, 1) . 'M';
    }

    return round($number / 1000000000, 1) . 'B';
  }
}
