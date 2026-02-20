'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Link2, 
  ExternalLink,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Globe,
  Mail,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { detectPlatformFromUrl, getGoogleFavicon } from '@/lib/utils/socialLinkMetadata';

interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  title?: string;
  displayOrder?: number;
  [key: string]: any;
}

interface PublicSocialLinksProps {
  socialLinks: SocialLinkItem[];
  isLoading?: boolean;
}

const socialColors: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  x: '#000000',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  github: '#181717',
  whatsapp: '#25D366',
  tiktok: '#000000',
  website: '#6366F1',
  email: '#0EA5E9',
  phone: '#10B981',
  custom: '#8B5CF6',
};

const socialIcons: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  whatsapp: MessageCircle,
  tiktok: Link2,
  website: Globe,
  email: Mail,
  phone: Phone,
  custom: Link2,
};

function SocialLinkItem({ link, index }: { link: SocialLinkItem; index: number }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const platform = link.platform?.toLowerCase() || 'custom';
  const Icon = socialIcons[platform] || Link2;
  const bgColor = socialColors[platform] || '#6366F1';
  const faviconUrl = getGoogleFavicon(link.url, 64);
  
  // استخراج اسم الموقع من الرابط
  const getLinkTitle = () => {
    if (link.title) return link.title;
    
    try {
      const url = new URL(link.url);
      return url.hostname.replace(/^www\./, '') || 'رابط';
    } catch {
      return link.platform || 'رابط';
    }
  };

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon Container - متناسق وموحد */}
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden group/icon"
          style={{ backgroundColor: bgColor }}
        >
          {/* Favicon من Google - يظهر فقط عند نجاح التحميل */}
          {!imageError && (
            <img
              src={faviconUrl}
              alt={platform}
              className={cn(
                "w-full h-full object-cover absolute inset-0 group-hover/icon:scale-110 transition-all duration-300",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageLoaded(false);
                setImageError(true);
              }}
            />
          )}
          
          {/* الأيقونة الافتراضية - تظهر فقط إذا: لم تحمل الصورة أو حدث خطأ */}
          {!imageLoaded && (
            <Icon 
              className="w-6 h-6 text-white drop-shadow-sm relative z-10 group-hover/icon:scale-110 transition-transform duration-300" 
              strokeWidth={2.5}
            />
          )}
        </div>
        
        {/* النص والمعلومات */}
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-foreground block truncate group-hover:text-primary transition-colors duration-200">
            {getLinkTitle()}
          </span>
          <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
            {link.url.replace(/^https?:\/\/(www\.)?/, '')}
          </span>
        </div>
      </div>
      
      {/* السهم - يظهر عند hover */}
      <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0" />
    </motion.a>
  );
}

export function PublicSocialLinks({ socialLinks, isLoading }: PublicSocialLinksProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!socialLinks || socialLinks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Link2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">لا توجد روابط</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {socialLinks.map((link, index) => (
        <SocialLinkItem key={link.id} link={link} index={index} />
      ))}
    </div>
  );
}
