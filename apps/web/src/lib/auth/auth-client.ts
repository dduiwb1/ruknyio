/**
 * Client-side auth helpers.
 */
export class AuthClient {
  static async getSession() {
    try {
      const res = await fetch('/api/v1/auth/me', { credentials: 'include' });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}
