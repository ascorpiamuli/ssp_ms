<?php

namespace App\Traits;

trait DecodesHtmlEntities
{
  /**
   * Override the getAttribute method to decode HTML entities
   */
  public function getAttribute($key)
  {
    $value = parent::getAttribute($key);

    // Only decode string values
    if (is_string($value)) {
      // Check if this attribute should be decoded
      if ($this->shouldDecode($key)) {
        return html_entity_decode($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
      }
    }

    return $value;
  }

  /**
   * Determine if an attribute should be decoded
   */
  protected function shouldDecode($key)
  {
    // List of attributes that should NEVER be decoded
    $neverDecode = [
      'id',
      'slug',
      'views',
      'order',
      'is_published',
      'created_at',
      'updated_at',
      'deleted_at',
      'password',
      'remember_token',
      'email_verified_at',
      'helpful_count',
      'not_helpful_count',
      'status',
      'priority',
      'ticket_number',
      'rating',
      'user_agent',
      'ip_address'
    ];

    // Don't decode these
    if (in_array($key, $neverDecode)) {
      return false;
    }

    // Don't decode JSON fields
    if ($this->hasCast($key, ['array', 'json', 'collection', 'object'])) {
      return false;
    }

    // Decode text fields
    return true;
  }
}
