<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
  public function handle(Request $request, Closure $next, $permission)
  {
    if (!$request->user()) {
      return response()->json([
        'success' => false,
        'message' => 'Unauthenticated'
      ], 401);
    }

    $user = $request->user();

    if ($user->can($permission)) {
      return $next($request);
    }

    return response()->json([
      'success' => false,
      'message' => 'Unauthorized. Missing permission: ' . $permission
    ], 403);
  }
}
