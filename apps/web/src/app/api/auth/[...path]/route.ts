/**
 * 🔐 Auth API Proxy Route
 * 
 * This route handler proxies auth requests to the backend API
 * and properly forwards Set-Cookie headers back to the browser.
 * 
 * Next.js rewrites don't always properly forward Set-Cookie headers,
 * so we need this manual proxy for auth endpoints that set cookies.
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_BACKEND_URL || 'http://localhost:3001';
const BACKEND_TIMEOUT_MS = 25_000; // 25s for auth/DB operations

// Headers that should not be forwarded
const EXCLUDED_REQUEST_HEADERS = ['host', 'connection', 'content-length'];
const EXCLUDED_RESPONSE_HEADERS = ['content-encoding', 'transfer-encoding'];

async function proxyRequest(request: NextRequest, method: string) {
  // Get the path from the URL
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api/auth/', '');
  const targetUrl = `${API_URL}/api/v1/auth/${pathSegments}${url.search}`;

  // Forward headers including cookies
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!EXCLUDED_REQUEST_HEADERS.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // 🔒 Forward cookies from the original request
  // This is critical for refresh token which is in httpOnly cookie
  const cookies = request.headers.get('cookie');
  if (cookies) {
    headers.set('cookie', cookies);
  }

  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
    // Note: credentials doesn't work in Node.js fetch, we manually forward cookies above
  };

  // Add body for non-GET requests
  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // No body or invalid JSON
      }
    } else {
      try {
        fetchOptions.body = await request.text();
      } catch {
        // No body
      }
    }
  }

  try {
    // 🔒 Debug logging for refresh endpoint
    if (pathSegments === 'refresh') {
      console.log('[Auth Proxy] Refresh request:', {
        hasCookies: !!cookies,
        cookieNames: cookies ? cookies.split(';').map(c => c.trim().split('=')[0]) : [],
      });
    }

    // Make the request to the backend (with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);
    const response = await fetch(targetUrl, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // Get response body
    const responseBody = await response.text();

    // 🔒 Debug logging for refresh endpoint
    if (pathSegments === 'refresh') {
      console.log('[Auth Proxy] Refresh response:', {
        status: response.status,
        hasSetCookie: response.headers.has('set-cookie'),
      });
    }

    // Create response with proper headers
    const responseHeaders = new Headers();
    // 🔒 Forward ALL Set-Cookie headers with full attributes (HttpOnly, Max-Age, etc.)
    // Fetch API merges multiple set-cookie into one; getSetCookie() returns each separately (Node 19+)
    const setCookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [response.headers.get('set-cookie')].filter(Boolean) as string[];
    for (const cookie of setCookies) {
      responseHeaders.append('set-cookie', cookie);
    }
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return; // already handled above
      if (!EXCLUDED_RESPONSE_HEADERS.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.cause?.code || error?.code || error?.name || 'UNKNOWN';

    console.error('[Auth Proxy] Error:', {
      message: errorMessage,
      code: errorCode,
      targetUrl,
      method,
    });

    const isTimeout = errorCode === 'ABORT_ERR' || error?.name === 'AbortError';
    const isRefused = errorCode === 'ECONNREFUSED';
    const isNetwork = ['ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(errorCode);

    return NextResponse.json(
      {
        error: 'Backend service unavailable',
        message: isTimeout
          ? `Backend at ${API_URL} did not respond in time.`
          : isRefused || isNetwork
            ? `Cannot reach backend at ${API_URL}. Check that the API (e.g. auth.rukny.io) is running on Railway.`
            : 'Failed to connect to auth service',
        code: errorCode,
        hint: 'Open https://auth.rukny.io or https://auth.rukny.io/api/v1/health in a browser. If you see "Application failed to respond", fix the API deploy (env vars, logs) on Railway.',
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return proxyRequest(request, 'PUT');
}

export async function PATCH(request: NextRequest) {
  return proxyRequest(request, 'PATCH');
}

export async function DELETE(request: NextRequest) {
  return proxyRequest(request, 'DELETE');
}
