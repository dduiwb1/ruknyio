import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL || 'http://localhost:3001';

/**
 * BFF Proxy — Backend For Frontend
 *
 * All client-side API calls go to `/api/...` which this catch-all
 * route handler forwards to the NestJS backend.
 *
 * Benefits:
 * - httpOnly cookies are forwarded automatically (same origin)
 * - The real API URL is never exposed to the browser
 * - CSRF tokens are validated server-side
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> },
) {
  const { proxy } = await params;
  const path = proxy.join('/');
  const targetUrl = new URL(`/api/v1/${path}`, API_URL);

  // Forward query params
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  // Build outgoing headers — forward cookies and relevant headers
  const reqHeaders = new Headers();

  // Forward cookies
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  if (cookieHeader) {
    reqHeaders.set('Cookie', cookieHeader);
  }

  // Forward content type
  const contentType = request.headers.get('content-type');
  if (contentType) {
    reqHeaders.set('Content-Type', contentType);
  }

  // Forward CSRF token
  const csrfToken = request.headers.get('x-csrf-token') ||
    cookieStore.get('csrf_token')?.value;
  if (csrfToken) {
    reqHeaders.set('x-csrf-token', csrfToken);
  }

  // Forward auth-related headers
  const forwardHeaders = [
    'accept',
    'accept-language',
    'user-agent',
    'x-forwarded-for',
    'x-real-ip',
  ];
  for (const name of forwardHeaders) {
    const value = request.headers.get(name);
    if (value) reqHeaders.set(name, value);
  }

  // Forward origin for CORS/CSRF checks
  const origin = request.headers.get('origin');
  if (origin) reqHeaders.set('origin', origin);

  try {
    // Get body for non-GET requests
    let body: BodyInit | null = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      // Try to get body as-is (supports JSON, FormData, etc.)
      body = await request.arrayBuffer().then((buf) =>
        buf.byteLength > 0 ? buf : null,
      );
    }

    const backendRes = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: reqHeaders,
      body,
      redirect: 'manual',
    });

    // Build response headers
    const resHeaders = new Headers();

    // Forward content type
    const resContentType = backendRes.headers.get('content-type');
    if (resContentType) {
      resHeaders.set('Content-Type', resContentType);
    }

    // Forward Set-Cookie from backend (critical for auth)
    const setCookies = backendRes.headers.getSetCookie?.() ?? [];
    for (const cookie of setCookies) {
      resHeaders.append('Set-Cookie', cookie);
    }

    // Forward cache control
    const cacheControl = backendRes.headers.get('cache-control');
    if (cacheControl) {
      resHeaders.set('Cache-Control', cacheControl);
    }

    // Handle redirects
    if ([301, 302, 303, 307, 308].includes(backendRes.status)) {
      const location = backendRes.headers.get('location');
      if (location) {
        resHeaders.set('Location', location);
      }
      return new NextResponse(null, {
        status: backendRes.status,
        headers: resHeaders,
      });
    }

    // Empty responses
    if (backendRes.status === 204) {
      return new NextResponse(null, {
        status: 204,
        headers: resHeaders,
      });
    }

    // Stream the response body
    const responseBody = await backendRes.arrayBuffer();
    return new NextResponse(responseBody, {
      status: backendRes.status,
      headers: resHeaders,
    });
  } catch (err) {
    console.error('[BFF Proxy] Error:', err);
    return NextResponse.json(
      { message: 'فشل الاتصال بالخادم', error: 'PROXY_ERROR' },
      { status: 502 },
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
