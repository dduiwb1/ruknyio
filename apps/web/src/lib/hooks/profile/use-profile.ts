'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getAccessToken } from '@/lib/api/client';
import { USER_DATA_CACHE, LIST_CACHE } from '@/lib/query/cache-config';
import type { 
  UserData, 
  ProfileData, 
  SocialLink, 
  LinkGroup, 
  Address,
  CreateAddressData 
} from '@/lib/types/profile';

// Re-export types for convenience
export type { UserData, ProfileData, SocialLink, LinkGroup, Address, CreateAddressData };

// =============================================================================
// Query Keys (using centralized keys)
// =============================================================================

const profileQueryKeys = {
  user: ['profile', 'user'] as const,
  profile: ['profile', 'data'] as const,
  socialLinks: ['profile', 'social-links'] as const,
  linkGroups: ['profile', 'link-groups'] as const,
  addresses: ['profile', 'addresses'] as const,
  all: ['profile'] as const,
};

// =============================================================================
// API Functions
// =============================================================================

const profileApi = {
  // User
  fetchUser: async (): Promise<UserData> => {
    const response = await api.get<UserData>('/auth/me');
    return response.data;
  },
  
  updateUser: async (data: Partial<UserData>): Promise<UserData> => {
    const response = await api.put<{ data: UserData }>('/user/me', data);
    return response.data.data;
  },

  // Profile
  fetchProfile: async (): Promise<ProfileData | null> => {
    try {
      const response = await api.get<ProfileData>('/profiles/me');
      return response.data;
    } catch (err: any) {
      if (err.status === 404) return null;
      throw err;
    }
  },
  
  createProfile: async (data: { username: string; name?: string; bio?: string; visibility?: 'PUBLIC' | 'PRIVATE' }): Promise<ProfileData> => {
    const response = await api.post<{ data: ProfileData }>('/profiles', data);
    return response.data.data;
  },
  
  updateProfile: async (data: Partial<ProfileData>): Promise<ProfileData> => {
    const response = await api.put<{ data: ProfileData }>('/profiles', data);
    return response.data.data;
  },

  // Social Links
  fetchSocialLinks: async (): Promise<SocialLink[]> => {
    try {
      const response = await api.get<SocialLink[]>('/social-links/my-links');
      return response.data || [];
    } catch {
      return [];
    }
  },

  // Link Groups
  fetchLinkGroups: async (): Promise<LinkGroup[]> => {
    try {
      const response = await api.get<LinkGroup[]>('/link-groups');
      return response.data || [];
    } catch {
      return [];
    }
  },

  // Addresses
  fetchAddresses: async (): Promise<Address[]> => {
    try {
      const response = await api.get<{ addresses: Address[]; count: number }>('/addresses');
      return response.data.addresses || [];
    } catch {
      return [];
    }
  },
  
  createAddress: async (data: CreateAddressData): Promise<Address> => {
    const response = await api.post<{ data: Address }>('/addresses', data);
    return response.data.data;
  },
  
  updateAddress: async ({ id, data }: { id: string; data: Partial<Address> }): Promise<Address> => {
    const response = await api.put<{ data: Address }>(`/addresses/${id}`, data);
    return response.data.data;
  },
  
  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  },

  // Avatar & Cover
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch('/api/v1/profiles/avatar', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) throw new Error('فشل في رفع الصورة');
    const result = await response.json();
    return result.avatar || result.data?.avatar;
  },
  
  uploadCover: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('cover', file);
    
    const response = await fetch('/api/v1/profiles/cover', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: formData,
    });
    
    if (!response.ok) throw new Error('فشل في رفع صورة الغلاف');
    const result = await response.json();
    return result.coverImage || result.data?.coverImage;
  },

  // Username check
  checkUsername: async (username: string): Promise<{ available: boolean; suggestions?: string[] }> => {
    const response = await api.get<{ available: boolean; suggestions?: string[] }>(`/profiles/check-username/${username}`);
    return response.data;
  },
};

// =============================================================================
// Main Hook - Uses React Query for caching & deduplication
// =============================================================================

