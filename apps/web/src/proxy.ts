import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🌐 Subdomain Routing & Route Protection Proxy
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

// Auth-related paths (map to accounts.rukny.io in production)
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

// Paths that should be skipped
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

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
}

function isAppPath(pathname: string): boolean {
  return pathname === APP_PATH_PREFIX || pathname.startsWith(APP_PATH_PREFIX + '/');
}

function shouldSkip(pathname: string): boolean {
  return SKIP_PATHS.some(path => pathname.startsWith(path));
}

function isLocalhost(hostname: string): boolean {
  const host = hostname.split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost:3000';

  // Skip for static assets, API routes, etc.
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
    // Auth routes on app subdomain → redirect to accounts subdomain
    if (isAuthPath(pathname)) {
      return NextResponse.redirect(
        new URL(buildSubdomainUrl('accounts', pathname, search, rootDomain, protocol))
      );
    }

    // If path has /app prefix, redirect to strip it for clean URLs
    // e.g., app.rukny.io/app/settings → app.rukny.io/settings
    if (isAppPath(pathname)) {
      const cleanPath = pathname.replace(/^\/app/, '') || '/';
      return NextResponse.redirect(
        new URL(buildSubdomainUrl('app', cleanPath, search, rootDomain, protocol))
      );
    }

    // Rewrite all other paths by prepending /app internally
    // e.g., app.rukny.io/settings → internally serves /app/settings
    // URL stays clean: app.rukny.io/settings
    const url = request.nextUrl.clone();
    url.pathname = `/app${pathname}`;
    return NextResponse.rewrite(url);
  }

  // ========================================
  // 🔐 accounts.rukny.io — Auth Subdomain
  // ========================================
  if (subdomain === 'accounts') {
    if (pathname === '/') {
      return NextResponse.redirect(
        new URL(buildSubdomainUrl('accounts', '/login', search, rootDomain, protocol))
      );
    }

    if (isAppPath(pathname)) {
      return NextResponse.redirect(
        new URL(buildSubdomainUrl('app', pathname, search, rootDomain, protocol))
      );
    }

    if (isAuthPath(pathname)) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL(buildSubdomainUrl(null, pathname, search, rootDomain, protocol))
    );
  }

  // ========================================
  // 🌐 rukny.io — Main Domain (Public Only)
  // ========================================
  
  if (isAppPath(pathname)) {
    const cleanPath = pathname.replace(/^\/app/, '') || '/';
    return NextResponse.redirect(
      new URL(buildSubdomainUrl('app', cleanPath, search, rootDomain, protocol))
    );
  }

  if (isAuthPath(pathname)) {
    return NextResponse.redirect(
      new URL(buildSubdomainUrl('accounts', pathname, search, rootDomain, protocol))
    );
  }

  // Public routes pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image).*)',
  ],
};
