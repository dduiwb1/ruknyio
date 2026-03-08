/**
 * URL Detection Utility
 * للكشف التلقائي عن المنصات من الروابط
 */

export interface PlatformInfo {
  key: string;
  name: string;
  nameAr: string;
  category: 'social' | 'messaging' | 'business' | 'media' | 'other';
  color: string;
  icon?: string;
  urlPatterns: RegExp[];
  usernamePattern?: RegExp;
  baseUrl?: string;
}

export const KNOWN_PLATFORMS: PlatformInfo[] = [
  // Social Media
  {
    key: 'instagram',
    name: 'Instagram',
    nameAr: 'انستغرام',
    category: 'social',
    color: '#E4405F',
    urlPatterns: [/instagram\.com/i, /instagr\.am/i],
    usernamePattern: /(?:instagram\.com|instagr\.am)\/([a-zA-Z0-9_.]+)/i,
    baseUrl: 'https://instagram.com/',
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    nameAr: 'تيك توك',
    category: 'social',
    color: '#000000',
    urlPatterns: [/tiktok\.com/i],
    usernamePattern: /tiktok\.com\/@?([a-zA-Z0-9_.]+)/i,
    baseUrl: 'https://tiktok.com/@',
  },
  {
    key: 'twitter',
    name: 'X (Twitter)',
    nameAr: 'إكس (تويتر)',
    category: 'social',
    color: '#000000',
    urlPatterns: [/twitter\.com/i, /x\.com/i],
    usernamePattern: /(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://x.com/',
  },
  {
    key: 'facebook',
    name: 'Facebook',
    nameAr: 'فيسبوك',
    category: 'social',
    color: '#1877F2',
    urlPatterns: [/facebook\.com/i, /fb\.com/i, /fb\.me/i],
    usernamePattern: /(?:facebook\.com|fb\.com)\/([a-zA-Z0-9.]+)/i,
    baseUrl: 'https://facebook.com/',
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    nameAr: 'لينكد إن',
    category: 'business',
    color: '#0A66C2',
    urlPatterns: [/linkedin\.com/i],
    usernamePattern: /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i,
    baseUrl: 'https://linkedin.com/in/',
  },
  {
    key: 'youtube',
    name: 'YouTube',
    nameAr: 'يوتيوب',
    category: 'media',
    color: '#FF0000',
    urlPatterns: [/youtube\.com/i, /youtu\.be/i],
    usernamePattern: /youtube\.com\/(?:@|channel\/|c\/)?([a-zA-Z0-9_-]+)/i,
    baseUrl: 'https://youtube.com/@',
  },
  {
    key: 'snapchat',
    name: 'Snapchat',
    nameAr: 'سناب شات',
    category: 'social',
    color: '#FFFC00',
    urlPatterns: [/snapchat\.com/i],
    usernamePattern: /snapchat\.com\/add\/([a-zA-Z0-9_.]+)/i,
    baseUrl: 'https://snapchat.com/add/',
  },
  // Messaging
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    nameAr: 'واتساب',
    category: 'messaging',
    color: '#25D366',
    urlPatterns: [/wa\.me/i, /whatsapp\.com/i, /api\.whatsapp\.com/i],
    usernamePattern: /wa\.me\/(\d+)/i,
    baseUrl: 'https://wa.me/',
  },
  {
    key: 'telegram',
    name: 'Telegram',
    nameAr: 'تيليجرام',
    category: 'messaging',
    color: '#0088cc',
    urlPatterns: [/t\.me/i, /telegram\.me/i, /telegram\.org/i],
    usernamePattern: /(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://t.me/',
  },
  // Media & Content
  {
    key: 'spotify',
    name: 'Spotify',
    nameAr: 'سبوتيفاي',
    category: 'media',
    color: '#1DB954',
    urlPatterns: [/spotify\.com/i, /open\.spotify\.com/i],
    baseUrl: 'https://open.spotify.com/',
  },
  {
    key: 'soundcloud',
    name: 'SoundCloud',
    nameAr: 'ساوند كلاود',
    category: 'media',
    color: '#FF5500',
    urlPatterns: [/soundcloud\.com/i],
    usernamePattern: /soundcloud\.com\/([a-zA-Z0-9-]+)/i,
    baseUrl: 'https://soundcloud.com/',
  },
  {
    key: 'behance',
    name: 'Behance',
    nameAr: 'بيهانس',
    category: 'business',
    color: '#1769FF',
    urlPatterns: [/behance\.net/i],
    usernamePattern: /behance\.net\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://behance.net/',
  },
  {
    key: 'dribbble',
    name: 'Dribbble',
    nameAr: 'دريبل',
    category: 'business',
    color: '#EA4C89',
    urlPatterns: [/dribbble\.com/i],
    usernamePattern: /dribbble\.com\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://dribbble.com/',
  },
  {
    key: 'github',
    name: 'GitHub',
    nameAr: 'جيت هب',
    category: 'business',
    color: '#181717',
    urlPatterns: [/github\.com/i],
    usernamePattern: /github\.com\/([a-zA-Z0-9-]+)/i,
    baseUrl: 'https://github.com/',
  },
  // Pinterest
  {
    key: 'pinterest',
    name: 'Pinterest',
    nameAr: 'بنترست',
    category: 'social',
    color: '#E60023',
    urlPatterns: [/pinterest\.com/i, /pin\.it/i],
    usernamePattern: /pinterest\.com\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://pinterest.com/',
  },
  // Reddit
  {
    key: 'reddit',
    name: 'Reddit',
    nameAr: 'ريديت',
    category: 'social',
    color: '#FF4500',
    urlPatterns: [/reddit\.com/i],
    usernamePattern: /reddit\.com\/(?:user|u)\/([a-zA-Z0-9_-]+)/i,
    baseUrl: 'https://reddit.com/user/',
  },
  // Twitch
  {
    key: 'twitch',
    name: 'Twitch',
    nameAr: 'تويتش',
    category: 'media',
    color: '#9146FF',
    urlPatterns: [/twitch\.tv/i],
    usernamePattern: /twitch\.tv\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://twitch.tv/',
  },
  // Discord
  {
    key: 'discord',
    name: 'Discord',
    nameAr: 'ديسكورد',
    category: 'messaging',
    color: '#5865F2',
    urlPatterns: [/discord\.gg/i, /discord\.com/i, /discordapp\.com/i],
    baseUrl: 'https://discord.gg/',
  },
  // Medium
  {
    key: 'medium',
    name: 'Medium',
    nameAr: 'ميديوم',
    category: 'media',
    color: '#000000',
    urlPatterns: [/medium\.com/i],
    usernamePattern: /medium\.com\/@?([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://medium.com/@',
  },
  // Apple Music
  {
    key: 'applemusic',
    name: 'Apple Music',
    nameAr: 'أبل ميوزك',
    category: 'media',
    color: '#FA243C',
    urlPatterns: [/music\.apple\.com/i],
    baseUrl: 'https://music.apple.com/',
  },
  // Threads
  {
    key: 'threads',
    name: 'Threads',
    nameAr: 'ثريدز',
    category: 'social',
    color: '#000000',
    urlPatterns: [/threads\.net/i],
    usernamePattern: /threads\.net\/@?([a-zA-Z0-9_.]+)/i,
    baseUrl: 'https://threads.net/@',
  },
  // PayPal
  {
    key: 'paypal',
    name: 'PayPal',
    nameAr: 'باي بال',
    category: 'business',
    color: '#003087',
    urlPatterns: [/paypal\.com/i, /paypal\.me/i],
    usernamePattern: /paypal\.me\/([a-zA-Z0-9]+)/i,
    baseUrl: 'https://paypal.me/',
  },
  // Patreon
  {
    key: 'patreon',
    name: 'Patreon',
    nameAr: 'باتريون',
    category: 'business',
    color: '#FF424D',
    urlPatterns: [/patreon\.com/i],
    usernamePattern: /patreon\.com\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://patreon.com/',
  },
  // Ko-fi
  {
    key: 'kofi',
    name: 'Ko-fi',
    nameAr: 'كو-فاي',
    category: 'business',
    color: '#FF5E5B',
    urlPatterns: [/ko-fi\.com/i],
    usernamePattern: /ko-fi\.com\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://ko-fi.com/',
  },
  // Etsy
  {
    key: 'etsy',
    name: 'Etsy',
    nameAr: 'إيتسي',
    category: 'business',
    color: '#F56400',
    urlPatterns: [/etsy\.com/i],
    usernamePattern: /etsy\.com\/shop\/([a-zA-Z0-9]+)/i,
    baseUrl: 'https://etsy.com/shop/',
  },
  // Amazon
  {
    key: 'amazon',
    name: 'Amazon',
    nameAr: 'أمازون',
    category: 'business',
    color: '#FF9900',
    urlPatterns: [/amazon\./i, /amzn\./i],
    baseUrl: 'https://amazon.com/',
  },
  // Notion
  {
    key: 'notion',
    name: 'Notion',
    nameAr: 'نوشن',
    category: 'business',
    color: '#000000',
    urlPatterns: [/notion\.so/i, /notion\.site/i],
    baseUrl: 'https://notion.so/',
  },
  // Calendly
  {
    key: 'calendly',
    name: 'Calendly',
    nameAr: 'كالندلي',
    category: 'business',
    color: '#006BFF',
    urlPatterns: [/calendly\.com/i],
    usernamePattern: /calendly\.com\/([a-zA-Z0-9_-]+)/i,
    baseUrl: 'https://calendly.com/',
  },
  // Gumroad
  {
    key: 'gumroad',
    name: 'Gumroad',
    nameAr: 'جمرود',
    category: 'business',
    color: '#FF90E8',
    urlPatterns: [/gumroad\.com/i],
    usernamePattern: /gumroad\.com\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://gumroad.com/',
  },
  // Vimeo
  {
    key: 'vimeo',
    name: 'Vimeo',
    nameAr: 'فيميو',
    category: 'media',
    color: '#1AB7EA',
    urlPatterns: [/vimeo\.com/i],
    usernamePattern: /vimeo\.com\/([a-zA-Z0-9]+)/i,
    baseUrl: 'https://vimeo.com/',
  },
  // Flickr
  {
    key: 'flickr',
    name: 'Flickr',
    nameAr: 'فليكر',
    category: 'media',
    color: '#0063DC',
    urlPatterns: [/flickr\.com/i],
    usernamePattern: /flickr\.com\/photos\/([a-zA-Z0-9@]+)/i,
    baseUrl: 'https://flickr.com/photos/',
  },
  // Tumblr
  {
    key: 'tumblr',
    name: 'Tumblr',
    nameAr: 'تمبلر',
    category: 'social',
    color: '#36465D',
    urlPatterns: [/tumblr\.com/i],
    usernamePattern: /([a-zA-Z0-9-]+)\.tumblr\.com/i,
    baseUrl: 'https://tumblr.com/',
  },
  // Substack
  {
    key: 'substack',
    name: 'Substack',
    nameAr: 'سبستاك',
    category: 'media',
    color: '#FF6719',
    urlPatterns: [/substack\.com/i],
    usernamePattern: /([a-zA-Z0-9-]+)\.substack\.com/i,
    baseUrl: 'https://substack.com/@',
  },
  // Product Hunt
  {
    key: 'producthunt',
    name: 'Product Hunt',
    nameAr: 'برودكت هانت',
    category: 'business',
    color: '#DA552F',
    urlPatterns: [/producthunt\.com/i],
    usernamePattern: /producthunt\.com\/@([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://producthunt.com/@',
  },
  // Stack Overflow
  {
    key: 'stackoverflow',
    name: 'Stack Overflow',
    nameAr: 'ستاك أوفرفلو',
    category: 'business',
    color: '#F48024',
    urlPatterns: [/stackoverflow\.com/i],
    usernamePattern: /stackoverflow\.com\/users\/(\d+)/i,
    baseUrl: 'https://stackoverflow.com/users/',
  },
  // Linktree (for migration)
  {
    key: 'linktree',
    name: 'Linktree',
    nameAr: 'لينكتري',
    category: 'other',
    color: '#43E55E',
    urlPatterns: [/linktr\.ee/i],
    usernamePattern: /linktr\.ee\/([a-zA-Z0-9_]+)/i,
    baseUrl: 'https://linktr.ee/',
  },
  // Figma
  {
    key: 'figma',
    name: 'Figma',
    nameAr: 'فيجما',
    category: 'business',
    color: '#F24E1E',
    urlPatterns: [/figma\.com/i],
    baseUrl: 'https://figma.com/',
  },
  // Canva
  {
    key: 'canva',
    name: 'Canva',
    nameAr: 'كانفا',
    category: 'business',
    color: '#00C4CC',
    urlPatterns: [/canva\.com/i],
    baseUrl: 'https://canva.com/',
  },
  // Trello
  {
    key: 'trello',
    name: 'Trello',
    nameAr: 'تريلو',
    category: 'business',
    color: '#0052CC',
    urlPatterns: [/trello\.com/i],
    baseUrl: 'https://trello.com/',
  },
  // Slack
  {
    key: 'slack',
    name: 'Slack',
    nameAr: 'سلاك',
    category: 'messaging',
    color: '#4A154B',
    urlPatterns: [/slack\.com/i],
    baseUrl: 'https://slack.com/',
  },
  // Zoom
  {
    key: 'zoom',
    name: 'Zoom',
    nameAr: 'زووم',
    category: 'messaging',
    color: '#0B5CFF',
    urlPatterns: [/zoom\.us/i],
    baseUrl: 'https://zoom.us/',
  },
  // Clubhouse
  {
    key: 'clubhouse',
    name: 'Clubhouse',
    nameAr: 'كلوب هاوس',
    category: 'social',
    color: '#F2E8C4',
    urlPatterns: [/joinclubhouse\.com/i, /clubhouse\.com/i],
    baseUrl: 'https://joinclubhouse.com/',
  },
  // Signal
  {
    key: 'signal',
    name: 'Signal',
    nameAr: 'سيجنال',
    category: 'messaging',
    color: '#3A76F0',
    urlPatterns: [/signal\.org/i, /signal\.me/i],
    baseUrl: 'https://signal.org/',
  },
  // Salla (سلة)
  {
    key: 'salla',
    name: 'Salla',
    nameAr: 'سلة',
    category: 'business',
    color: '#004956',
    urlPatterns: [/salla\.sa/i, /salla\.com/i],
    baseUrl: 'https://salla.sa/',
  },
  // Zid (زد)
  {
    key: 'zid',
    name: 'Zid',
    nameAr: 'زد',
    category: 'business',
    color: '#5236FF',
    urlPatterns: [/zid\.sa/i, /zid\.store/i],
    baseUrl: 'https://zid.sa/',
  },
  // Maroof (معروف)
  {
    key: 'maroof',
    name: 'Maroof',
    nameAr: 'معروف',
    category: 'business',
    color: '#00A651',
    urlPatterns: [/maroof\.sa/i],
    baseUrl: 'https://maroof.sa/',
  },
  // Google Maps
  {
    key: 'googlemaps',
    name: 'Google Maps',
    nameAr: 'خرائط جوجل',
    category: 'other',
    color: '#4285F4',
    urlPatterns: [/maps\.google/i, /goo\.gl\/maps/i, /google\.com\/maps/i],
    baseUrl: 'https://maps.google.com/',
  },
  // Email
  {
    key: 'email',
    name: 'Email',
    nameAr: 'بريد إلكتروني',
    category: 'other',
    color: '#EA4335',
    urlPatterns: [/^mailto:/i],
    baseUrl: 'mailto:',
  },
  // Phone
  {
    key: 'phone',
    name: 'Phone',
    nameAr: 'هاتف',
    category: 'other',
    color: '#25D366',
    urlPatterns: [/^tel:/i],
    baseUrl: 'tel:',
  },
  // E-commerce
  {
    key: 'shopify',
    name: 'Shopify',
    nameAr: 'شوبيفاي',
    category: 'business',
    color: '#7AB55C',
    urlPatterns: [/shopify\.com/i, /myshopify\.com/i],
    baseUrl: 'https://shopify.com/',
  },
  // Other
  {
    key: 'website',
    name: 'Website',
    nameAr: 'موقع الكتروني',
    category: 'other',
    color: '#4A5568',
    urlPatterns: [/.*/], // Fallback for any URL
  },
];

/**
 * استخراج الدومين من الرابط
 */
export function extractDomain(url: string): string {
  if (!url) return '';
  
  try {
    // Add protocol if missing
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    const urlObj = new URL(normalizedUrl);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    // Fallback: try to extract domain manually
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/?#]+)/i);
    return match ? match[1] : url;
  }
}

/**
 * كشف المنصة من الرابط
 */
export function detectPlatform(url: string): PlatformInfo | null {
  if (!url) return null;
  
  const normalizedUrl = url.toLowerCase().trim();
  
  // Check each platform (except 'website' which is the fallback)
  for (const platform of KNOWN_PLATFORMS) {
    if (platform.key === 'website') continue;
    
    for (const pattern of platform.urlPatterns) {
      if (pattern.test(normalizedUrl)) {
        return platform;
      }
    }
  }
  
  // Return website as fallback if it looks like a URL
  if (normalizedUrl.includes('.') || normalizedUrl.startsWith('http')) {
    return KNOWN_PLATFORMS.find(p => p.key === 'website') || null;
  }
  
  return null;
}

/**
 * استخراج اسم المستخدم من الرابط
 */
export function extractUsername(url: string, platform?: PlatformInfo): string | null {
  if (!url) return null;
  
  const platformToUse = platform || detectPlatform(url);
  if (!platformToUse?.usernamePattern) return null;
  
  const match = url.match(platformToUse.usernamePattern);
  return match ? match[1] : null;
}

/**
 * بناء رابط من اسم المستخدم
 */
export function buildUrl(platform: PlatformInfo, username: string): string {
  if (!platform.baseUrl) return username;
  return `${platform.baseUrl}${username}`;
}

/**
 * الحصول على المنصات حسب الفئة
 */
export function getPlatformsByCategory(): Record<string, PlatformInfo[]> {
  const grouped: Record<string, PlatformInfo[]> = {
    social: [],
    messaging: [],
    business: [],
    media: [],
    other: [],
  };
  
  for (const platform of KNOWN_PLATFORMS) {
    grouped[platform.category].push(platform);
  }
  
  return grouped;
}

/**
 * الحصول على منصة بالمفتاح
 */
export function getPlatformByKey(key: string): PlatformInfo | undefined {
  return KNOWN_PLATFORMS.find(p => p.key === key);
}

/**
 * التحقق من صحة الرابط
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Try adding https://
    try {
      new URL(`https://${url}`);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * تنسيق الرابط (إضافة https إذا لم يكن موجوداً)
 */
export function formatUrl(url: string): string {
  if (!url) return '';
  
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  
  return `https://${trimmed}`;
}

/**
 * تحويل مفتاح المنصة إلى مفتاح SimpleIcons
 */
export function getSimpleIconKey(platformKey: string): string {
  const iconMapping: Record<string, string> = {
    'twitter': 'x',
    'applemusic': 'applemusic',
    'googlemaps': 'googlemaps',
    'producthunt': 'producthunt',
    'stackoverflow': 'stackoverflow',
    'kofi': 'kofi',
    'salla': 'salla',
    'zid': 'zid',
    'clubhouse': 'clubhouse',
  };
  
  return iconMapping[platformKey] || platformKey;
}

/**
 * جلب أيقونة الموقع (Favicon) من عدة مصادر
 * @param url - رابط الموقع أو الدومين
 * @param size - حجم الأيقونة المطلوب (16, 32, 64, 128)
 * @returns رابط الأيقونة
 */
export function getFaviconUrl(url: string, size: number = 64): string {
  const domain = extractDomain(url);
  if (!domain) return '';
  
  // استخدام Google Favicon Service (أسرع وأكثر موثوقية)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

/**
 * جلب أيقونة الموقع من مصادر متعددة (مع fallback)
 * @param url - رابط الموقع
 * @returns قائمة بروابط الأيقونات للاستخدام كـ fallback
 */
export function getFaviconSources(url: string): string[] {
  const domain = extractDomain(url);
  if (!domain) return [];
  
  return [
    // Google Favicon (الأفضل)
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    // DuckDuckGo Icons
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    // Favicon Kit
    `https://api.faviconkit.com/${domain}/64`,
    // مباشرة من الموقع
    `https://${domain}/favicon.ico`,
  ];
}

/**
 * الحصول على أيقونة المنصة (SimpleIcons أو Favicon كـ fallback)
 * @param platformKey - مفتاح المنصة
 * @param url - رابط الموقع (للـ fallback)
 * @returns كائن يحتوي على رابط الأيقونة ونوعها
 */
export function getPlatformIcon(platformKey: string, url?: string): {
  simpleIconUrl: string;
  faviconUrl: string;
  type: 'simpleicon' | 'favicon';
} {
  const iconKey = getSimpleIconKey(platformKey);
  const simpleIconUrl = `https://cdn.simpleicons.org/${iconKey}`;
  const faviconUrl = url ? getFaviconUrl(url) : '';
  
  return {
    simpleIconUrl,
    faviconUrl,
    type: platformKey === 'website' ? 'favicon' : 'simpleicon',
  };
}

export default {
  KNOWN_PLATFORMS,
  detectPlatform,
  extractUsername,
  buildUrl,
  getPlatformsByCategory,
  getPlatformByKey,
  isValidUrl,
  formatUrl,
  getSimpleIconKey,
  getFaviconUrl,
  getFaviconSources,
  getPlatformIcon,
};
