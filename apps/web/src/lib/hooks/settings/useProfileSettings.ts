"use client";

import { useState, useCallback } from "react";
import { secureFetch } from "@/lib/api/api-client";
import { buildApiPath } from "@/lib/config";
import { getAccessToken } from "@/lib/api/client";

export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  profile: {
    name: string | null;
    username: string | null;
    avatar: string | null;
    bio?: string | null;
    coverImage?: string | null;
  } | null;
}

export function useProfileSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      setError(null);
      const res = await secureFetch(buildApiPath("user/profile"));
      if (!res.ok) throw new Error("فشل في جلب الملف الشخصي");
      return res.json();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
      return null;
    }
  }, []);

  const updateProfile = useCallback(
    async (data: { name?: string; username?: string; phone?: string; bio?: string }): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await secureFetch(buildApiPath("user/profile"), {
          method: "PUT",
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const j = await res.json();
          throw new Error(j.message ?? "فشل في تحديث الملف");
        }
        return true;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "حدث خطأ");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);
      const token = getAccessToken();
      // Use profiles/avatar endpoint which uploads to S3
      const res = await fetch(buildApiPath("profiles/avatar"), {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message ?? "فشل في رفع الصورة");
      }
      const data = (await res.json()) as { avatarUrl?: string; avatar?: string; url?: string };
      // Return the presigned S3 URL
      return data.avatarUrl ?? data.url ?? null;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getProfile, updateProfile, uploadAvatar, isLoading, error, setError };
}
