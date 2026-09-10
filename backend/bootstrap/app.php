<?php

// bootstrap/app.php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Services\Admin\AuditLogService;

return Application::configure(basePath: dirname(__DIR__))
  ->withRouting(
    web: __DIR__ . '/../routes/web.php',
    api: __DIR__ . '/../routes/api.php',
    commands: __DIR__ . '/../routes/console.php',
    health: '/up',
  )
  ->withMiddleware(function (Middleware $middleware) {
    // Middleware Aliases
    $middleware->alias([
      'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
      'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,
      'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
      'can' => \Illuminate\Auth\Middleware\Authorize::class,
      'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
      'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
      'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
      'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,  // Can keep or remove
      'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
      'role' => \App\Http\Middleware\CheckRole::class,
      'permission' => \App\Http\Middleware\CheckPermission::class,
    ]);

    // Trust Proxies - Allow all proxies and forward all headers
    $middleware->trustProxies(
      at: [
        '172.20.0.0/16',
        '192.168.0.0/16',
        '10.0.0.0/8',
      ],
      headers: Request::HEADER_X_FORWARDED_FOR |
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB
    );

    // API Middleware Group - Prepend ForceJsonResponse
    $middleware->api(prepend: [
      \App\Http\Middleware\ForceJsonResponse::class,
    ]);

    // API Middleware Group - REMOVE THROTTLE
    $middleware->api(append: [
      // REMOVED: \Illuminate\Routing\Middleware\ThrottleRequests::class . ':api',
      \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ]);
  })
  ->withExceptions(function (Exceptions $exceptions) {
    $exceptions->shouldRenderJsonWhen(function ($request, $e) {
      return $request->is('api/*') || $request->expectsJson();
    });

    $exceptions->render(function (ValidationException $e, Request $request) {
      if ($request->expectsJson()) {
        return response()->json([
          'success' => false,
          'errors' => $e->errors(),
        ], 422);
      }
    });
  })
  ->create();