export function useProfile() {
  const queryClient = useQueryClient();

  // ⚡ Queries - All deduplicated and cached automatically
  const userQuery = useQuery({
    queryKey: profileQueryKeys.user,
    queryFn: profileApi.fetchUser,
    staleTime: USER_DATA_CACHE.staleTime,
    gcTime: USER_DATA_CACHE.gcTime,
  });

  const profileQuery = useQuery({
    queryKey: profileQueryKeys.profile,
    queryFn: profileApi.fetchProfile,
    staleTime: USER_DATA_CACHE.staleTime,
    gcTime: USER_DATA_CACHE.gcTime,
  });

  const socialLinksQuery = useQuery({
    queryKey: profileQueryKeys.socialLinks,
    queryFn: profileApi.fetchSocialLinks,
    staleTime: LIST_CACHE.staleTime,
    gcTime: LIST_CACHE.gcTime,
  });

  const linkGroupsQuery = useQuery({
    queryKey: profileQueryKeys.linkGroups,
    queryFn: profileApi.fetchLinkGroups,
    staleTime: LIST_CACHE.staleTime,
    gcTime: LIST_CACHE.gcTime,
  });

  const addressesQuery = useQuery({
    queryKey: profileQueryKeys.addresses,
    queryFn: profileApi.fetchAddresses,
    staleTime: LIST_CACHE.staleTime,
    gcTime: LIST_CACHE.gcTime,
  });

  // ⚡ Mutations with automatic cache invalidation
  const updateUserMutation = useMutation({
    mutationFn: profileApi.updateUser,
    onSuccess: (data) => {
      queryClient.setQueryData(profileQueryKeys.user, data);
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: profileApi.createProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileQueryKeys.profile, data);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(profileQueryKeys.profile, data);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: profileApi.uploadAvatar,
    onSuccess: (avatar) => {
      // Update profile with new avatar
      queryClient.setQueryData(profileQueryKeys.profile, (old: ProfileData | null) => 
        old ? { ...old, avatar } : old
      );
    },
  });

  const uploadCoverMutation = useMutation({
    mutationFn: profileApi.uploadCover,
    onSuccess: (coverImage) => {
      queryClient.setQueryData(profileQueryKeys.profile, (old: ProfileData | null) => 
        old ? { ...old, coverImage } : old
      );
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: profileApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.addresses });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: profileApi.updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.addresses });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: profileApi.deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.addresses });
    },
  });

  // Combined loading state
  const isLoading = userQuery.isLoading || profileQuery.isLoading || 
                    socialLinksQuery.isLoading || linkGroupsQuery.isLoading || 
                    addressesQuery.isLoading;

  const isUpdating = updateUserMutation.isPending || createProfileMutation.isPending || 
                     updateProfileMutation.isPending || uploadAvatarMutation.isPending ||
                     uploadCoverMutation.isPending || createAddressMutation.isPending ||
                     updateAddressMutation.isPending || deleteAddressMutation.isPending;

  const error = userQuery.error?.message || profileQuery.error?.message || null;

  // Refetch all data
  const fetchAllData = () => {
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.all });
  };

  return {
    // Data
    user: userQuery.data ?? null,
    profile: profileQuery.data ?? null,
    socialLinks: socialLinksQuery.data ?? [],
    linkGroups: linkGroupsQuery.data ?? [],
    addresses: addressesQuery.data ?? [],
    stats: null, // TODO: Add stats query if needed

    // State
    isLoading,
    isUpdating,
    error,
    hasProfile: !!profileQuery.data,

    // Actions (wrapped for backward compatibility)
    fetchAllData,
    fetchUser: () => queryClient.invalidateQueries({ queryKey: profileQueryKeys.user }),
    fetchProfile: () => queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile }),
    fetchSocialLinks: () => queryClient.invalidateQueries({ queryKey: profileQueryKeys.socialLinks }),
    fetchLinkGroups: () => queryClient.invalidateQueries({ queryKey: profileQueryKeys.linkGroups }),
    fetchAddresses: () => queryClient.invalidateQueries({ queryKey: profileQueryKeys.addresses }),
    
    updateUser: updateUserMutation.mutateAsync,
    createProfile: createProfileMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    uploadCover: uploadCoverMutation.mutateAsync,
    checkUsername: profileApi.checkUsername,
    createAddress: createAddressMutation.mutateAsync,
    updateAddress: (id: string, data: Partial<Address>) => updateAddressMutation.mutateAsync({ id, data }),
    deleteAddress: deleteAddressMutation.mutateAsync,
  };
}

export default useProfile;
