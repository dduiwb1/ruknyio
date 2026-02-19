'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

// Profile Components
import { 
  ProfileHeader, 
  SocialLinksCard,
  ProfileStats,
  PhoneMockup,
} from '@/components/(app)/profile';

// Hooks
import { useProfile } from '@/lib/hooks/profile';
import { useAuthContext } from '@/lib/auth/auth-provider';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  
  // Profile Hook
  const {
    user,
    profile,
    socialLinks,
    linkGroups,
    isLoading,
    isUpdating,
    uploadAvatar,
    uploadCover,
  } = useProfile();

  // File Input Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Handle Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة (JPG, PNG, أو GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`حجم الصورة ${sizeMB} ميجابايت. الحد الأقصى 5 ميجابايت`);
      return;
    }

    const loadingToast = toast.loading('جاري رفع الصورة...');
    try {
      await uploadAvatar(file);
      toast.success('✓ تم تحديث الصورة الشخصية بنجاح', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || 'فشل في رفع الصورة. حاول مرة أخرى', { id: loadingToast });
    }

    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  // Handle Cover Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة (JPG, PNG, أو GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`حجم الصورة ${sizeMB} ميجابايت. الحد الأقصى 10 ميجابايت`);
      return;
    }

    const loadingToast = toast.loading('جاري رفع صورة الغلاف...');
    try {
      await uploadCover(file);
      toast.success('✓ تم تحديث صورة الغلاف بنجاح', { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message || 'فشل في رفع صورة الغلاف. حاول مرة أخرى', { id: loadingToast });
    }

    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  // Auth Check
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?callbackUrl=/app/profile');
    return null;
  }

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 gap-4 m-2 md:ms-0" dir="rtl">
      {/* Hidden File Inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
        aria-label="رفع الصورة الشخصية"
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
        aria-label="رفع صورة الغلاف"
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 pb-28 md:pb-6">
            
            {/* Page Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">ملفي الشخصي</h1>
                <p className="text-sm text-muted-foreground">إدارة معلوماتك وروابطك</p>
              </div>
            </div>

            {/* Profile Header */}
            <ProfileHeader
              user={user}
              profile={profile}
              isLoading={isLoading}
              onEditProfile={() => router.push('/app/profile/edit')}
              onUploadAvatar={() => avatarInputRef.current?.click()}
              onUploadCover={() => coverInputRef.current?.click()}
            />

            {/* Quick Stats */}
            <ProfileStats
              linksCount={socialLinks?.length || 0}
              groupsCount={linkGroups?.length || 0}
              viewsCount={profile?.views || 0}
              isLoading={isLoading}
            />

            {/* Social Links Card */}
            <SocialLinksCard
              socialLinks={socialLinks}
              linkGroups={linkGroups}
              isLoading={isLoading}
            />

            {/* Help Card - للمستخدمين الجدد */}
            {socialLinks?.length === 0 && !isLoading && (
              <div className="bg-primary/5 rounded-2xl p-4 sm:p-5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground mb-1">ابدأ بإضافة روابطك</h3>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                      أضف روابط حساباتك على منصات التواصل الاجتماعي لمشاركتها بسهولة
                    </p>
                    <button
                      onClick={() => router.push('/app/profile/links')}
                      className="text-xs font-medium text-primary hover:text-primary/80 underline inline-flex items-center gap-1 transition-colors"
                    >
                      <span>إضافة رابط الآن</span>
                      <span>←</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phone Preview Sidebar - Desktop Only */}
      <div className="hidden xl:flex">
        <PhoneMockup
          profile={{
            username: profile?.username || user?.email?.split('@')[0] || '',
            displayName: profile?.name || '',
            bio: profile?.bio || '',
            avatar: profile?.avatar || '',
            isVerified: !!user?.emailVerified,
            socialLinks: socialLinks || [],
          }}
          customLinks={socialLinks || []}
        />
      </div>

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-5 shadow-xl border border-border flex items-center gap-3 max-w-xs">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-5 h-5 animate-spin text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-foreground block">جاري التحديث...</span>
              <span className="text-xs text-muted-foreground">يرجى الانتظار</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
