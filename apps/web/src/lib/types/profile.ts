// =============================================================================
// Profile Types - Centralized type definitions
// =============================================================================

export interface UserData {
  id: string;
  email: string;
  role: 'ADMIN' | 'PREMIUM' | 'BASIC' | 'GUEST';
  emailVerified: boolean;
  phone?: string;
  twoFactorEnabled: boolean;
  googleCalendarLinked: boolean;
  telegramEnabled: boolean;
  telegramUsername?: string;
  profileCompleted: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  bannerUrls?: string[];
}

export interface ProfileData {
  id: string;
  userId: string;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  views?: number;
  createdAt: string;
  updatedAt: string;
  socialLinks?: SocialLink[];
  linkGroups?: LinkGroup[];
}

export interface SocialLink {
  id: string;
  profileId: string;
  platform: string;
  username?: string;
  url: string;
  shortUrl?: string;
  displayOrder: number;
  title?: string;
  status: 'active' | 'hidden';
  views: number;
  groupId?: string;
  isPinned: boolean;
  isPopular: boolean;
  totalClicks: number;
  layout: 'classic' | 'featured';
  thumbnail?: string;
}

export interface LinkGroup {
  id: string;
  profileId: string;
  name: string;
  nameAr?: string;
  color: string;
  icon?: string;
  order: number;
  isExpanded: boolean;
  links?: SocialLink[];
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phoneNumber: string;
  country: string;
  city: string;
  district?: string;
  street: string;
  buildingNo?: string;
  floor?: string;
  apartmentNo?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

// Type for creating new address (without id and userId)
export type CreateAddressData = Omit<Address, 'id' | 'userId'>;

export interface ProfileStats {
  totalViews: number;
  totalClicks: number;
  totalLinks: number;
  activeLinks: number;
}
