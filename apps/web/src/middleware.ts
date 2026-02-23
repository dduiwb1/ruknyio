import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🌐 Subdomain Routing Middleware
 * 
 * Production: Routes based on subdomains
 *   - app.rukny.io/app/*       → Dashboard (keeps /app prefix for compatibility)
 *   - accounts.rukny.io/*      → Auth pages (/login, /complete-profile, etc.)
 *   - rukny.io                 → Public pages (landing, /[username], /f/[slug])
 * 
 * Development (localhost): Path-based routing as usual (no changes)
 * 
 * Strategy: Redirects only, no rewrites — all internal path checks remain intact.
 */

// Auth-related paths (map to auth.rukny.io in production)
const AUTH_PATHS = [
  '/login',
  '/check-email',
  '/quicksign',
  '/auth/callback',
  '/auth/verify',
  '/auth/verify-2fa',
  '/welcome',
  '/complete-profile',
];

// App dashboard paths (map to app.rukny.io in production)
const APP_PATH_PREFIX = '/app';

// Paths that should be skipped by middleware
const SKIP_PATHS = [
  '/api/',
  '/uploads/',
  '/_next/',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/icons/',
  '/logos/',
];

/**
 * Extract subdomain from hostname
 * e.g., "app.rukny.io" → "app", "rukny.io" → null
 */
function getSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0];
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'rukny.io';
  
  if (host === rootDomain || host === `www.${rootDomain}`) {
    return null;
  }
  
  if (host.endsWith(`.${rootDomain}`)) {
    return host.replace(`.${rootDomain}`, '');
  }
  
  return null;
}

/**
 * Check if the path is an auth-related path
 */
function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
}

/**
 * Check if the path is an app dashboard path
 */
function isAppPath(pathname: string): boolean {
  return pathname === APP_PATH_PREFIX || pathname.startsWith(APP_PATH_PREFIX + '/');
}

/**
 * Check if middleware should skip this request
 */
function shouldSkip(pathname: string): boolean {
  return SKIP_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Check if we're in development/localhost mode
 */
function isLocalhost(hostname: string): boolean {
  const host = hostname.split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

/**
 * Build a redirect URL to a specific subdomain
 */
function buildSubdomainUrl(
  subdomain: string | null,
  pathname: string,
  search: string,
  rootDomain: string,
  protocol: string
): string {
  const domain = subdomain ? `${subdomain}.${rootDomain}` : rootDomain;
  return `${protocol}://${domain}${pathname}${search}`;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost:3000';

  // Skip middleware for static assets, API routes, etc.
  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  // In development (localhost), don't apply subdomain routing
  if (isLocalhost(hostname)) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(hostname);
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'rukny.io';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const search = request.nextUrl.search;

  // ========================================
  // 📱 app.rukny.io — Dashboard Subdomain
  // ========================================
  if (subdomain === 'app') {
    // Root of app subdomain → redirect to /app (dashboard)
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(buildSubdomainUrl('app', '/app', search, rootDomain, protocol))
      );
    }

    // Auth routes on app subdomain → redirect to accounts subdomain
    if (isAuthPath(pathname)) {
      return NextResponse.redirect(
        new URL(buildSubdomainUrl('accounts', pathname, search, rootDomain, protocol))
      );
    }

    // App routes (/app/*) → serve as-is (no rewrite needed)
    if (isAppPath(pathname)) {
      return NextResponse.next();
    }

    // Public pages like /[username] or /f/[slug] on app subdomain → redirect to main domain
    return NextResponse.redirect(
      new URL(buildSubdomainUrl(null, pathname, search, rootDomain, protocol))
    );
  }

  // ========================================
  // 🔐 accounts.rukny.io — Auth Subdomain
  // ========================================
  if (subdomain === 'accounts') {
    // Root of accounts subdomain → redirect to /login
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(buildSubdomainUrl('accounts', '/login', search, rootDomain, protocol))
      );
    }

    // App routes on accounts subdomain → redirect to app subdomain
    if (isAppPath(pathname)) {
      return NextResponse.redirect(
        new URL(buildSubdomainUrl('app', pathname, search, rootDomain, protocol))
      );
    }

    // Auth routes → serve as-is
    if (isAuthPath(pathname)) {
      return NextResponse.next();
    }

    // Any other route on accounts subdomain → redirect to main domain
    return NextResponse.redirect(
      new URL(buildSubdomainUrl(null, pathname, search, rootDomain, protocol))
    );
  }

  // ========================================
  // 🌐 rukny.io — Main Domain (Public Only)
  // ========================================
  
  // Redirect /app/* routes to app subdomain
  if (isAppPath(pathname)) {
    return NextResponse.redirect(
      new URL(buildSubdomainUrl('app', pathname, search, rootDomain, protocol))
    );
  }

  // Redirect auth routes to accounts subdomain
  if (isAuthPath(pathname)) {
    return NextResponse.redirect(
      new URL(buildSubdomainUrl('accounts', pathname, search, rootDomain, protocol))
    );
  }

  // Public routes pass through (landing page, /[username], /f/[slug], /privacy, /terms, etc.)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     */
    '/((?!_next/static|_next/image).*)',
  ],
};
