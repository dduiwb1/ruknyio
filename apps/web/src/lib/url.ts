/**
 * Get the auth URL for login/register redirects.
 */
export function getAuthUrl(path: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}${path}`;
}
