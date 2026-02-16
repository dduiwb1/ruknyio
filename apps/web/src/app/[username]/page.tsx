'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  FloatingActionBar, 
  FABButton, 
  FABDivider, 
  FABBadge 
} from '@/components/layout/floating-action-bar';
import { 
  MapPin, 
  Calendar, 
  Link2, 
  Share2, 
  QrCode,
  ExternalLink,
  CalendarDays,
  Users,
  CheckCircle2,
  Copy,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Globe,
  Mail,
  Phone,
  MessageCircle,
  ClipboardList,
  Clock,
  ArrowLeft
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api';
import { AuthClient } from '@/lib/auth/auth-client';
import { getCsrfToken } from '@/lib/api/client';
import { toast } from '@/components/toast-provider';

// Avatar/Cover URL helpers
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

const resolveAvatarUrl = (avatar?: string | null): string | null => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('users/') || avatar.startsWith('profiles/')) {
    return `${API_BASE_URL}/api/${avatar}`;
  }
  const filename = avatar.split('/').pop() || avatar;
  return `${API_BASE_URL}/uploads/avatars/${filename}`;
};

const resolveCoverUrl = (cover?: string | null): string | null => {
  if (!cover) return null;
  if (cover.startsWith('http')) return cover;
  if (cover.startsWith('users/') || cover.startsWith('profiles/') || cover.startsWith('covers/')) {
    return `${API_BASE_URL}/api/${cover}`;
  }
  const filename = cover.split('/').pop() || cover;
  return `${API_BASE_URL}/uploads/covers/${filename}`;
};

// Helper to check if user has valid token
const hasValidToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  const csrfToken = getCsrfToken();
  return !!csrfToken;
};

// Types
interface SocialLink {
  id: string;
  platform: string;
  url: string;
  title?: string;
  displayOrder: number;
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  coverImage?: string;
  location?: string;
  venue?: string;
  _count?: { registrations: number };
}

interface PublicForm {
  id: string;
  title: string;
  description?: string;
  slug: string;
  type: string;
  coverImage?: string;
  settings?: any;
  createdAt: string;
  expiresAt?: string;
  _count?: { submissions: number };
}

interface PublicProfile {
  id: string;
  username: string;
  name?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  banners?: string[];
  location?: string;
  website?: string;
  visibility: string;
  createdAt: string;
  user: {
    id: string;
    email?: string;
    name?: string;
  };
  socialLinks: SocialLink[];
  _count?: {
    followers: number;
    following: number;
  };
}

// Social Icons Map
const socialIcons: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  github: Github,
  website: Globe,
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  tiktok: Link2,
  custom: Link2,
};

const socialColors: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  x: '#000000',
  linkedin: '#0A66C2',
  youtube: '#FF0000',
  github: '#333333',
  whatsapp: '#25D366',
  tiktok: '#000000',
};

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

