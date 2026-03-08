/**
 * ============================================
 * Profile Hooks - Barrel Export
 * ============================================
 * Hooks related to user profile and social links management
 */

export { useProfile } from './use-profile';
export { useSocialLinks } from './use-social-links';

// Re-export types
export type {
  UserData,
  ProfileData,
  SocialLink,
  LinkGroup,
  Address,
  CreateAddressData,
} from './use-profile';
