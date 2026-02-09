/**
 * Generate a unique form slug for URL-safe identification.
 * Uses cryptographically random values when available.
 * Format: 10 character alphanumeric lowercase string.
 */
export function generateFormSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 10;

  // Use crypto.getRandomValues for better randomness when available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => chars[byte % chars.length]).join('');
  }

  // Fallback to Math.random
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate that a slug follows the expected format.
 * Must be 3-30 characters, alphanumeric lowercase + hyphens.
 */
export function isValidFormSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,30}$/.test(slug);
}
