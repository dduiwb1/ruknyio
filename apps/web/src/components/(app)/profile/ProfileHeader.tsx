'use client';

import { Camera, Pencil, BadgeCheck, Globe, Lock, Copy, Check, ExternalLink, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { toast } from 'sonner';
import type { UserData, ProfileData } from '@/lib/types/profile';
import { getAvatarUrl, getInitials, getCoverUrl } from '@/lib/utils/avatar';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  user: UserData | null;
  profile: ProfileData | null;
  isLoading: boolean;
  onEditProfile?: () => void;
  onUploadAvatar?: () => void;
  onUploadCover?: () => void;
}

export function ProfileHeader({
  user,
  profile,
  isLoading,
  onEditProfile,
  onUploadAvatar,
  onUploadCover,
}: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const profileUrl = `${window.location.origin}/${profile?.username}`;
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return <ProfileHeaderSkeleton />;
  }

  const coverUrl = getCoverUrl(profile?.coverImage);

  return (
    <div className="bg-card rounded-lg sm:rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Cover Section */}
      <div className="relative h-28 sm:h-32 md:h-36">
        {/* Cover Background */}
        <div 
          className={cn(
            "absolute inset-0",
            !coverUrl && "bg-gradient-to-br from-primary to-primary/70"
          )}
        >
          {coverUrl && (
            <img
              src={coverUrl}
              alt="صورة الغلاف"
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
        
        {/* Cover Actions */}
        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 right-2 sm:right-2.5 flex items-center justify-between z-10">
          {/* Edit Cover */}
          <button
            onClick={onUploadCover}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md sm:rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md transition-all text-white text-[11px] sm:text-xs font-medium border border-white/20"
            title="تغيير الغلاف"
          >
            <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">تغيير الغلاف</span>
            <span className="sm:hidden">تغيير</span>
          </button>

          {/* Visibility Badge */}
          <div className={cn(
            "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md sm:rounded-lg backdrop-blur-md text-[11px] sm:text-xs font-medium border",
            profile?.visibility === 'PUBLIC' 
              ? "bg-emerald-500/25 border-emerald-400/30 text-white"
              : "bg-amber-500/25 border-amber-400/30 text-white"
          )}>
            {profile?.visibility === 'PUBLIC' ? (
              <>
                <Globe className="w-3 h-3" />
                <span>عام</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>خاص</span>
              </>
            )}
          </div>
        </div>

        {/* Profile Actions */}
        {profile?.username && (
          <div className="absolute bottom-2 sm:bottom-2.5 left-2 sm:left-2.5 flex items-center gap-1.5 sm:gap-2 z-10">
            {/* Preview Button */}
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md sm:rounded-lg bg-card/95 hover:bg-card text-primary text-[11px] sm:text-xs font-medium transition-all shadow-md"
            >
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>معاينة</span>
            </a>
            
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={cn(
                "flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md sm:rounded-lg backdrop-blur-md text-[11px] sm:text-xs font-medium transition-all shadow-md border",
                copied 
                  ? "bg-emerald-500 text-white border-emerald-400" 
                  : "bg-white/20 hover:bg-white/30 text-white border-white/20"
              )}
              title="نسخ الرابط"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>تم!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="relative px-3 sm:px-4 md:px-5 pb-3 sm:pb-4">
        {/* Avatar */}
        <div className="relative -mt-10 sm:-mt-12 mb-2.5 sm:mb-3">
          <div className="relative inline-block">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-3 sm:ring-4 ring-card shadow-lg">
              <AvatarImage 
                src={getAvatarUrl(profile?.avatar) || undefined} 
                alt={profile?.name || ''} 
              />
              <AvatarFallback className="text-base sm:text-xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {getInitials(profile?.name || user?.email || '')}
              </AvatarFallback>
            </Avatar>
            
            {/* Upload Avatar Button */}
            <button
              onClick={onUploadAvatar}
              className="absolute -bottom-0.5 -right-0.5 p-1 sm:p-1.5 rounded-full bg-primary shadow-md transition-all hover:scale-110 border-2 border-card"
              title="تغيير الصورة"
            >
              <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Name & Actions */}
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            {/* Name */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5 sm:mb-1">
              <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
                {profile?.name || user?.email?.split('@')[0] || 'المستخدم'}
              </h1>
              {user?.emailVerified && (
                <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium">
                  <BadgeCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>موثق</span>
                </div>
              )}
            </div>
            
            {/* Username */}
            {profile?.username && (
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                @{profile.username}
              </p>
            )}
            
            {/* Bio */}
            {profile?.bio && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-2.5 line-clamp-2 leading-relaxed bg-muted/80 p-2 sm:p-2.5 rounded-lg">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onEditProfile}
            className="flex-shrink-0 gap-1 sm:gap-1.5 rounded-lg h-8 sm:h-9 px-2.5 sm:px-3 border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all text-xs sm:text-sm"
          >
            <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">تعديل</span>
            <span className="sm:hidden">تعديل</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfileHeaderSkeleton() {
  return (
    <div className="bg-card rounded-lg sm:rounded-xl border border-border overflow-hidden">
      <Skeleton className="h-28 sm:h-32 md:h-36" />
      <div className="relative px-3 sm:px-4 md:px-5 pb-3 sm:pb-4">
        <div className="relative -mt-10 sm:-mt-12 mb-2.5 sm:mb-3">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
        </div>
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="space-y-2 sm:space-y-2.5 flex-1">
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-36" />
            <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-24" />
            <Skeleton className="h-12 sm:h-14 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}


export default ProfileHeader;
