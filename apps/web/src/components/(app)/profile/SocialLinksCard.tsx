'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, 
  ExternalLink, 
  ChevronLeft,
  Plus,
  Sparkles,
  MousePointerClick,
  TrendingUp,
  Zap,
  Star,
  Globe,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlatformIcon, FaviconIcon } from '@/components/ui/platform-icon';
import { detectPlatform } from '@/lib/utils/urlDetection';
import type { SocialLink, LinkGroup } from '@/lib/types/profile';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GoogleSocialConnect } from './GoogleSocialConnect';

interface SocialLinksCardProps {
  socialLinks: SocialLink[];
  linkGroups: LinkGroup[];
  isLoading: boolean;
}

export function SocialLinksCard({ socialLinks, linkGroups, isLoading }: SocialLinksCardProps) {
  if (isLoading) {
    return <SocialLinksSkeleton />;
  }

  const displayLinks = socialLinks.slice(0, 5);
  const activeLinks = socialLinks.filter(l => l.status === 'active').length;
  const totalClicks = socialLinks.reduce((sum, l) => sum + (l.totalClicks || 0), 0);
  const pinnedCount = socialLinks.filter(l => l.isPinned).length;

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-foreground text-xs sm:text-sm truncate">روابطي</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {activeLinks > 0 ? (
                  <><span className="text-primary font-medium">{activeLinks}</span> رابط نشط</>
                ) : (
                  'لا توجد روابط نشطة'
                )}
              </p>
            </div>
          </div>
          
          <Link 
            href="/app/profile/links"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-card hover:bg-primary text-muted-foreground hover:text-primary-foreground text-[11px] sm:text-xs font-medium transition-all border border-border hover:border-primary flex-shrink-0"
          >
            <span>إدارة</span>
            <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Bar - Only if links exist */}
      {socialLinks.length > 0 && (
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-muted/20 border-b border-border/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
              {/* Total Clicks */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MousePointerClick className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-foreground">{totalClicks.toLocaleString()}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground -mt-0.5">نقرة</p>
                </div>
              </div>
              
              {/* Groups */}
              {linkGroups.length > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-foreground">{linkGroups.length}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground -mt-0.5">مجموعة</p>
                  </div>
                </div>
              )}

              {/* Pinned */}
              {pinnedCount > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-warning-filled" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-foreground">{pinnedCount}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground -mt-0.5">مثبت</p>
                  </div>
                </div>
              )}
            </div>

            {/* Add Link Button */}
            <Link href="/app/profile/links" className="flex-shrink-0">
              <Button 
                size="sm" 
                className="h-6 sm:h-7 px-2 sm:px-2.5 gap-0.5 sm:gap-1 text-[11px] sm:text-xs rounded-lg"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">إضافة</span>
                <span className="sm:hidden">+</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-2.5 sm:p-3.5">
        {socialLinks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1 sm:space-y-1.5">
            {displayLinks.map((link) => (
              <LinkItem key={link.id} link={link} />
            ))}
            
            {socialLinks.length > 5 && (
              <Link href="/app/profile/links" className="block mt-2 sm:mt-2.5">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground border border-border">
                  <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-xs font-medium">عرض جميع الروابط ({socialLinks.length})</span>
                  <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LinkItem({ link }: { link: SocialLink }) {
  const platform = detectPlatform(link.url);
  const isActive = link.status === 'active';

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-lg transition-all",
        "border",
        isActive 
          ? "hover:bg-muted hover:border-border border-border/50" 
          : "opacity-50 hover:opacity-70 bg-muted/50 border-transparent"
      )}
    >
      {/* Platform Icon */}
      <div 
        className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
          "border border-card"
        )}
        style={{ 
          backgroundColor: platform?.color ? `${platform.color}18` : '#f1f5f9',
        }}
      >
        {platform?.key ? (
          <PlatformIcon 
            platformData={platform}
            url={link.url}
            size="sm"
          />
        ) : (
          <FaviconIcon url={link.url} size="sm" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <p className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary">
            {link.title || platform?.nameAr || 'رابط'}
          </p>
          {link.isPinned && (
            <span className="flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded bg-warning/15 text-warning-filled flex-shrink-0">
              <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current" />
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate" dir="ltr">
          {link.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35)}
        </p>
      </div>
      
      {/* Stats & Arrow */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {link.totalClicks > 0 && (
          <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded-md bg-muted group-hover:bg-primary/10 transition-colors">
            <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground group-hover:text-primary" />
            <span className="text-[10px] sm:text-[11px] text-muted-foreground group-hover:text-primary font-medium">
              {link.totalClicks.toLocaleString()}
            </span>
          </div>
        )}
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-muted group-hover:bg-primary flex items-center justify-center transition-all">
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-primary-foreground" />
        </div>
      </div>
    </a>
  );
}


function EmptyState() {
  return (
    <div className="text-center py-6 sm:py-8 px-3 sm:px-4">
      {/* Icon Circle */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Link2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
      </div>

      <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5 sm:mb-2">لا توجد روابط بعد</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5 max-w-xs mx-auto leading-relaxed">
        أضف روابط حساباتك الاجتماعية وشاركها مع الآخرين بسهولة
      </p>

      {/* Features - Simplified */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 flex-wrap">
        {[
          { icon: MousePointerClick, text: 'تتبع النقرات', color: 'bg-blue-50 text-blue-600' },
          { icon: Layers, text: 'تنظيم', color: 'bg-purple-50 text-purple-600' },
          { icon: Star, text: 'تثبيت', color: 'bg-amber-50 text-amber-600' },
        ].map((feature, i) => (
          <div 
            key={i}
            className={cn(
              "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium",
              feature.color
            )}
          >
            <feature.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{feature.text}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 justify-center items-center">
        <GoogleSocialConnect />
        
        <Link href="/app/profile/links" className="w-full sm:w-auto">
          <Button 
            size="default" 
            variant="outline"
            className="gap-2 rounded-xl transition-all w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة يدويًا</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SocialLinksSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      {/* Header Skeleton */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>

      {/* Links Skeleton */}
      <div className="p-3 space-y-1.5">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-2.5 p-2.5">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-3.5 w-24 mb-1.5" />
              <Skeleton className="h-2.5 w-36" />
            </div>
            <Skeleton className="w-6 h-6 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialLinksCard;
