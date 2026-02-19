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
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const faviconSizeMap = {
  xs: 16,
  sm: 32,
  md: 48,
  lg: 64,
};

/**
 * مكون ذكي لعرض أيقونة المنصة
 * - يحاول تحميل أيقونة SimpleIcons أولاً
 * - إذا فشل، يحاول تحميل Favicon من الموقع
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
  const [iconState, setIconState] = useState<'loading' | 'simple' | 'favicon' | 'fallback'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string>('');
  
  const platformKey = platform || platformData?.key || 'website';
  const platformColor = color || platformData?.color;
  const iconKey = getSimpleIconKey(platformKey);
  
  useEffect(() => {
    // Reset state when platform or url changes
    setIconState('loading');
    
    // For website type, go directly to favicon
    if (platformKey === 'website' && url) {
      const faviconUrl = getFaviconUrl(url, faviconSizeMap[size]);
      setCurrentSrc(faviconUrl);
      setIconState('favicon');
      return;
    }
    
    // Try SimpleIcons first
    const simpleIconUrl = `https://cdn.simpleicons.org/${iconKey}`;
    setCurrentSrc(simpleIconUrl);
    setIconState('simple');
  }, [platformKey, url, iconKey, size]);

  const handleImageError = () => {
    if (iconState === 'simple' && url) {
      // Try favicon
      const faviconUrl = getFaviconUrl(url, faviconSizeMap[size]);
      setCurrentSrc(faviconUrl);
      setIconState('favicon');
    } else {
      // Show fallback
      setIconState('fallback');
    }
  };

  const handleImageLoad = () => {
    // Image loaded successfully
  };

  // Fallback icon - show if state is fallback, or src is empty/invalid
  if (iconState === 'fallback' || !currentSrc || (!showFallback && iconState === 'loading')) {
    return (
      <Globe 
        className={cn(sizeMap[size], className)} 
        style={{ color: platformColor || '#6B7280' }}
      />
    );
  }

  return (
    <img
      src={currentSrc}
      alt={platformData?.name || platform || 'Platform'}
      className={cn(sizeMap[size], 'object-contain', className)}
      style={platformColor && iconState === 'simple' ? { filter: 'brightness(0)' } : undefined}
      onError={handleImageError}
      onLoad={handleImageLoad}
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
  const [hasError, setHasError] = useState(false);
  const domain = extractDomain(url);
  
  if (!domain || hasError) {
    return <Globe className={cn(sizeMap[size], 'text-gray-400', className)} />;
  }
  
  const faviconUrl = getFaviconUrl(url, faviconSizeMap[size]);
  
  return (
    <img
      src={faviconUrl}
      alt={domain}
      className={cn(sizeMap[size], 'object-contain rounded-sm', className)}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

export default PlatformIcon;
