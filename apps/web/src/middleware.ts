import { NextRequest, NextResponse } from 'next/server';
import { hasSessionCookie } from '@/lib/session';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/auth/callback',
  '/auth/verify',
  '/auth/verify-2fa',
  '/check-email',
];

// Routes that require authentication but NOT a completed profile
const AUTH_ONLY_ROUTES = ['/complete-profile'];

const APP_HOST = normalizeConfiguredHost(
  process.env.APP_HOST || process.env.NEXT_PUBLIC_APP_HOST,
  'app.rukny.xyz',
);
const ACCOUNTS_HOST = normalizeConfiguredHost(
  process.env.ACCOUNTS_HOST || process.env.NEXT_PUBLIC_ACCOUNTS_HOST,
  'accounts.rukny.xyz',
);

// Static / asset prefixes to skip entirely
const SKIP_PREFIXES = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/images',
  '/fonts',
];

function normalizeHost(host: string | null): string {
  if (!host) return '';
  return host.split(',')[0].trim().toLowerCase();
}

function normalizeConfiguredHost(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0];
}

function hostWithoutPort(host: string): string {
  return host.split(':')[0].toLowerCase();
}

function isLocalHost(host: string): boolean {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.localhost')
  );
}

function getSubdomain(host: string): string | null {
  // Extract first part of hostname (subdomain)
  // e.g., "app.rukny.xyz" -> "app", "localhost:3000" -> null
  const withoutPort = hostWithoutPort(host);
  const parts = withoutPort.split('.');
  if (parts.length < 2 || isLocalHost(withoutPort)) {
    return null;
  }
  return parts[0];
}

function buildCrossHostUrl(
  request: NextRequest,
  targetSubdomain: string,
  pathname: string,
  search: string,
): URL {
  const requestHost = normalizeHost(
    request.headers.get('x-forwarded-host') || request.headers.get('host'),
  );
  const hostWithoutSubdomain = requestHost.split('.').slice(1).join('.');
  const protocol = request.nextUrl.protocol;
  const newHost = hostWithoutSubdomain ? `${targetSubdomain}.${hostWithoutSubdomain}` : targetSubdomain;
  return new URL(`${protocol}//${newHost}${pathname}${search}`);
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip static assets and API routes (BFF proxy handles its own auth)
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const requestHost = normalizeHost(
    request.headers.get('x-forwarded-host') || request.headers.get('host'),
  );
  const requestHostName = hostWithoutPort(requestHost);
  const subdomain = getSubdomain(requestHostName);
  const isAppHost = subdomain === 'app';
  const isAccountsHost = subdomain === 'accounts';
  const useSubdomainRouting = subdomain !== null && (isAppHost || isAccountsHost);

  const isAuthenticated = hasSessionCookie(
    request.headers.get('cookie'),
  );

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthDomainRoute = isPublicRoute || isAuthOnlyRoute;

  // Enforce domain separation in production:
  // - app.rukny.xyz: dashboard/app routes
  // - accounts.rukny.xyz: login/auth routes
  if (useSubdomainRouting) {
    if (pathname === '/') {
      if (isAppHost) {
        if (isAuthenticated) {
          return NextResponse.redirect(
            buildCrossHostUrl(request, 'app', '/app', ''),
          );
        }

        const loginUrl = buildCrossHostUrl(request, 'accounts', '/login', '');
        loginUrl.searchParams.set('callbackUrl', '/app');
        return NextResponse.redirect(loginUrl);
      }

      if (isAccountsHost) {
        return NextResponse.redirect(
          buildCrossHostUrl(request, 'accounts', '/login', ''),
        );
      }
    }

    if (isAppHost && isAuthDomainRoute) {
      return NextResponse.redirect(
        buildCrossHostUrl(request, 'accounts', pathname, search),
      );
    }

    if (isAccountsHost && pathname.startsWith('/app')) {
      return NextResponse.redirect(
        buildCrossHostUrl(request, 'app', pathname, search),
      );
    }
  }

  // ─── Unauthenticated user trying to access protected route ──
  // AUTH_ONLY_ROUTES (like /complete-profile) are accessible without session
  // because QuickSign SIGNUP users arrive with a token but no cookies yet.
  if (!isAuthenticated && !isPublicRoute && !isAuthOnlyRoute) {
    const loginUrl = useSubdomainRouting && isAppHost
      ? buildCrossHostUrl(request, 'accounts', '/login', '')
      : new URL('/login', request.url);

    if (useSubdomainRouting && isAppHost) {
      const callbackUrl = buildCrossHostUrl(request, 'app', pathname, search);
      loginUrl.searchParams.set(
        'callbackUrl',
        `${callbackUrl.pathname}${callbackUrl.search}`,
      );
    } else {
      loginUrl.searchParams.set('callbackUrl', `${pathname}${search}`);
    }

    return NextResponse.redirect(loginUrl);
  }

  // ─── Authenticated user trying to access login page ─────────
  // Don't redirect away from AUTH_ONLY_ROUTES (user may need to complete profile)
  if (isAuthenticated && isPublicRoute) {
    // Keep login/auth routes renderable on accounts subdomain to avoid
    // cross-subdomain redirect loops when cookies are scoped to a single host.
    if (useSubdomainRouting && isAccountsHost) {
      return NextResponse.next();
    }

    const appUrl = useSubdomainRouting
      ? buildCrossHostUrl(request, 'app', '/app', '')
      : new URL('/app', request.url);
    return NextResponse.redirect(appUrl);
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
