<?php
// app/Services/Signatures/Exceptions/SignatureException.php

namespace App\Services\Signatures\Exceptions;

use Exception;

class SignatureException extends Exception
{
  public function __construct(string $message, int $code = 400, ?Exception $previous = null)
  {
    parent::__construct($message, $code, $previous);
  }
}
