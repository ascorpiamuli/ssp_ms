<?php

return [
  /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    */

  'paths' => [
    'api/*',
    'sanctum/csrf-cookie',
    'login',
    'logout',
    'register',
    'forgot-password',
    'reset-password',
    'email/verification/*',
    'v1/*',
    'auth/*',
    'api/v1/*',
  ],

  'allowed_methods' => ['*'],

  'allowed_origins' => [
    // SSPMS Application
    'https://app.sspms.internal',
    'https://app.sspms.local',
    'https://office.sspms.internal',
    'https://office.sspms.local',

    // SSPMS Supplier Portal
    'https://supplier.sspms.internal',
    'https://supplier.sspms.local',

    // Local development
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',

    // SSPMS API
    'https://api.sspms.internal',
    'https://api.sspms.local',
  ],

  'allowed_origins_patterns' => [
    '/^https?:\/\/.*\.sspms\.internal$/',
    '/^https?:\/\/.*\.sspms\.local$/',
    '/^http:\/\/localhost:\d+$/',
    '/^http:\/\/127\.0\.0\.1:\d+$/',
  ],

  'allowed_headers' => [
    'Content-Type',
    'X-Requested-With',
    'Authorization',
    'Accept',
    'Origin',
    'X-CSRF-TOKEN',
    'X-XSRF-TOKEN',
    'X-API-KEY',
    'X-API-VERSION',
    'X-Session-ID',
    'X-Device-ID',
  ],

  'exposed_headers' => [
    'X-API-VERSION',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-Session-ID',
  ],

  'max_age' => 86400, // 24 hours cache for preflight requests

  'supports_credentials' => true, // Important for cookies and authentication

];
