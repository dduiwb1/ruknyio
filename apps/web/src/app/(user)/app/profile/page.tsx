'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, User } from 'lucide-react';

// Profile Components
import { 
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
  } = useProfile();

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

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 pb-28 md:pb-6">

            {/* Quick Stats - Same card design as Forms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <ProfileStats
                linksCount={socialLinks?.length || 0}
                groupsCount={linkGroups?.length || 0}
                viewsCount={profile?.views || 0}
                activeLinksCount={socialLinks?.filter(l => l.status === 'active').length || 0}
                totalClicks={socialLinks?.reduce((sum, l) => sum + (l.totalClicks || 0), 0) || 0}
                pinnedCount={socialLinks?.filter(l => l.isPinned).length || 0}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Social Links Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SocialLinksCard
                socialLinks={socialLinks}
                linkGroups={linkGroups}
                isLoading={isLoading}
              />
            </motion.div>

            {/* Help Card - للمستخدمين الجدد */}
            {socialLinks?.length === 0 && !isLoading && (
              <div className="bg-card rounded-xl p-4 sm:p-5 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
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