// Use shared helpers to resolve image URLs (handles presigned URLs and relative keys)

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [forms, setForms] = useState<PublicForm[]>([]);
  const [featuredForm, setFeaturedForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'links' | 'events' | 'forms'>('links');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  // Theme color - Teal/Cyan for profiles
  const themeColor = '#0D9488';

  // Auto-slide banners every 5 seconds
  useEffect(() => {
    if (!profile?.banners || profile.banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev === profile.banners!.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [profile?.banners]);

  // API URL for public requests (without auth)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  // Fetch profile data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile (public endpoint - no auth required)
        const profileRes = await fetch(`${API_URL}/profiles/${username}`);
        if (!profileRes.ok) {
          throw new Error('Profile not found');
        }
        const profileData: PublicProfile = await profileRes.json();
        setProfile(profileData);

        // Check if this is the user's own profile and follow status
        // Try to refresh token first if needed, then check auth
        let hasToken = hasValidToken();
        if (!hasToken) {
          // Try to refresh the token
          const refreshed = await AuthClient.refreshTokens();
          hasToken = refreshed && hasValidToken();
        }
        
        if (hasToken) {
          try {
            const response = await api.get<{ id: string }>('/auth/me');
            const currentUser = response.data;
            if (currentUser?.id === profileData.user?.id) {
              setIsOwnProfile(true);
            } else if (currentUser?.id) {
              // Check if following this user
              try {
                const followResponse = await api.get<{ isFollowing: boolean }>(`/follow/${profileData.user.id}/is-following`);
                setIsFollowing(followResponse.data?.isFollowing || false);
              } catch {
                // Ignore follow status errors
              }
            }
          } catch {
            // User not logged in or error checking auth - that's fine
            setIsOwnProfile(false);
          }
        }

        // Fetch user's events - public endpoint
        try {
          const eventsRes = await fetch(`${API_URL}/events?organizerUsername=${username}&limit=4`);
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            setEvents(eventsData.events || []);
          }
        } catch {
          setEvents([]);
        }

        // Fetch user's public forms
        try {
          const formsRes = await fetch(`${API_URL}/forms/public/user/${username}?limit=10`);
          if (formsRes.ok) {
            const formsData = await formsRes.json();
            setForms(formsData.forms || []);
            setFeaturedForm(formsData.featured || null);
          }
        } catch {
          setForms([]);
        }

      } catch (err: any) {
        // Error fetching profile
        setError(err.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchData();
    }
  }, [username, API_URL]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFollow = async () => {
    if (!profile?.user?.id || followLoading || isOwnProfile) return;
    
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/follow/${profile.user.id}`);
        setIsFollowing(false);
        // Update follower count locally
        setProfile({
          ...profile,
          _count: {
            followers: Math.max(0, (profile._count?.followers || 0) - 1),
            following: profile._count?.following || 0
          }
        });
      } else {
        await api.post(`/follow/${profile.user.id}`);
        setIsFollowing(true);
        // Update follower count locally
        setProfile({
          ...profile,
          _count: {
            followers: (profile._count?.followers || 0) + 1,
            following: profile._count?.following || 0
          }
        });
      }
    } catch (err: any) {
      // Error toggling follow
      // Show appropriate error message
      const errorMessage = err?.response?.data?.message || err?.message || 'حدث خطأ';
      if (errorMessage.includes('cannot follow yourself') || errorMessage.includes('You cannot follow yourself')) {
        toast.info('لا يمكنك متابعة نفسك', {
          description: 'هذا هو ملفك الشخصي',
          duration: 3000,
        });
      } else {
        toast.error('حدث خطأ', {
          description: errorMessage,
          duration: 3000,
        });
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">جاري العمل على إكمال المنصة</h1>
        <p className="text-gray-500">هذه الصفحة قيد التطوير وستكون متاحة قريباً</p>
        <a
          href="/"
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          العودة للرئيسية
        </a>
      </div>
    );
  }

  const profileUrl = typeof window !== 'undefined' ? window.location.href : '';
  const displayName = profile.name || profile.user?.name || profile.username;
  const hasEvents = events.length > 0;
  const hasForms = forms.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Action Bar */}
      <FloatingActionBar>
        <FABButton
          onClick={() => window.history.back()}
          ariaLabel="رجوع"
        >
          <ChevronRight className="w-5 h-5" />
        </FABButton>
        
        <FABBadge>
          @{profile.username}
        </FABBadge>
        
        <FABDivider />
        
        <FABButton
          onClick={() => setShowQRModal(true)}
          ariaLabel="رمز QR"
          title="QR Code"
        >
          <QrCode className="w-5 h-5" />
        </FABButton>
        <FABButton
          onClick={() => setShowShareModal(true)}
          ariaLabel="مشاركة"
          variant="primary"
        >
          <Share2 className="w-5 h-5" />
        </FABButton>
      </FloatingActionBar>

      {/* Profile Content */}
      <div className="max-w-2xl mt-18 mx-auto px-4 py-6 pb-8">
        
        {/* Cover Image */}
        {profile.coverImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-100"
          >
            <div className="relative h-40 sm:h-52 md:h-64">
              <img 
                src={resolveCoverUrl(profile.coverImage) || undefined} 
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).parentElement!.parentElement!.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* Hero Section - Clean & Minimal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="py-6"
        >
          {/* Avatar & Name Row */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="w-20 h-20 ring-4 ring-gray-100 flex-shrink-0">
              {profile.avatar && (
                <AvatarImage 
                  src={resolveAvatarUrl(profile.avatar) || undefined} 
                  alt={displayName}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <AvatarFallback 
                className="text-xl font-bold text-white"
                style={{ backgroundColor: themeColor }}
              >
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            {/* Name & Username */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {displayName}
                </h1>
                {profile.visibility === 'PUBLIC' && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 rounded-full flex-shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 22 22" fill="none">
                      <path 
                        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681.132-.637.075-1.299-.165-1.903.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246-5.683 6.206z" 
                        fill="#1D9BF0"
                      />
                    </svg>
                    <span className="text-xs font-medium text-blue-600">موثق</span>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-0.5">@{profile.username}</p>
              
              {/* Follow Button */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={cn(
                    "mt-3 px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    isFollowing
                      ? "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
                      : "text-white hover:opacity-90",
                    followLoading && "opacity-50 cursor-not-allowed"
                  )}
                  style={!isFollowing ? { backgroundColor: themeColor } : undefined}
                >
                  {followLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="group-hover:hidden">متابَع</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      متابعة
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-gray-600 leading-relaxed text-sm">
              {profile.bio}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              انضم {new Date(profile.createdAt).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' })}
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="py-4 border-y border-gray-100 mb-6"
        >
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(profile._count?.followers || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">متابع</p>
            </div>
            <div className="h-10 w-px bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(profile._count?.following || 0)}</p>
              <p className="text-xs text-gray-500 mt-1">يتابع</p>
            </div>
            
          </div>
        </motion.div>

        {/* Banners Slider */}
        {profile.banners && profile.banners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mb-6"
          >
            <h3 className="text-sm font-medium text-gray-500 mb-3">العروض والإعلانات</h3>
            <div className="rounded-2xl overflow-hidden border border-gray-100 relative">
              <div 
                className="relative h-40 sm:h-52 md:h-64 cursor-grab active:cursor-grabbing touch-pan-y"
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  (e.currentTarget as any)._touchStartX = touch.clientX;
                  (e.currentTarget as any)._touchStartTime = Date.now();
                }}
                onTouchEnd={(e) => {
                  const touchStartX = (e.currentTarget as any)._touchStartX;
                  const touchStartTime = (e.currentTarget as any)._touchStartTime;
                  if (touchStartX === undefined) return;
                  
                  const touch = e.changedTouches[0];
                  const diff = touchStartX - touch.clientX;
                  const timeDiff = Date.now() - touchStartTime;
                  
                  if (Math.abs(diff) > 50 || (Math.abs(diff) > 20 && timeDiff < 200)) {
                    if (diff > 0) {
                      setCurrentBanner((prev) => (prev === 0 ? profile.banners!.length - 1 : prev - 1));
                    } else {
                      setCurrentBanner((prev) => (prev === profile.banners!.length - 1 ? 0 : prev + 1));
                    }
                  }
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as any)._mouseStartX = e.clientX;
                  (e.currentTarget as any)._isDragging = true;
                }}
                onMouseMove={(e) => {
                  if (!(e.currentTarget as any)._isDragging) return;
                  e.preventDefault();
                }}
                onMouseUp={(e) => {
                  const mouseStartX = (e.currentTarget as any)._mouseStartX;
                  if (mouseStartX === undefined || !(e.currentTarget as any)._isDragging) return;
                  
                  (e.currentTarget as any)._isDragging = false;
                  const diff = mouseStartX - e.clientX;
                  
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                      setCurrentBanner((prev) => (prev === 0 ? profile.banners!.length - 1 : prev - 1));
                    } else {
                      setCurrentBanner((prev) => (prev === profile.banners!.length - 1 ? 0 : prev + 1));
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as any)._isDragging = false;
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentBanner}
                    src={profile.banners[currentBanner]}
                    alt={`Banner ${currentBanner + 1}`}
                    className="w-full h-full object-cover absolute inset-0 select-none pointer-events-none"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </AnimatePresence>
                
                {/* Dots Indicator */}
                {profile.banners.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                    {profile.banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentBanner(idx)}
                        className={cn(
                          "rounded-full transition-all duration-300",
                          idx === currentBanner
                            ? "bg-white w-6 h-2"
                            : "bg-white/50 hover:bg-white/80 w-2 h-2"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('links')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap",
                activeTab === 'links'
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              <Link2 className="w-4 h-4" />
              الكل
              {profile.socialLinks?.length > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === 'links' ? "bg-white/20" : "bg-gray-100"
                )}>
                  {profile.socialLinks.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('events')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap",
                activeTab === 'events'
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              <CalendarDays className="w-4 h-4" />
              الأحداث
              {events.length > 0 && (
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === 'events' ? "bg-white/20" : "bg-gray-100"
                )}>
                  {events.length}
                </span>
              )}
            </button>

            {hasForms && (
              <button
                onClick={() => setActiveTab('forms')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border whitespace-nowrap",
                  activeTab === 'forms'
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
              >
                <ClipboardList className="w-4 h-4" />
                النماذج
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeTab === 'forms' ? "bg-white/20" : "bg-gray-100"
                )}>
                  {forms.length}
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Featured Form Banner */}
        {featuredForm && activeTab !== 'forms' && (
          <motion.a
            href={`/f/${featuredForm.slug}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="block mt-4 p-4 rounded-2xl border border-gray-100 bg-gradient-to-l from-blue-50 to-white hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <ClipboardList className="w-6 h-6" style={{ color: themeColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 truncate">{featuredForm.title}</h4>
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
                    نموذج نشط
                  </span>
                </div>
                {featuredForm.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{featuredForm.description}</p>
                )}
                {featuredForm.expiresAt && new Date(featuredForm.expiresAt) > new Date() && (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ينتهي {new Date(featuredForm.expiresAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:-translate-x-1 transition-all flex-shrink-0" />
            </div>
          </motion.a>
        )}

        {/* Tab Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.45 }}
          className="mt-6"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'links' && (
              <motion.div
                key="links"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {profile.socialLinks?.map((link, index) => {
                  const platform = link.platform?.toLowerCase() || 'custom';
                  const Icon = socialIcons[platform] || Link2;
                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${themeColor}15` }}
                        >
                          <Icon 
                            className="w-5 h-5" 
                            style={{ color: themeColor }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">{link.title || link.platform}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </motion.a>
                  );
                })}
                
                {(!profile.socialLinks || profile.socialLinks.length === 0) && (
                  <div className="text-center py-12 text-gray-500">
                    <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد روابط</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                {events.map((event, index) => (
                  <motion.a
                    key={event.id}
                    href={`/events/${event.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {event.coverImage ? (
                        <img 
                          src={event.coverImage} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: `${themeColor}15` }}
                        >
                          <CalendarDays className="w-8 h-8" style={{ color: themeColor }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(event.startDate).toLocaleDateString('ar-SA', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        {(event.location || event.venue) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.venue || event.location}
                          </span>
                        )}
                        {event._count?.registrations !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {event._count.registrations} مشارك
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.a>
                ))}

                {events.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarDays className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد أحداث قادمة</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'forms' && (
              <motion.div
                key="forms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {forms.map((form, index) => (
                  <motion.a
                    key={form.id}
                    href={`/f/${form.slug}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all group"
                  >
                    {/* Cover Image or Gradient Background */}
                    <div className="relative h-32 rounded-xl m-2 overflow-hidden">
                      {form.coverImage ? (
                        <img 
                          src={form.coverImage} 
                          alt={form.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div 
                          className="w-full h-full"
                          style={{ 
                            background: `linear-gradient(135deg, ${themeColor}20 0%, ${themeColor}40 50%, ${themeColor}60 100%)` 
                          }}
                        />
                      )}
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* Type Badge */}
                      {form.type && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-sm">
                          {form.type === 'SURVEY' ? 'استبيان' : 
                           form.type === 'REGISTRATION' ? 'تسجيل' : 
                           form.type === 'FEEDBACK' ? 'تقييم' : 
                           form.type === 'CONTACT' ? 'تواصل' : 'نموذج'}
                        </span>
                      )}
                      
                    </div>
                    
                    {/* Content */}
                    <div className="m-4">
                      <h3 className="font-semibold my-4 text-gray-900 line-clamp-1 group-hover:text-gray-700 transition-colors">
                        {form.title}
                      </h3>
                      {form.description && (
                        <p className="text-sm  text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {form.description}
                        </p>
                      )}
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        {form.expiresAt ? (
                          <span className={cn(
                            "flex items-center gap-1.5 text-xs font-medium",
                            new Date(form.expiresAt) < new Date() ? "text-red-500" : "text-orange-500"
                          )}>
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(form.expiresAt) < new Date() 
                              ? "منتهي" 
                              : `ينتهي ${new Date(form.expiresAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}`
                            }
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            متاح الآن
                          </span>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                          <span>فتح</span>
                          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}

                {forms.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>لا توجد نماذج متاحة</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400">
            مدعوم من <span className="font-semibold text-gray-500">Rukny</span>
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">مشاركة الملف الشخصي</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="flex justify-center p-4 bg-white rounded-2xl border border-gray-100">
                <QRCodeSVG 
                  value={profileUrl}
                  size={200}
                  level="H"
                  includeMargin
                  fgColor={themeColor}
                />
              </div>

              <p className="text-center text-sm text-gray-500 mt-4">
                امسح الكود للوصول للملف الشخصي
              </p>

              <button
                onClick={handleCopyLink}
                className="w-full mt-4 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    تم النسخ!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    نسخ الرابط
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-sm shadow-2xl"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />
              
              <h3 className="text-lg font-bold text-gray-900 mb-4">مشاركة</h3>
              
              <div className="grid grid-cols-4 gap-4">
                {[
                  { name: 'واتساب', icon: MessageCircle, color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent(profileUrl)}` },
                  { name: 'تويتر', icon: Twitter, color: '#1DA1F2', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}` },
                  { name: 'لينكدإن', icon: Linkedin, color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}` },
                  { name: 'نسخ', icon: Copy, color: '#6B7280', onClick: handleCopyLink },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else if (item.url) {
                        window.open(item.url, '_blank');
                      }
                      setShowShareModal(false);
                    }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-6 py-3 text-gray-500 font-medium"
              >
                إلغاء
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
