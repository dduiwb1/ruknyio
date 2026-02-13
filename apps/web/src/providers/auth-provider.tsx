'use client';

/**
 * 🔐 Auth Provider - React Context for Authentication
 * 
 * Provides:
 * - User state management
 * - QuickSign (Magic Link) authentication
 * - OAuth authentication
 * - Auto token refresh
 * - Session persistence
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  User,
  AuthResponse,
  logout as apiLogout,
  getCurrentUser,
  refreshToken,
  requestQuickSign,
  verifyQuickSign,
  exchangeOAuthCode,
  completeProfile,
  type CompleteProfileInput,
  type QuickSignResponse,
} from '@/lib/api';
import { clearCsrfToken, setCsrfToken, getCsrfToken, updateLastRefreshTime } from '@/lib/api/client';

// ============ Types ============

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsProfileCompletion: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  // QuickSign methods
  sendMagicLink: (email: string) => Promise<QuickSignResponse>;
  verifyMagicLink: (token: string) => Promise<AuthResponse>;
  
  // OAuth methods
  handleOAuthCallback: (code: string) => Promise<AuthResponse>;
  
  // Profile completion
  completeUserProfile: (input: CompleteProfileInput) => Promise<void>;
  
  // Session management
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

// ============ Context ============

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============ Provider ============

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    needsProfileCompletion: false,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AuthProvider] initAuth started');
      }
      
      // 🔒 Skip init if we're on OAuth callback page (will be handled by callback component)
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.pathname.includes('/auth/callback') && url.searchParams.has('code')) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[AuthProvider] OAuth callback detected, skipping initAuth');
          }
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }
      }
      
      try {
        // 🔒 Check if we have a CSRF token (indicates logged-in state)
        // Access token is in httpOnly cookie (not accessible from JS)
        const csrfToken = getCsrfToken();
        console.log('[AuthProvider] CSRF token:', csrfToken ? 'exists' : 'null');

        if (!csrfToken) {
          // Try to refresh token from cookie
          try {
            console.log('[AuthProvider] No CSRF token, trying to refresh from cookie...');
            await refreshToken();
            console.log('[AuthProvider] Refresh successful');
          } catch (err) {
            // No valid session - clear any stale tokens
            console.log('[AuthProvider] Refresh failed:', err);
            clearCsrfToken();
            setState(prev => ({ ...prev, isLoading: false }));
            return;
          }
        }

        // Get current user
        console.log('[AuthProvider] Getting current user...');
        const user = await getCurrentUser();
        console.log('[AuthProvider] getCurrentUser result:', user);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          needsProfileCompletion: !user.name || !user.username,
          error: null,
        });
        console.log('[AuthProvider] Auth state set to authenticated');
      } catch (err) {
        // Clear CSRF token
        // Don't log error if it's just "Unauthorized" - this is expected when no user is logged in
        if (err instanceof Error && !err.message.includes('Unauthorized')) {
          console.error('[AuthProvider] initAuth error:', err);
        } else {
          console.log('[AuthProvider] No authenticated session found');
        }
        clearCsrfToken();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          needsProfileCompletion: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  // Set up proactive token refresh (every 25 minutes - 5 min before 30m expiry)
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken();
        // 🔒 Update session timeout tracker
        updateLastRefreshTime();
        console.log('[AuthProvider] Proactive token refresh successful');
      } catch {
        // Token refresh failed, log out
        clearCsrfToken();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          needsProfileCompletion: false,
          error: 'Session expired. Please login again.',
        });
      }
    }, 25 * 60 * 1000); // 25 minutes (refresh 5 min before 30m token expiry)

    return () => clearInterval(refreshInterval);
  }, [state.isAuthenticated]);

  // Send magic link (QuickSign)
  const sendMagicLink = useCallback(async (email: string): Promise<QuickSignResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await requestQuickSign(email);
      setState(prev => ({ ...prev, isLoading: false }));
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send magic link';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  // Verify magic link token
  const verifyMagicLink = useCallback(async (token: string): Promise<AuthResponse> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await verifyQuickSign(token);
      
      // 🔒 Store CSRF token and update refresh time
      if (response.csrf_token) {
        setCsrfToken(response.csrf_token);
        updateLastRefreshTime();
      }
      
      if (response.user) {
        setState({
          user: response.user,
          isLoading: false,
          isAuthenticated: true,
          needsProfileCompletion: response.needsProfileCompletion || false,
          error: null,
        });
      } else {
        // 🔒 Access token is in httpOnly cookie, fetch user
        const user = await getCurrentUser();
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          needsProfileCompletion: response.needsProfileCompletion || !user.name || !user.username,
          error: null,
        });
      }
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to verify magic link';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = useCallback(async (code: string): Promise<AuthResponse> => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthProvider] handleOAuthCallback started with code:', code);
    }
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('[AuthProvider] Calling exchangeOAuthCode...');
      const response = await exchangeOAuthCode(code);
      console.log('[AuthProvider] exchangeOAuthCode response received:', {
        success: response.success,
        hasCsrfToken: !!response.csrf_token,
        csrfTokenPreview: response.csrf_token?.substring(0, 20) + '...',
        hasUser: !!response.user,
        userId: response.user?.id,
        needsProfileCompletion: response.needsProfileCompletion,
      });
      
      // 🔒 Store CSRF token and update refresh time
      if (response.csrf_token) {
        console.log('[AuthProvider] ✅ Setting CSRF token from response:', response.csrf_token.substring(0, 20) + '...');
        setCsrfToken(response.csrf_token);
        updateLastRefreshTime();
      } else {
        console.warn('[AuthProvider] ⚠️ No CSRF token in response!');
      }
      
      if (response.user) {
        console.log('[AuthProvider] Setting user from response:', response.user);
        setState({
          user: response.user,
          isLoading: false,
          isAuthenticated: true,
          needsProfileCompletion: response.needsProfileCompletion || false,
          error: null,
        });
      } else {
        // 🔒 Access token is in httpOnly cookie, fetch user
        console.log('[AuthProvider] Fetching user with getCurrentUser...');
        const user = await getCurrentUser();
        console.log('[AuthProvider] getCurrentUser result:', user);
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          needsProfileCompletion: response.needsProfileCompletion || !user.name || !user.username,
          error: null,
        });
      }
      
      console.log('[AuthProvider] ✅ handleOAuthCallback completed successfully');
      return response;
    } catch (err) {
      console.error('[AuthProvider] handleOAuthCallback error:', err);
      const message = err instanceof Error ? err.message : 'OAuth authentication failed';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  // Complete user profile
  const completeUserProfile = useCallback(async (input: CompleteProfileInput) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await completeProfile(input);
      
      // 🔒 Update refresh time on successful profile completion
      updateLastRefreshTime();
      
      if (response.user) {
        setState(prev => ({
          ...prev,
          user: response.user,
          isLoading: false,
          needsProfileCompletion: false,
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete profile';
      setState(prev => ({ ...prev, isLoading: false, error: message }));
      throw err;
    }
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      await apiLogout();
    } catch {
      // Ignore logout API errors - still clear local state
    } finally {
      // 🔒 Clear CSRF token
      clearCsrfToken();
      
      // Clear local state
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        needsProfileCompletion: false,
        error: null,
      });
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return;

    try {
      const user = await getCurrentUser();
      setState(prev => ({ 
        ...prev, 
        user,
        needsProfileCompletion: !user.name || !user.username,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh user';
      setState(prev => ({ ...prev, error: message }));
    }
  }, [state.isAuthenticated]);

  // Set user directly (for external auth flows)
  const setUser = useCallback((user: User) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
      needsProfileCompletion: !user.name || !user.username,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Memoize context value
  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      sendMagicLink,
      verifyMagicLink,
      handleOAuthCallback,
      completeUserProfile,
      logout,
      refreshUser,
      setUser,
      clearError,
    }),
    [state, sendMagicLink, verifyMagicLink, handleOAuthCallback, completeUserProfile, logout, refreshUser, setUser, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============ Hook ============

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============ Utility Hooks ============

/**
 * Hook that returns only the user object
 */
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}

/**
 * Hook that returns authentication status
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}
