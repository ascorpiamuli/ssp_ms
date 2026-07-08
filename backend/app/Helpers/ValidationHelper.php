<?php
// app/Helpers/ValidationHelper.php

namespace App\Helpers;

class ValidationHelper
{
  /**
   * Validate email
   */
  public static function isEmail(string $email): bool
  {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
  }

  /**
   * Validate phone number (Kenyan format)
   */
  public static function isKenyanPhone(string $phone): bool
  {
    $phone = preg_replace('/[^0-9]/', '', $phone);

    // Check for 07XX XXX XXX or 01XX XXX XXX format
    if (preg_match('/^(07|01)\d{8}$/', $phone)) {
      return true;
    }

    // Check for 2547XX XXX XXX format
    if (preg_match('/^2547\d{8}$/', $phone)) {
      return true;
    }

    return false;
  }

  /**
   * Validate ID number (Kenyan)
   */
  public static function isKenyanId(string $id): bool
  {
    return preg_match('/^\d{8}$/', $id) === 1;
  }
}
