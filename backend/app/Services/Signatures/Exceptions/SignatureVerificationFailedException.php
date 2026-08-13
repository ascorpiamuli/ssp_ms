<?php
// app/Services/Signatures/Exceptions/SignatureVerificationFailedException.php

namespace App\Services\Signatures\Exceptions;

class SignatureVerificationFailedException extends SignatureException
{
  public function __construct(string $message = 'Signature verification failed', int $code = 422)
  {
    parent::__construct($message, $code);
  }
}
