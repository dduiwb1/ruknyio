/**
 * Avatar & Cover URL utilities
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';

/**
 * Resolve avatar path to full URL
 */
export function getAvatarUrl(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  if (avatar.startsWith('users/') || avatar.startsWith('profiles/')) {
    return `${API_BASE_URL}/api/${avatar}`;
  }
  const filename = avatar.split('/').pop() || avatar;
  return `${API_BASE_URL}/uploads/avatars/${filename}`;
}

/**
 * Resolve cover image path to full URL
 */
export function getCoverUrl(cover?: string | null): string | null {
  if (!cover) return null;
  if (cover.startsWith('http')) return cover;
  if (cover.startsWith('users/') || cover.startsWith('profiles/') || cover.startsWith('covers/')) {
    return `${API_BASE_URL}/api/${cover}`;
  }
  const filename = cover.split('/').pop() || cover;
  return `${API_BASE_URL}/uploads/covers/${filename}`;
}

/**
 * Resolve thumbnail path to full URL
 */
export function getThumbnailUrl(thumbnail?: string | null): string | null {
  if (!thumbnail) return null;
  if (thumbnail.startsWith('http')) return thumbnail;
  if (thumbnail.startsWith('users/') || thumbnail.startsWith('profiles/') || thumbnail.startsWith('thumbnails/')) {
    return `${API_BASE_URL}/api/${thumbnail}`;
  }
  const filename = thumbnail.split('/').pop() || thumbnail;
  return `${API_BASE_URL}/uploads/thumbnails/${filename}`;
}

/**
 * Get initials from a name string (max 2 chars)
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
