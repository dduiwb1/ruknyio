'use client';

import { 
  Link2, 
  ExternalLink, 
  ChevronLeft,
  Plus,
  MousePointerClick,
  TrendingUp,
  Star,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlatformIcon, FaviconIcon } from '@/components/ui/platform-icon';
import { detectPlatform } from '@/lib/utils/urlDetection';
import type { SocialLink, LinkGroup } from '@/lib/types/profile';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Link2 className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-foreground truncate">روابطي</h2>
            <p className="text-xs text-muted-foreground truncate">
              {activeLinks > 0 ? `${activeLinks} رابط نشط` : 'لا توجد روابط'}
            </p>
          </div>
        </div>
        
        <Link 
          href="/app/profile/links"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground text-xs font-medium transition-colors flex-shrink-0"
        >
          <span>إدارة</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Bar */}
      {socialLinks.length > 0 && (
        <div className="px-4 py-2.5 bg-muted/30 border-b border-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">نقرة</p>
              </div>
            </div>
          </div>

          <Link href="/app/profile/links" className="flex-shrink-0">
            <Button 
              size="sm" 
              className="h-7 px-2.5 gap-1 text-xs rounded-lg"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </Button>
          </Link>
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {socialLinks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {displayLinks.map((link) => (
              <LinkItem key={link.id} link={link} />
            ))}
            
            {socialLinks.length > 5 && (
              <Link href="/app/profile/links" className="block mt-2">
                <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground text-xs font-medium border border-border">
                  <Globe className="w-4 h-4" />
                  <span>عرض الكل ({socialLinks.length})</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
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
        "group flex items-center gap-3 p-2.5 rounded-lg transition-colors border",
        isActive 
          ? "bg-card hover:bg-muted border-border" 
          : "opacity-50 bg-muted/30 border-transparent"
      )}
    >
      {/* Platform Icon */}
      <div 
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border border-border"
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
        <p className="text-sm font-medium text-foreground truncate">
          {link.title || platform?.nameAr || 'رابط'}
        </p>
        <p className="text-xs text-muted-foreground truncate" dir="ltr">
          {link.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35)}
        </p>
      </div>
      
      {/* Stats & Arrow */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {link.totalClicks > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 group-hover:bg-primary/10 transition-colors">
            <TrendingUp className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {link.totalClicks}
            </span>
          </div>
        )}
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </a>
  );
}


function EmptyState() {
  return (
    <div className="text-center py-8 px-4">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Link2 className="w-6 h-6 text-primary" />
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-1">لا توجد روابط</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto leading-relaxed">
        أضف روابطك الاجتماعية وشاركها مع الآخرين
      </p>

      <Link href="/app/profile/links">
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>إضافة رابط</span>
        </Button>
      </Link>
    </div>
  );
}

function SocialLinksSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header Skeleton */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>

      {/* Links Skeleton */}
      <div className="p-3 space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-2.5">
            <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="w-4 h-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialLinksCard;
