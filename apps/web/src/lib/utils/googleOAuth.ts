/**
 * Google OAuth Integration Utilities
 * Handles Google authentication and social link detection
 */

interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

interface DetectedSocialLink {
  platform: string;
  url: string;
  title: string;
  color: string;
}

/**
 * Get Google OAuth URL for authorization
 */
export function getGoogleOAuthUrl(redirectPath: string = '/api/auth/google/callback'): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Google Client ID is not configured');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'profile email',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Detect social links from Google profile
 */
export async function detectSocialLinksFromGoogle(
  googleProfile: GoogleProfile
): Promise<DetectedSocialLink[]> {
  const detectedLinks: DetectedSocialLink[] = [];

  // Try to detect common social media patterns from email or name
  const emailDomain = googleProfile.email.split('@')[1];

  // Since we don't have actual social profile data from Google,
  // we can suggest based on common patterns or integration status
  const commonPlatforms = [
    {
      name: 'twitter',
      nameAr: 'تويتر',
      icon: 'twitter',
      pattern: /twitter|x\.com/i,
      baseUrl: 'https://twitter.com/',
    },
    {
      name: 'linkedin',
      nameAr: 'لينكدإن',
      icon: 'linkedin',
      pattern: /linkedin/i,
      baseUrl: 'https://linkedin.com/in/',
    },
    {
      name: 'github',
      nameAr: 'جيثاب',
      icon: 'github',
      pattern: /github/i,
      baseUrl: 'https://github.com/',
    },
    {
      name: 'instagram',
      nameAr: 'إنستجرام',
      icon: 'instagram',
      pattern: /instagram|insta/i,
      baseUrl: 'https://instagram.com/',
    },
  ];

  // Check if profile name contains any social media handles
  const nameAsHandle = googleProfile.name
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\w]/g, '');

  for (const platform of commonPlatforms) {
    if (platform.pattern.test(googleProfile.name)) {
      detectedLinks.push({
        platform: platform.name,
        url: `${platform.baseUrl}${nameAsHandle}`,
        title: platform.nameAr,
        color: getColorForPlatform(platform.name),
      });
    }
  }

  return detectedLinks;
}

/**
 * Get platform color
 */
export function getColorForPlatform(platform: string): string {
  const colors: Record<string, string> = {
    twitter: '#1DA1F2',
    linkedin: '#0077B5',
    github: '#333333',
    instagram: '#E4405F',
    facebook: '#1877F2',
    youtube: '#FF0000',
    tiktok: '#000000',
    whatsapp: '#25D366',
    telegram: '#0088cc',
  };

  return colors[platform.toLowerCase()] || '#6B7280';
}

/**
 * Validate Google OAuth response
 */
export function validateGoogleOAuthResponse(
  response: any
): response is { code: string; state?: string } {
  return response && typeof response.code === 'string';
}

/**
 * Create social link from detection result
 */
export function createSocialLinkFromDetection(
  link: DetectedSocialLink
) {
  return {
    url: link.url,
    title: link.title,
    platform: link.platform,
    source: 'google-oauth' as const,
    status: 'pending' as const,
  };
}
