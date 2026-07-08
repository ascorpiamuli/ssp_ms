<?php
// app/Traits/SanitizesInput.php

namespace App\Traits;

use Illuminate\Database\Eloquent\Model;

trait SanitizesInput
{
  /**
   * Boot the trait
   */
  protected static function bootSanitizesInput()
  {
    static::saving(function (Model $model) {
      $model->sanitizeInputs();
    });
  }

  /**
   * Sanitize all string attributes before saving
   */
  protected function sanitizeInputs(): void
  {
    // Get all fillable attributes
    $fillable = $this->getFillable();

    // If no fillable defined, use all attributes
    if (empty($fillable)) {
      $fillable = array_keys($this->getAttributes());
    }

    foreach ($fillable as $attribute) {
      $value = $this->$attribute;

      // Only sanitize strings
      if (is_string($value) && !empty($value)) {
        $this->$attribute = $this->sanitizeString($value);
      }
    }
  }

  /**
   * Sanitize a single string
   */
  protected function sanitizeString(string $value): string
  {
    // Remove HTML tags
    $value = strip_tags($value);

    // Convert special characters to HTML entities
    $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');

    // Remove any remaining dangerous patterns
    $value = $this->removeDangerousPatterns($value);

    // Trim whitespace
    $value = trim($value);

    return $value;
  }

  /**
   * Remove dangerous patterns
   */
  protected function removeDangerousPatterns(string $value): string
  {
    // Remove javascript: protocol
    $value = preg_replace('/javascript\s*:/i', '', $value);

    // Remove vbscript: protocol
    $value = preg_replace('/vbscript\s*:/i', '', $value);

    // Remove on* event handlers
    $value = preg_replace('/on\w+\s*=/i', '', $value);

    // Remove data: protocol (can be dangerous)
    $value = preg_replace('/data\s*:/i', '', $value);

    return $value;
  }

  /**
   * Get sanitized version of a specific attribute
   */
  public function getSanitized(string $key): ?string
  {
    $value = $this->getAttribute($key);

    if (is_string($value)) {
      return $this->sanitizeString($value);
    }

    return $value;
  }
}
