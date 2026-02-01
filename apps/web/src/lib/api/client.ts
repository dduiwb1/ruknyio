/**
 * 🔌 API Client - Base configuration for API calls
 * 
 * Features:
 * - Typed fetch wrapper
 * - Automatic token refresh
 * - Error handling
 * - Request/Response interceptors
 */

import { z } from 'zod';
import { API_URL, buildApiPath } from '@/lib/config';

// API Error schema
export const ApiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Custom error class for API errors
export class ApiException extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string[]
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// Request configuration
interface RequestConfig extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

// Response type wrapper
interface ApiResponse<T> {
  data: T;
  status: number;
}

/**
 * Build URL with query parameters
 * 
 * 🔒 Auth endpoints use /api/auth/ (Route Handler) instead of /api/v1/auth/
 * This ensures proper Set-Cookie header forwarding from the backend.
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  // API_URL is a relative path like /api/v1
  const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // 🔒 Use Route Handler for auth endpoints (proper cookie forwarding)
  // /api/v1/auth/* -> /api/auth/*
  let fullPath: string;
  if (path.startsWith('/auth/')) {
    fullPath = `/api${path}`; // /api/auth/refresh instead of /api/v1/auth/refresh
  } else {
    fullPath = `${baseUrl}${path}`;
  }
  
  // If no params, just return the path
  if (!params || Object.keys(params).length === 0) {
    return fullPath;
  }
  
  // Build query string manually for relative paths
  const queryParts: string[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  });
  
  const queryString = queryParts.join('&');
  return queryString ? `${fullPath}?${queryString}` : fullPath;
}

/**
 * 🔒 CSRF Token Management
 * Access Token is now in httpOnly cookie (not accessible from JS)
 * We only need to manage CSRF token on the client
 */
let csrfToken: string | null = null;

/**
 * Get CSRF token (for protected requests)
 */
export function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null;
  // Try memory first, then cookie
  if (csrfToken) return csrfToken;
  // CSRF cookie is not httpOnly, so we can read it
  const match = document.cookie.match(/(?:^|; )(?:__Secure-)?csrf_token=([^;]*)/);
  return match ? match[1] : null;
}

/**
 * Store CSRF token (from login response)
 */
export function setCsrfToken(token: string): void {
  csrfToken = token;
}

/**
 * Clear CSRF token
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

/**
 * @deprecated Access token is now in httpOnly cookie
 * This function returns null - kept for backwards compatibility
 */
export function getAccessToken(): string | null {
  // Access token is in httpOnly cookie, not accessible from JS
  // Return null - the browser will send the cookie automatically
  return null;
}

/**
 * @deprecated Access token is now in httpOnly cookie
 */
export function setAccessToken(token: string): void {
  // No-op - access token is managed via httpOnly cookie
  console.warn('[Auth] setAccessToken is deprecated - token is now in httpOnly cookie');
}

/**
 * @deprecated Use clearCsrfToken instead
 */
export function clearAccessToken(): void {
  clearCsrfToken();
}

// ===== Refresh Token Protection (Shared State) =====
let isRefreshing = false;
let refreshFailed = false;
let refreshPromise: Promise<string | null> | null = null;
let lastRefreshTime: number = Date.now();

/**
 * Update the last refresh time (for session timeout warning)
 */
export function updateLastRefreshTime(): void {
  lastRefreshTime = Date.now();
}

// ===== Silent Refresh (تقليل انقطاع الجلسة) =====
let silentRefreshTimerId: ReturnType<typeof setTimeout> | null = null;

/**
 * Schedule a single silent refresh before access token expires.
 * Refreshes at ~80% of expires_in (min 1 min) to avoid session gap.
 */
export function scheduleSilentRefresh(expiresInSeconds: number): void {
  if (typeof window === 'undefined') return;
  clearSilentRefresh();
  const ms = Math.max(60_000, Math.floor(expiresInSeconds * 0.8) * 1000);
  silentRefreshTimerId = setTimeout(async () => {
    silentRefreshTimerId = null;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.csrf_token) {
        setCsrfToken(data.csrf_token);
        updateLastRefreshTime();
        if (typeof data.expires_in === 'number') {
          scheduleSilentRefresh(data.expires_in);
        }
      }
    } catch {
      // ignore; next 401 will trigger normal refresh
    }
  }, ms);
}

/**
 * Clear silent refresh timer (e.g. on logout).
 */
export function clearSilentRefresh(): void {
  if (silentRefreshTimerId) {
    clearTimeout(silentRefreshTimerId);
    silentRefreshTimerId = null;
  }
}

/**
 * Get the last refresh time
 */
export function getLastRefreshTime(): number {
  return lastRefreshTime;
}

/**
 * Get current refresh state (for use by api-client.ts)
 */
export function getRefreshState(): { isRefreshing: boolean; refreshFailed: boolean } {
  return { isRefreshing, refreshFailed };
}

/**
 * Set refresh state (for use by api-client.ts)
 */
export function setRefreshState(refreshing: boolean, failed?: boolean): void {
  isRefreshing = refreshing;
  if (failed !== undefined) {
    refreshFailed = failed;
  }
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
  clearSilentRefresh();
  refreshFailed = true;
  refreshPromise = null;
  
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;

    // Only auto-redirect on protected app routes.
    // Public pages like '/' should not force a login redirect.
    const isProtectedRoute = pathname === '/app' || pathname.startsWith('/app/');

    // 🔒 Don't redirect if already on auth pages
    const isAuthPage = AUTH_PAGES.some(page => pathname.startsWith(page));
    if (isProtectedRoute && !isAuthPage) {
      window.location.href = `/login?session=${reason}`;
    }
  }
}

