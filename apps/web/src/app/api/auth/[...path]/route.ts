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

    // Make the request to the backend
    const response = await fetch(targetUrl, fetchOptions);

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
    response.headers.forEach((value, key) => {
      if (!EXCLUDED_RESPONSE_HEADERS.includes(key.toLowerCase())) {
        // Forward Set-Cookie headers properly
        if (key.toLowerCase() === 'set-cookie') {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    });

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    // Enhanced error logging
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.cause?.code || error?.code || 'UNKNOWN';
    
    console.error('[Auth Proxy] Error:', {
      message: errorMessage,
      code: errorCode,
      targetUrl,
      method,
    });

    // Provide helpful error messages based on error type
    if (errorCode === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          error: 'Backend service unavailable',
          message: `Cannot connect to backend API at ${API_URL}. Please ensure the backend server is running on port 3001.`,
          hint: 'Run `npm run dev:api` or `npm run dev` from the project root to start the backend server.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: 'Proxy error',
        message: 'Failed to connect to auth service',
        details: errorMessage,
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
