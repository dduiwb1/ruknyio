'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getSimpleIconKey, 
  getFaviconUrl, 
  extractDomain,
  type PlatformInfo 
} from '@/lib/utils/urlDetection';

interface PlatformIconProps {
  platform?: string;
  platformData?: PlatformInfo | null;
  url?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
  showFallback?: boolean;
}

const sizeMap = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-7 h-7',
  lg: 'w-8 h-8',
};

const faviconSizeMap = {
  xs: 32,
  sm: 64,
  md: 64,
  lg: 128,
};

/**
 * مكون ذكي لعرض أيقونة المنصة
 * - يجلب الشعار الحقيقي للموقع من Google Favicon أولاً
 * - إذا لم يتوفر رابط، يستخدم SimpleIcons
 * - إذا فشل الكل، يعرض أيقونة Globe
 */
export function PlatformIcon({ 
  platform,
  platformData,
  url,
  size = 'sm',
  className,
  color,
  showFallback = true,
}: PlatformIconProps) {
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  
  const platformKey = platform || platformData?.key || 'website';
  const platformColor = color || platformData?.color;
  const iconKey = getSimpleIconKey(platformKey);
  const domain = url ? extractDomain(url) : '';
  const colorHex = platformColor ? platformColor.replace('#', '') : undefined;

  // Build ordered source list: Google favicon first (real logo), then fallbacks
  const sources = (() => {
    const list: string[] = [];
    
    // 1. Google Favicon - الشعار الحقيقي للموقع (أولوية قصوى)
    if (domain) {
      list.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=${faviconSizeMap[size]}`);
    }
    
    // 2. DuckDuckGo Icons - مصدر بديل للشعار الحقيقي
    if (domain) {
      list.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    }
    
    // 3. SimpleIcons - أيقونة المنصة المعروفة كـ fallback
    if (platformKey !== 'website') {
      const simpleUrl = colorHex 
        ? `https://cdn.simpleicons.org/${iconKey}/${colorHex}`
        : `https://cdn.simpleicons.org/${iconKey}`;
      list.push(simpleUrl);
    }
    
    return list;
  })();

  // Reset when platform or url changes
  useEffect(() => {
    setSrcIndex(0);
    setFailed(false);
  }, [platformKey, url]);

  const handleError = () => {
    if (srcIndex < sources.length - 1) {
      setSrcIndex(prev => prev + 1);
    } else {
      setFailed(true);
    }
  };

  // Fallback Globe icon
  if (failed || sources.length === 0 || (!showFallback && srcIndex === 0)) {
    return (
      <Globe 
        className={cn(sizeMap[size], className)} 
        style={{ color: platformColor || '#6B7280' }}
      />
    );
  }

  return (
    <img
      src={sources[srcIndex]}
      alt={platformData?.name || platform || 'Platform'}
      className={cn(sizeMap[size], 'object-contain rounded-sm', className)}
      onError={handleError}
      loading="lazy"
    />
  );
}

/**
 * مكون بسيط لعرض Favicon فقط
 */
export function FaviconIcon({ 
  url, 
  size = 'sm',
  className,
}: { 
  url: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [srcIndex, setSrcIndex] = useState(0);
  const domain = extractDomain(url);
  
  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=${faviconSizeMap[size]}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://${domain}/favicon.ico`,
  ];
  
  if (!domain || srcIndex >= sources.length) {
    return <Globe className={cn(sizeMap[size], 'text-muted-foreground', className)} />;
  }
  
  return (
    <img
      src={sources[srcIndex]}
      alt={domain}
      className={cn(sizeMap[size], 'object-contain rounded-sm', className)}
      onError={() => setSrcIndex(prev => prev + 1)}
      loading="lazy"
    />
  );
}

export default PlatformIcon;
