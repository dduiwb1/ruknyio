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

function getApiUrl(): string {
  return process.env.API_BACKEND_URL || 'https://auth.rukny.io';
}
const BACKEND_TIMEOUT_MS = 25_000; // 25s for auth/DB operations

// Headers that should not be forwarded
const EXCLUDED_REQUEST_HEADERS = ['host', 'connection', 'content-length'];
const EXCLUDED_RESPONSE_HEADERS = ['content-encoding', 'transfer-encoding'];

async function proxyRequest(request: NextRequest, method: string) {
  // Get the path from the URL
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace('/api/auth/', '');
  const apiUrl = getApiUrl();
  const targetUrl = `${apiUrl}/api/v1/auth/${pathSegments}${url.search}`;

  // Debug: Log oauth/exchange requests
  if (pathSegments === 'oauth/exchange') {
    // OAuth exchange request handling
  }

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
        
        // Debug: Log oauth/exchange body
        if (pathSegments === 'oauth/exchange') {
          // OAuth exchange body handling
        }
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
    // Debug logging for refresh endpoint
    if (pathSegments === 'refresh') {
      // Refresh request tracking
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

    // Debug logging for refresh and oauth exchange endpoints
    if (pathSegments === 'refresh') {
      // Refresh response tracking
    }

    if (pathSegments === 'oauth/exchange') {
      // OAuth exchange response tracking
    }

    // Create response with proper headers
    const responseHeaders = new Headers();
    
    // Debug: Log all response headers
    if (pathSegments === 'oauth/exchange') {
      // Response headers logged
    }
    
    // 🔒 Forward ALL response headers from backend
    response.headers.forEach((value, key) => {
      // For set-cookie, we need to append (not set) because there can be multiple
      if (key.toLowerCase() === 'set-cookie') {
        responseHeaders.append('set-cookie', value);
      } else if (!EXCLUDED_RESPONSE_HEADERS.includes(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });
    
    if (pathSegments === 'oauth/exchange') {
      // Set-Cookie headers configured
    }

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.cause?.code || error?.code || error?.name || 'UNKNOWN';

    // Auth proxy error handling
    const isTimeout = errorCode === 'ABORT_ERR' || error?.name === 'AbortError';
    const isRefused = errorCode === 'ECONNREFUSED';
    const isNetwork = ['ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'].includes(errorCode);

    return NextResponse.json(
      {
        error: 'Backend service unavailable',
        message: isTimeout
          ? `Backend at ${apiUrl} did not respond in time.`
          : isRefused || isNetwork
            ? `Cannot reach backend at ${apiUrl}. Check that the API (e.g. auth.rukny.io) is running on Railway.`
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
