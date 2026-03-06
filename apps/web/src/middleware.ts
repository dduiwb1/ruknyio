import { NextRequest, NextResponse } from 'next/server';
import { hasSessionCookie } from '@/lib/session';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/auth/callback',
  '/auth/verify',
  '/auth/verify-2fa',
];

// Routes that require authentication but NOT a completed profile
const AUTH_ONLY_ROUTES = ['/complete-profile'];

// Static / asset prefixes to skip entirely
const SKIP_PREFIXES = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/images',
  '/fonts',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and API routes (BFF proxy handles its own auth)
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const isAuthenticated = hasSessionCookie(
    request.headers.get('cookie'),
  );

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // ─── Unauthenticated user trying to access protected route ──
  // AUTH_ONLY_ROUTES (like /complete-profile) are accessible without session
  // because QuickSign SIGNUP users arrive with a token but no cookies yet.
  if (!isAuthenticated && !isPublicRoute && !isAuthOnlyRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Authenticated user trying to access login page ─────────
  // Don't redirect away from AUTH_ONLY_ROUTES (user may need to complete profile)
  if (isAuthenticated && isPublicRoute) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  // ─── Add security headers ──────────────────────────────────
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except _next/static, _next/image, favicon.ico
     */
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};
