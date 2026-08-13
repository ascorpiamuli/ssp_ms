<?php
// app/Services/Signatures/Exceptions/SignatureNotFoundException.php

namespace App\Services\Signatures\Exceptions;

class SignatureNotFoundException extends SignatureException
{
  public function __construct(string $message = 'Signature not found', int $code = 404)
  {
    parent::__construct($message, $code);
  }
}
