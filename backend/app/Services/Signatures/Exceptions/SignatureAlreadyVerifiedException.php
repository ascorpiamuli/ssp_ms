<?php
// app/Services/Signatures/Exceptions/SignatureAlreadyVerifiedException.php

namespace App\Services\Signatures\Exceptions;

class SignatureAlreadyVerifiedException extends SignatureException
{
  public function __construct(string $message = 'Signature is already verified', int $code = 409)
  {
    parent::__construct($message, $code);
  }
}

