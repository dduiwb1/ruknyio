/**
 * 🔐 API v1 Proxy Route
 *
 * يوجّه طلبات /api/v1/* إلى الـ API مع تمرير Cookie (access_token, refresh_token).
 * Next.js rewrites قد لا تمرر Cookie من المتصفح إلى الـ backend، مما يسبب 401 وتسجيل خروج سريع.
 * هذا الـ proxy يضمن إرسال الكوكيز مع كل طلب.
 */

import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_BACKEND_URL || 'http://localhost:3001';

const EXCLUDED_REQUEST_HEADERS = ['host', 'connection', 'content-length'];
const EXCLUDED_RESPONSE_HEADERS = ['content-encoding', 'transfer-encoding'];

async function proxyRequest(request: NextRequest, method: string) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.replace(/^\/api\/v1\/?/, '') || '';
  const targetUrl = `${API_URL}/api/v1/${pathSegments}${url.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!EXCLUDED_REQUEST_HEADERS.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const cookies = request.headers.get('cookie');
  if (cookies) {
    headers.set('cookie', cookies);
  }

  const fetchOptions: RequestInit = { method, headers };

  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // no body
      }
    } else {
      try {
        fetchOptions.body = await request.text();
      } catch {
        // no body
      }
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);
    const responseBody = await response.text();

    const responseHeaders = new Headers();
    const setCookies =
      typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : [response.headers.get('set-cookie')].filter(Boolean) as string[];
    for (const cookie of setCookies) {
      responseHeaders.append('set-cookie', cookie);
    }
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') return;
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
    const errorCode = error?.cause?.code || error?.code || 'UNKNOWN';
    console.error('[API v1 Proxy] Error:', { message: errorMessage, code: errorCode, targetUrl, method });
    if (errorCode === 'ECONNREFUSED') {
      return NextResponse.json(
        {
          error: 'Backend service unavailable',
          message: `Cannot connect to backend API at ${API_URL}. Ensure the backend is running (e.g. npm run dev:api).`,
        },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: 'Proxy error', message: 'Failed to reach API', details: errorMessage },
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
