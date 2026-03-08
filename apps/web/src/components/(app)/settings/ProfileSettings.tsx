"use client";

import { useState, useEffect, useRef } from "react";
import { User, Loader2, Camera, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileSettings, type UserProfile } from "@/lib/hooks/settings/useProfileSettings";

export function ProfileSettings() {
  const { getProfile, updateProfile, uploadAvatar, isLoading, error, setError } =
    useProfileSettings();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProfile().then((p) => {
      if (cancelled) return;
      setProfile(p ?? null);
      if (p?.profile) {
        setName(p.profile.name ?? "");
        setUsername(p.profile.username ?? "");
        setPhone(p.phone ?? "");
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [getProfile]);

  useEffect(() => {
    if (!profile?.profile) return;
    setName(profile.profile.name ?? "");
    setUsername(profile.profile.username ?? "");
    setPhone(profile.phone ?? "");
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const ok = await updateProfile({ 
      name: name.trim() || undefined, 
      username: username.trim() || undefined,
      phone: phone.trim() || undefined 
    });
    if (ok) {
      setSaved(true);
      const p = await getProfile();
      if (p) setProfile(p);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null);
    setAvatarLoadFailed(false);
    const url = await uploadAvatar(f);
    if (url) {
      const p = await getProfile();
      if (p) setProfile(p);
    }
    e.target.value = "";
  };

  const avatarUrl = profile?.profile?.avatar;
  const displayName = profile?.profile?.name ?? profile?.email ?? "—";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">جاري تحميل الملف الشخصي...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-6 flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">الملف الشخصي</h3>
        </div>

        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative shrink-0">
            {avatarUrl && !avatarLoadFailed ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-border"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground ring-2 ring-border">
                {(profile?.profile?.name ?? profile?.email ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
              className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow transition-colors hover:bg-muted/50 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Camera className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{profile?.email ?? "—"}</p>
            <p className="mt-1 text-xs text-muted-foreground">انقر على الأيقونة لتغيير الصورة</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium text-foreground">
              الاسم
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="أدخل اسمك"
            />
          </div>
          <div>
            <label htmlFor="profile-username" className="mb-1.5 block text-sm font-medium text-foreground">
              اسم المستخدم
            </label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
              <input
                id="profile-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="username"
                dir="ltr"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">يمكن استخدام أحرف إنجليزية صغيرة وأرقام و _</p>
          </div>
          <div>
            <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-medium text-foreground">
              رقم الهاتف
            </label>
            <input
              id="profile-phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="+964..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4" />
              ) : null}
              <span>{saved ? "تم الحفظ" : "حفظ التغييرات"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
