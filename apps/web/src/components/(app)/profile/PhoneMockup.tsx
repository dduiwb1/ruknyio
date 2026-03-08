'use client';

import { PhonePreview } from '@/components/(app)/shared';

/**
 * PhoneMockup - Profile phone preview wrapper
 * Wraps PhonePreview to provide a consistent API for profile pages.
 * Props are accepted for future customization but currently the preview
 * fetches its own data from the authenticated user's profile.
 */

interface PhoneMockupProfile {
  username?: string;
  displayName?: string;
  name?: string;
  bio?: string;
  avatar?: string;
  isVerified?: boolean;
  socialLinks?: unknown[];
}

interface PhoneMockupProps {
  profile?: PhoneMockupProfile | Record<string, unknown>;
  customLinks?: unknown[];
  className?: string;
}

export function PhoneMockup({ className }: PhoneMockupProps) {
  return <PhonePreview className={className} />;
}

export default PhoneMockup;
