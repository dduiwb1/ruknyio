import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectedRoutes, authRoutes } from '@/lib/config';

/**
 * @deprecated This file is no longer used. Route protection and subdomain routing
 * are handled by src/middleware.ts instead.
 * 
 * 🛡️ Next.js Proxy - Route Protection (LEGACY)
 */

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route: string) => 
    pathname.startsWith(route)
  );

  // Check if route is an auth route
  const isAuthRoute = authRoutes.some((route: string) => 
    pathname.startsWith(route)
  );

  // Get access token from cookie or check localStorage marker
  // Note: We can't access localStorage in proxy, so we check for a cookie
  // In production, cookies have __Secure- prefix
  const accessToken = request.cookies.get('__Secure-access_token')?.value || 
                      request.cookies.get('access_token')?.value;
  // Backend uses 'refresh_token' in dev, '__Secure-refresh_token' in prod
  const hasSession = request.cookies.get('__Secure-refresh_token')?.value ||
                     request.cookies.get('refresh_token')?.value;

  // If trying to access protected route without auth
  if (isProtectedRoute && !accessToken && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user tries to access auth routes
  if (isAuthRoute && (accessToken || hasSession)) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  return NextResponse.next();
}

// Configure which paths the proxy runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
