<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\Admin\AuditLogService;
use Illuminate\Support\Facades\Log;

class AuditMiddleware
{
  protected $auditLogService;

  public function __construct(AuditLogService $auditLogService)
  {
    $this->auditLogService = $auditLogService;
  }

  public function handle(Request $request, Closure $next)
  {
    // Skip audit for certain paths
    $skipPaths = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/health'];
    if (in_array($request->path(), $skipPaths)) {
      return $next($request);
    }

    // Log the request
    try {
      $this->auditLogService->log([
        'action' => 'api_request',
        'module' => $this->getModuleFromPath($request->path()),
        'description' => $request->method() . ' ' . $request->path(),
        'data' => [
          'method' => $request->method(),
          'path' => $request->path(),
          'params' => $request->all(),
          'headers' => $request->headers->all(),
        ],
        'ip_address' => $request->ip(),
        'user_agent' => $request->userAgent(),
      ]);
    } catch (\Exception $e) {
      // Don't let audit logging break the request
      Log::error('Audit logging failed: ' . $e->getMessage());
    }

    return $next($request);
  }

  private function getModuleFromPath(string $path): string
  {
    $segments = explode('/', $path);
    // Remove 'api', 'v1', 'admin' prefixes
    $filtered = array_filter($segments, function ($segment) {
      return !in_array($segment, ['api', 'v1', 'admin']);
    });

    $module = reset($filtered);
    return $module ?: 'api';
  }
}
