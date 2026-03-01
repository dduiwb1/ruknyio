'use server';

import { redirect } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { LoginSchema, type LoginFormState, type AuthUser } from '@/lib/definitions';

// ─── QuickSign: Request Magic Link ───────────────────────────

export async function requestQuickSign(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  // Validate
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      message: 'يرجى تصحيح الأخطاء أدناه',
    };
  }

  const { data, error, status } = await apiClient<{ message: string }>(
    '/auth/quicksign/request',
    {
      method: 'POST',
      body: JSON.stringify({
        email: parsed.data.email,
      }),
    },
  );

  if (error) {
    return {
      message: error,
    };
  }

  return {
    success: true,
    message: data?.message || 'تم إرسال رابط الدخول إلى بريدك الإلكتروني',
  };
}

// ─── OAuth: Exchange authorization code for session ──────────

export async function exchangeOAuthCode(code: string): Promise<{
  success: boolean;
  error?: string;
  user?: AuthUser;
  needsProfileCompletion?: boolean;
}> {
  const { data, error } = await apiClient<{
    user: AuthUser;
    needsProfileCompletion?: boolean;
  }>('/auth/oauth/exchange', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });

  if (error) {
    return { success: false, error };
  }

  return {
    success: true,
    user: data?.user,
    needsProfileCompletion: data?.needsProfileCompletion,
  };
}

// ─── QuickSign: Verify Token & Exchange ──────────────────────

export async function verifyQuickSignToken(token: string): Promise<{
  success: boolean;
  error?: string;
  redirectTo?: string;
}> {
  // The backend endpoint redirects, so we call it and check
  const { data, error, status } = await apiClient<{
    redirectUrl?: string;
    quickSignToken?: string;
    type?: string;
  }>(`/auth/quicksign/verify/${token}`, {
    method: 'GET',
  });

  if (error) {
    return { success: false, error };
  }

  // If redirect response
  if (data && 'redirectUrl' in data && data.redirectUrl) {
    return { success: true, redirectTo: data.redirectUrl };
  }

  return { success: true };
}

// ─── Resend QuickSign ────────────────────────────────────────

export async function resendQuickSign(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const { data, error } = await apiClient<{ message: string }>(
    '/auth/quicksign/resend',
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  );

  if (error) {
    return { success: false, error };
  }

  return {
    success: true,
    message: data?.message || 'تم إعادة إرسال الرابط',
  };
}

// ─── Logout ──────────────────────────────────────────────────

export async function logout() {
  await apiClient('/auth/logout', {
    method: 'POST',
  });

  redirect('/login');
}

// ─── Get Google OAuth URL ────────────────────────────────────

export async function getGoogleOAuthUrl(): Promise<string> {
  const apiUrl = process.env.API_URL || 'http://localhost:3001';
  return `${apiUrl}/api/v1/auth/google`;
}

// ─── Get LinkedIn OAuth URL ──────────────────────────────────

export async function getLinkedInOAuthUrl(): Promise<string> {
  const apiUrl = process.env.API_URL || 'http://localhost:3001';
  return `${apiUrl}/api/v1/auth/linkedin`;
}
