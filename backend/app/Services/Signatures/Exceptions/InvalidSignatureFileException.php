<?php
// app/Services/Signatures/Exceptions/InvalidSignatureFileException.php

namespace App\Services\Signatures\Exceptions;

class InvalidSignatureFileException extends SignatureException
{
  public function __construct(string $message = 'Invalid signature file', int $code = 422)
  {
    parent::__construct($message, $code);
  }
}
