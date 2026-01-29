/**
 * 🔐 Secure API Client
 * 
 * A fetch wrapper that automatically handles:
 * - Authentication headers
 * - Token refresh on 401
 * - Credentials for httpOnly cookies
 * - Redirect to login on auth failure
 * 
 * Uses shared refresh logic from client.ts to prevent duplicate refresh attempts
 */

import { API_URL } from '@/lib/config';
import { 
  getAccessToken, 
  clearAccessToken, 
  setAccessToken,
  getRefreshState,
  setRefreshState,
  resetRefreshState 
} from './client';

interface SecureFetchOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

// Auth pages where redirect should NOT happen
const AUTH_PAGES = [
  '/login',
  '/register',
  '/quicksign',
  '/complete-profile',
  '/auth/',
  '/forgot-password',
  '/reset-password',
];

/**
 * Handle authentication failure - redirect to login
 */
function handleAuthFailure(reason: 'expired' | 'invalid' = 'expired'): void {
  clearAccessToken();
  setRefreshState(false, true); // isRefreshing = false, refreshFailed = true
  
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    // 🔒 Don't redirect if already on auth pages
    const isAuthPage = AUTH_PAGES.some(page => pathname.startsWith(page));
    if (!isAuthPage) {
      window.location.href = `/login?session=${reason}`;
    }
  }
}

// Shared promise to prevent concurrent refresh attempts
let sharedRefreshPromise: Promise<string | null> | null = null;

/**
 * Refresh access token using refresh token cookie
 * Uses a shared promise to ensure only one refresh happens at a time
 */
async function refreshAccessToken(): Promise<string | null> {
  const { isRefreshing, refreshFailed } = getRefreshState();
  
  // If refresh already failed, don't try again
  if (refreshFailed) {
    return null;
  }

  // 🔒 If already refreshing, wait for the shared promise
  if (isRefreshing && sharedRefreshPromise) {
    return sharedRefreshPromise;
  }

  setRefreshState(true, false); // isRefreshing = true

  // Create a shared promise
  // 🔒 Use Route Handler for proper cookie forwarding
  sharedRefreshPromise = (async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // API will clear the invalid cookie
        handleAuthFailure('expired');
        return null;
      }

      const data = await response.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        setRefreshState(false, false); // isRefreshing = false
        sharedRefreshPromise = null;
        return data.access_token;
      }

      handleAuthFailure('invalid');
      return null;
    } catch {
      handleAuthFailure('expired');
      return null;
    } finally {
      setRefreshState(false, getRefreshState().refreshFailed);
      if (getRefreshState().refreshFailed) {
        sharedRefreshPromise = null;
      }
    }
  })();

  return sharedRefreshPromise;
}

/**
 * Secure fetch that includes authentication and handles 401
 */
export async function secureFetch(
  url: string,
  options: SecureFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, skipRefresh = false, headers: customHeaders, ...restOptions } = options;
  const { refreshFailed } = getRefreshState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // Add auth token if available and not skipped
  let token = skipAuth ? null : getAccessToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...restOptions,
    headers,
    credentials: 'include',
  });

  // Handle 401 - try to refresh token
  if (response.status === 401 && !skipRefresh && !refreshFailed) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      // Retry with new token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...restOptions,
        headers,
        credentials: 'include',
      });
    }
  }

  return response;
}

/**
 * GET request helper
 */
export async function secureGet<T>(url: string): Promise<T> {
  const response = await secureFetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status}`);
  }
  return response.json();
}

/**
 * POST request helper
 */
export async function securePost<T>(url: string, data?: unknown): Promise<T> {
  const response = await secureFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!response.ok) {
    throw new Error(`POST ${url} failed: ${response.status}`);
  }
  return response.json();
}

export default secureFetch;
