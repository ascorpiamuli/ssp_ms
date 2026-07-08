<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
  public function handle(Request $request, Closure $next, ...$roles)
  {
    if (!$request->user()) {
      return response()->json([
        'success' => false,
        'message' => 'Unauthenticated'
      ], 401);
    }

    $user = $request->user();

    foreach ($roles as $role) {
      if ($user->role === $role || $user->hasRole($role)) {
        return $next($request);
      }
    }

    return response()->json([
      'success' => false,
      'message' => 'Unauthorized. Required role: ' . implode(', ', $roles)
    ], 403);
  }
}