/**
 * Reset refresh state (call after successful login)
 */
export function resetRefreshState(): void {
  isRefreshing = false;
  refreshFailed = false;
  refreshPromise = null;
  clearSilentRefresh();
}

/**
 * Refresh access token using refresh token cookie
 * Uses a shared promise to prevent concurrent refresh attempts
 * 
 * 🔒 Note: Access token is now in httpOnly cookie
 * This function just triggers the refresh and updates the CSRF token
 */
async function refreshAccessToken(): Promise<boolean> {
  // If refresh already failed, don't try again
  if (refreshFailed) {
    return false;
  }

  // 🔒 If already refreshing, wait for the same promise
  // This ensures all concurrent requests wait for ONE refresh attempt
  if (isRefreshing && refreshPromise) {
    return refreshPromise.then(() => !refreshFailed);
  }

  isRefreshing = true;

  // Create a shared promise that all concurrent requests will wait for
  refreshPromise = (async () => {
    try {
      // 🔒 Use Route Handler for proper cookie forwarding
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Refresh failed - session is invalid
        // The API will clear the cookie, so we just need to handle client state
        handleAuthFailure('expired');
        return null;
      }

      const data = await response.json();
      if (data.success && data.csrf_token) {
        // 🔒 Update CSRF token from response
        setCsrfToken(data.csrf_token);
        isRefreshing = false;
        refreshPromise = null;
        return data.csrf_token;
      }

      handleAuthFailure('invalid');
      return null;
    } catch {
      handleAuthFailure('expired');
      return null;
    } finally {
      isRefreshing = false;
    }
  })();

  const result = await refreshPromise;
  return result !== null;
}

/**
 * Main API client function
 * 
 * 🔒 Security:
 * - Access Token: sent via httpOnly cookie (automatic)
 * - CSRF Token: sent via X-CSRF-Token header (for state-changing requests)
 */
async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { body, params, headers: customHeaders, method = 'GET', ...restConfig } = config;
  const startTime = typeof window !== 'undefined' ? performance.now() : 0;

  const url = buildUrl(endpoint, params);

  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  // 🔒 Add CSRF token for state-changing requests
  const csrfToken = getCsrfToken();
  if (csrfToken && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    (headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
  }

  let response: Response;
  let success = true;
  let error: string | undefined;

  try {
    // Make the request (cookies sent automatically)
    response = await fetch(url, {
      ...restConfig,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include', // 🔒 Send httpOnly cookies
    });

    // Handle 401 - Try to refresh token
    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // Update CSRF token in headers for retry
        const newCsrfToken = getCsrfToken();
        if (newCsrfToken && method !== 'GET') {
          (headers as Record<string, string>)['X-CSRF-Token'] = newCsrfToken;
        }
        
        // Retry the request (new access token is in cookie)
        response = await fetch(url, {
          ...restConfig,
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          credentials: 'include',
        });
      }
    }

    // Parse response
    const responseData = await response.json().catch(() => ({}));

    // Handle errors
    if (!response.ok) {
      success = false;
      const errorMessage = Array.isArray(responseData.message)
        ? responseData.message.join(', ')
        : responseData.message || 'An error occurred';

      error = errorMessage;

      throw new ApiException(
        response.status,
        errorMessage,
        Array.isArray(responseData.message) ? responseData.message : undefined
      );
    }

    // Track API performance
    if (typeof window !== 'undefined' && startTime > 0) {
      const duration = performance.now() - startTime;
      import('@/lib/performance').then(({ trackApiRequest }) => {
        trackApiRequest(endpoint, method, duration, response.status, success);
      });
    }

    return {
      data: responseData as T,
      status: response.status,
    };
  } catch (err) {
    success = false;
    error = err instanceof Error ? err.message : 'Unknown error';

    // Track failed API request
    if (typeof window !== 'undefined' && startTime > 0) {
      const duration = performance.now() - startTime;
      import('@/lib/performance').then(({ trackApiRequest }) => {
        trackApiRequest(endpoint, method, duration, 0, false, error);
      });
    }

    throw err;
  }
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>) =>
    apiClient<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};

/**
 * Storage / upload API client used by useStorage.
 * - get: returns response data (unwraps api.get)
 * - upload: FormData POST (no Content-Type)
 * - delete: void
 */
export function getApiClient() {
  const strip = (s: string) => s.replace(/^\/+/, '');

  return {
    async get<T>(endpoint: string): Promise<T> {
      const res = await api.get<T>(endpoint);
      return (res as ApiResponse<T>).data;
    },

    async upload<T>(endpoint: string, formData: FormData): Promise<T> {
      const path = buildApiPath(strip(endpoint));
      const token = getAccessToken();
      const res = await fetch(path, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { message?: string }).message ?? `Upload failed: ${res.status}`);
      }
      return res.json();
    },

    async post<T = void>(endpoint: string, body?: unknown): Promise<T> {
      const res = await api.post<T>(endpoint, body);
      return (res as ApiResponse<T>).data;
    },

    async delete(endpoint: string): Promise<void> {
      await api.delete(endpoint);
    },
  };
}

export default api;
