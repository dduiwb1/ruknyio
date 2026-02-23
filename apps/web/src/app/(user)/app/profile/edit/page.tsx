'use client';

import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight,
  Loader2,
  Camera,
  User,
  Phone,
  Save,
  Check,
  Sparkles,
  ChevronLeft,
  Home,
  X
} from 'lucide-react';
import { toast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Profile Components
import { PhoneMockup } from '@/components/(app)/profile';

// Hooks
import { useProfile } from '@/lib/hooks/profile';
import { useAuthContext } from '@/lib/auth/auth-provider';
import { getAvatarUrl, getInitials } from '@/lib/utils/avatar';
import { getAuthUrl } from '@/lib/url';
import BannersUpload from './BannersUpload';

// Types
type EditTab = 'images' | 'basic' | 'contact' | 'extras';

const tabs: { id: EditTab; label: string; icon: React.ElementType }[] = [
  { id: 'images', label: 'الصور', icon: Camera },
  { id: 'basic', label: 'المعلومات', icon: User },
  { id: 'contact', label: 'الاتصال', icon: Phone },
  { id: 'extras', label: 'إضافات مميزة', icon: Sparkles },
];

export default function EditProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [activeTab, setActiveTab] = useState<EditTab>('images');
  const [isSaving, setIsSaving] = useState(false);

  // Profile Hook
  const {
    user,
    profile,
    isLoading,
    uploadAvatar,
    uploadCover,
    updateProfile,
    checkUsername,
  } = useProfile();

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    bio: '',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    phone: '',
  });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // File Input Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [resolvedCoverSrc, setResolvedCoverSrc] = useState<string | null>(null);

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        name: profile.name || '',
        bio: profile.bio || '',
        visibility: profile.visibility || 'PUBLIC',
        phone: user?.phone || '',
      });
    }
    // Resolve cover image to absolute URL for debugging/preview
    try {
      const raw = profile?.coverImage;
      const url = getAvatarUrl(raw as any) || null;
      if (url && !url.startsWith('http') && typeof window !== 'undefined') {
        setResolvedCoverSrc(`${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`);
      } else {
        setResolvedCoverSrc(url);
      }
    } catch (e) {
      setResolvedCoverSrc(null);
    }
  }, [profile, user]);

  // Check username availability
  const handleUsernameChange = async (value: string) => {
    setFormData(prev => ({ ...prev, username: value }));
    
    if (value === profile?.username) {
      setUsernameStatus('idle');
      return;
    }

    if (value.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const isAvailable = await checkUsername(value);
    setUsernameStatus(isAvailable ? 'available' : 'taken');
  };

  // Handle Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }

    try {
      await uploadAvatar(file);
      toast.success('تم تحديث الصورة الشخصية بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل في رفع الصورة');
    }

    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  // Handle Cover Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن لا يتجاوز 10 ميجابايت');
      return;
    }

    try {
      await uploadCover(file);
      toast.success('تم تحديث صورة الغلاف بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل في رفع صورة الغلاف');
    }

    if (coverInputRef.current) {
      coverInputRef.current.value = '';
    }
  };

  // Handle Save
  const handleSave = async () => {
    if (usernameStatus === 'taken') {
      toast.error('اسم المستخدم غير متاح');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        username: formData.username,
        name: formData.name,
        bio: formData.bio,
        visibility: formData.visibility,
      });
      toast.success('تم حفظ التغييرات بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل في حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  // Auth Check
  if (authLoading || isLoading) {
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
    window.location.replace(getAuthUrl('/login'));
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
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        className="hidden"
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 pb-28 md:pb-6">
          
            {/* Header - Same style as Forms */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors active:scale-95"
                  title="رجوع"
                >
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </button>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">تعديل الملف الشخصي</h1>
                  <p className="text-sm text-muted-foreground">قم بتخصيص ملفك الشخصي ومعلوماتك</p>
                </div>
              </div>
              
              <Button
                onClick={handleSave}
                disabled={isSaving || usernameStatus === 'taken'}
                className="gap-2 rounded-xl min-w-[100px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>حفظ التغييرات</span>
                  </>
                )}
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all border active:scale-95",
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div>
              {/* Images Section */}
              {activeTab === 'images' && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Section Header */}
                  <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-foreground">صور الملف الشخصي</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">قم بتخصيص صورتك الشخصية وغلاف ملفك</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6 space-y-6 sm:space-y-8">
                    {/* Cover Image Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-foreground">صورة الغلاف</Label>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">1920×480 مثالي</span>
                      </div>
                      
                      <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="relative h-40 sm:h-44 rounded-2xl overflow-hidden cursor-pointer group border-2 border-dashed border-border hover:border-primary transition-all duration-300 bg-muted/50"
                      >
                        {resolvedCoverSrc ? (
                          <img
                            src={resolvedCoverSrc}
                            alt="صورة الغلاف"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted flex items-center justify-center mb-3">
                              <Camera className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">اضغط لإضافة صورة غلاف</p>
                            <p className="text-xs mt-1">JPG, PNG, WebP</p>
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300">
                            <div className="bg-card rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
                              <Camera className="w-5 h-5 text-primary" />
                              <span className="text-sm font-medium text-foreground">تغيير الغلاف</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
                        أقصى حجم: 10 ميجابايت
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border"></div>

                    {/* Avatar Section */}
                    <div className="space-y-4">
                      <Label className="text-sm font-semibold text-foreground block">الصورة الشخصية</Label>
                      
                      <div className="flex items-center gap-5 sm:gap-6">
                        {/* Avatar Preview */}
                        <div 
                          onClick={() => avatarInputRef.current?.click()}
                          className="relative cursor-pointer group"
                        >
                          <div className="relative">
                            <Avatar className="w-24 h-24 sm:w-28 sm:h-28 ring-4 ring-muted shadow-lg">
                              <AvatarImage 
                                src={getAvatarUrl(profile?.avatar) || undefined} 
                                alt={profile?.name || ''} 
                              />
                              <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                {getInitials(profile?.name || user?.email || '')}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Camera Badge */}
                            <div className="absolute -bottom-1 -left-1 w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                            </div>
                          </div>
                          
                          {/* Hover Ring */}
                          <div className="absolute inset-0 rounded-full ring-4 ring-primary/0 group-hover:ring-primary/30 transition-all duration-300"></div>
                        </div>
                        
                        {/* Avatar Info */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">اضغط على الصورة لتغييرها</p>
                            <p className="text-xs text-muted-foreground mt-1">يُفضل صورة مربعة بحجم 400×400 بكسل</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                avatarInputRef.current?.click();
                              }}
                              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors active:scale-95"
                            >
                              رفع صورة جديدة
                            </button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
                            أقصى حجم: 5 ميجابايت
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Info Section */}
              {activeTab === 'basic' && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Section Header */}
                  <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-info flex items-center justify-center shadow-lg shadow-info/20">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-foreground">المعلومات الأساسية</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">معلوماتك الشخصية الظاهرة للآخرين</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                    {/* Username Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                          اسم المستخدم
                        </Label>
                        <span className="text-xs text-muted-foreground">مطلوب</span>
                      </div>
                      <div className="relative">
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-muted rounded-r-xl flex items-center justify-center border-l border-border">
                          <span className="text-muted-foreground font-medium">@</span>
                        </div>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          placeholder="username"
                          className="h-12 pr-14 pl-12 rounded-xl transition-all"
                          dir="ltr"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          {usernameStatus === 'checking' && (
                            <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin text-info" />
                            </div>
                          )}
                          {usernameStatus === 'available' && (
                            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                              <Check className="w-4 h-4 text-success" />
                            </div>
                          )}
                          {usernameStatus === 'taken' && (
                            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                              <X className="w-4 h-4 text-destructive" />
                            </div>
                          )}
                        </div>
                      </div>
                      {usernameStatus === 'taken' && (
                        <p className="text-xs text-destructive flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive"></span>
                          اسم المستخدم غير متاح، جرب اسماً آخر
                        </p>
                      )}
                      {usernameStatus === 'available' && (
                        <p className="text-xs text-success flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                          اسم المستخدم متاح ✓
                        </p>
                      )}
                      {usernameStatus === 'idle' && (
                        <p className="text-xs text-muted-foreground">rukny.io/{formData.username || 'username'}</p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border"></div>

                    {/* Display Name Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                          الاسم الظاهر
                        </Label>
                        <span className="text-xs text-muted-foreground">اختياري</span>
                      </div>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="اكتب اسمك الكامل"
                        className="h-12 rounded-xl transition-all"
                      />
                      <p className="text-xs text-muted-foreground">هذا الاسم سيظهر في ملفك الشخصي</p>
                    </div>

                    {/* Bio Field */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="bio" className="text-sm font-semibold text-foreground">
                          النبذة التعريفية
                        </Label>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          formData.bio.length > 180 
                            ? "bg-warning/15 text-warning-filled" 
                            : "bg-muted text-muted-foreground"
                        )}>
                          {formData.bio.length}/200
                        </span>
                      </div>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => {
                          if (e.target.value.length <= 200) {
                            setFormData(prev => ({ ...prev, bio: e.target.value }));
                          }
                        }}
                        placeholder="اكتب نبذة مختصرة عنك..."
                        rows={4}
                        className="rounded-xl transition-all resize-none"
                      />
                      <p className="text-xs text-muted-foreground">اكتب نبذة تعريفية قصيرة تصف نفسك أو عملك</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border"></div>

                    {/* Visibility Field */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-foreground block">
                        خصوصية الملف الشخصي
                      </Label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Public Option */}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, visibility: 'PUBLIC' }))}
                          className={cn(
                            "relative p-4 rounded-xl border-2 text-right transition-all duration-200",
                            formData.visibility === 'PUBLIC'
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30 bg-card"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              formData.visibility === 'PUBLIC'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">عام</p>
                              <p className="text-xs text-muted-foreground mt-0.5">يمكن للجميع رؤية ملفك</p>
                            </div>
                          </div>
                          {formData.visibility === 'PUBLIC' && (
                            <div className="absolute top-3 left-3">
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </button>
                        
                        {/* Private Option */}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, visibility: 'PRIVATE' }))}
                          className={cn(
                            "relative p-4 rounded-xl border-2 text-right transition-all duration-200",
                            formData.visibility === 'PRIVATE'
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-muted-foreground/30 bg-card"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              formData.visibility === 'PRIVATE'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">خاص</p>
                              <p className="text-xs text-muted-foreground mt-0.5">أنت فقط من يراه</p>
                            </div>
                          </div>
                          {formData.visibility === 'PRIVATE' && (
                            <div className="absolute top-3 left-3">
                              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {activeTab === 'contact' && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Section Header */}
                  <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-foreground">معلومات الاتصال</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">طرق التواصل معك</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                    {/* Email Field (Read Only) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-foreground">
                          البريد الإلكتروني
                        </Label>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          محمي
                        </span>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-muted rounded-r-xl flex items-center justify-center border-l border-border">
                          <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <Input
                          value={user?.email || ''}
                          disabled
                          className="h-12 pr-14 rounded-xl bg-muted/50 text-muted-foreground cursor-not-allowed"
                          dir="ltr"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-info/10 border border-info/20 rounded-xl">
                        <svg className="w-5 h-5 text-info flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-foreground">
                          لتغيير البريد الإلكتروني، انتقل إلى <button onClick={() => router.push('/app/settings')} className="font-semibold underline hover:no-underline text-primary">الإعدادات</button>
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border"></div>

                    {/* Phone Field */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="phone" className="text-sm font-semibold text-foreground">
                          رقم الهاتف
                        </Label>
                        <span className="text-xs text-muted-foreground">اختياري</span>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-muted rounded-r-xl flex items-center justify-center border-l border-border">
                          <Phone className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+966 5XX XXX XXXX"
                          className="h-12 pr-14 rounded-xl transition-all"
                          dir="ltr"
                        />
                      </div>
                      
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
                        رقم الهاتف لن يكون مرئياً للآخرين
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Extras / Premium Features Section */}
              {activeTab === 'extras' && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Section Header */}
                  <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-warning flex items-center justify-center shadow-lg shadow-warning/20">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-foreground">إضافات مميزة</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">أضف لمسات مميزة لملفك الشخصي</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                    {/* Banners Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Camera className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">بانرات الملف الشخصي</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">أضف صور بانر لتخصيص ملفك</p>
                          </div>
                        </div>
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">حتى 3 صور</span>
                      </div>
                      
                      <BannersUpload initial={user?.bannerUrls || []} />
                      
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
                        الحجم المثالي: 1200×400 بكسل
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border"></div>

                    {/* Coming Soon Features */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-foreground">ميزات قادمة</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Custom Theme */}
                        <div className="p-4 rounded-xl border-2 border-dashed border-border opacity-60">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground/70">ثيم مخصص</p>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">قريباً</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">اختر ألوان وخطوط خاصة بملفك</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Verified Badge */}
                        <div className="p-4 rounded-xl border-2 border-dashed border-border opacity-60">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground/70">شارة التوثيق</p>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">قريباً</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">احصل على شارة حساب موثق</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phone Preview Sidebar - Desktop Only */}
      <div className="hidden xl:flex">
        <PhoneMockup
          profile={{
            username: formData.username || profile?.username || '',
            displayName: formData.name || '',
            bio: formData.bio || '',
            avatar: profile?.avatar || '',
            isVerified: !!user?.emailVerified,
            socialLinks: [],
          }}
        />
      </div>
    </div>
  );
}
