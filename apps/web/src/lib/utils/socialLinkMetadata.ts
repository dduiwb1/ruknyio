/**
 * Social Link Detection & Metadata Utilities
 * جلب الشعارات والعناوين والأوصاف من المنصات الاجتماعية
 */

import { Instagram, Twitter, Linkedin, Youtube, Github, Globe, Mail, Phone, MessageCircle, Link2 } from 'lucide-react';

export interface PlatformInfo {
  name: string;
  nameAr: string;
  color: string;
  icon: any;
  pattern: RegExp;
}

// المنصات المعروفة مع معلوماتها
export const KNOWN_PLATFORMS: Record<string, PlatformInfo> = {
  instagram: {
    name: 'instagram',
    nameAr: 'إنستجرام',
    color: '#E4405F',
    icon: Instagram,
    pattern: /instagram\.com|insta\.com/i,
  },
  twitter: {
    name: 'twitter',
    nameAr: 'تويتر',
    color: '#1DA1F2',
    icon: Twitter,
    pattern: /twitter\.com|x\.com/i,
  },
  linkedin: {
    name: 'linkedin',
    nameAr: 'لينكدإن',
    color: '#0A66C2',
    icon: Linkedin,
    pattern: /linkedin\.com/i,
  },
  youtube: {
    name: 'youtube',
    nameAr: 'يوتيوب',
    color: '#FF0000',
    icon: Youtube,
    pattern: /youtube\.com|youtu\.be/i,
  },
  github: {
    name: 'github',
    nameAr: 'جيثاب',
    color: '#181717',
    icon: Github,
    pattern: /github\.com/i,
  },
  whatsapp: {
    name: 'whatsapp',
    nameAr: 'واتساب',
    color: '#25D366',
    icon: MessageCircle,
    pattern: /whatsapp\.com|wa\.me/i,
  },
  tiktok: {
    name: 'tiktok',
    nameAr: 'تيك توك',
    color: '#000000',
    icon: Link2,
    pattern: /tiktok\.com/i,
  },
  website: {
    name: 'website',
    nameAr: 'موقع ويب',
    color: '#6366F1',
    icon: Globe,
    pattern: /^https?:\/\/(?!.*(?:instagram|twitter|linkedin|youtube|github|whatsapp|tiktok))/i,
  },
  email: {
    name: 'email',
    nameAr: 'بريد إلكتروني',
    color: '#0EA5E9',
    icon: Mail,
    pattern: /^mailto:/i,
  },
  phone: {
    name: 'phone',
    nameAr: 'هاتف',
    color: '#10B981',
    icon: Phone,
    pattern: /^tel:/i,
  },
};

/**
 * كشف المنصة من الرابط
 */
export function detectPlatformFromUrl(url: string): PlatformInfo | null {
  for (const platform of Object.values(KNOWN_PLATFORMS)) {
    if (platform.pattern.test(url)) {
      return platform;
    }
  }
  return null;
}

/**
 * جلب Favicon من Google (لأي دومين)
 * @param url الرابط الكامل أو الدومين
 * @param size حجم الصورة (32, 64, 128)
 * @returns رابط الـ favicon
 */
export function getGoogleFavicon(url: string, size: number = 64): string {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname || url;
    return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(domain)}`;
  } catch {
    // إذا كان URL غير صحيح، حاول كونه دومين مباشر
    return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(url)}`;
  }
}

/**
 * استخراج العنوان من URL (اسم الموقع)
 */
export function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname || '';
    
    // إزالة www. إن وجدت
    return hostname.replace(/^www\./, '');
  } catch {
    return 'رابط';
  }
}

/**
 * استخراج الدومين الرئيسي
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname || url;
  } catch {
    return url;
  }
}

/**
 * بناء معلومات المنصة الكاملة
 */
export interface SocialLinkMetadata {
  platform: string;
  platformAr: string;
  color: string;
  icon: any;
  favicon: string; // رابط الـ favicon
  title: string; // اسم الموقع أو الحساب
  domain: string; // الدومين الرئيسي
}

export function buildSocialLinkMetadata(url: string, customTitle?: string): SocialLinkMetadata {
  const platformInfo = detectPlatformFromUrl(url);
  const domain = extractDomain(url);
  const defaultTitle = customTitle || extractTitleFromUrl(url);

  return {
    platform: platformInfo?.name || 'website',
    platformAr: platformInfo?.nameAr || 'رابط',
    color: platformInfo?.color || '#6366F1',
    icon: platformInfo?.icon || Globe,
    favicon: getGoogleFavicon(url),
    title: defaultTitle,
    domain: domain,
  };
}

/**
 * خيارات متقدمة: جلب أوصاف من Google Custom Search (اختياري)
 * تُستخدم للحصول على معلومات أكثر دقة عن الرابط
 * 
 * ملاحظة: يتطلب API Key والإعداد في Backend
 */
export interface GoogleCustomSearchConfig {
  apiKey: string;
  searchEngineId: string;
}

export async function fetchMetadataFromGoogle(
  url: string,
  config: GoogleCustomSearchConfig
): Promise<{ title: string; description: string } | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(url)}&key=${config.apiKey}&cx=${config.searchEngineId}`
    );

    if (!response.ok) return null;

    const data = await response.json();
    const firstResult = data.items?.[0];

    if (!firstResult) return null;

    return {
      title: firstResult.title || '',
      description: firstResult.snippet || '',
    };
  } catch (error) {
    console.error('Error fetching from Google Custom Search:', error);
    return null;
  }
}

/**
 * محاولة جلب metadata من Open Graph tags (على الـ Backend)
 * هذا يتطلب Server-side rendering أو API endpoint
 */
export interface OpenGraphMetadata {
  title?: string;
  description?: string;
  image?: string;
}

export async function fetchOpenGraphMetadata(
  url: string
): Promise<OpenGraphMetadata | null> {
  try {
    // هذا يجب أن يتم على الـ Backend لتجنب CORS issues
    const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}
