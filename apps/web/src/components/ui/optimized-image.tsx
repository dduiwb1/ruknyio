'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  /** Show blur placeholder while loading */
  showBlur?: boolean;
  /** Custom placeholder color/gradient */
  placeholderColor?: string;
  /** Fallback image URL if loading fails */
  fallbackSrc?: string;
  /** Container className for aspect ratio wrapper */
  containerClassName?: string;
  /** Enable fade-in animation on load */
  fadeIn?: boolean;
}

/**
 * OptimizedImage - A performance-optimized Image component
 * 
 * Features:
 * - Automatic lazy loading with Intersection Observer
 * - Blur placeholder while loading
 * - Graceful error handling with fallback
 * - Fade-in animation on load
 * - Skeleton placeholder
 * 
 * @example
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   width={400}
 *   height={300}
 *   fadeIn
 *   showBlur
 * />
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  function OptimizedImage(
    {
      src,
      alt,
      className,
      containerClassName,
      showBlur = true,
      placeholderColor = 'bg-gray-200 dark:bg-gray-700',
      fallbackSrc = '/images/placeholder.png',
      fadeIn = true,
      priority = false,
      ...props
    },
    ref
  ) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
      setHasError(true);
      setIsLoading(false);
    }, []);

    const imageSrc = hasError ? fallbackSrc : src;

    return (
      <div className={cn('relative overflow-hidden', containerClassName)}>
        {/* Placeholder/Skeleton */}
        {isLoading && showBlur && (
          <div
            className={cn(
              'absolute inset-0 animate-pulse',
              placeholderColor
            )}
            aria-hidden="true"
          />
        )}

        <Image
          ref={ref}
          src={imageSrc}
          alt={alt}
          className={cn(
            className,
            fadeIn && 'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </div>
    );
  }
);

/**
 * Avatar with optimization
 */
interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fallback?: string;
  className?: string;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  '2xl': 96,
};

export function AvatarImage({
  src,
  alt,
  size = 'md',
  fallback,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);
  const dimension = sizeMap[size];

  // Generate initials from alt text
  const initials = alt
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold',
          className
        )}
        style={{ width: dimension, height: dimension }}
      >
        <span style={{ fontSize: dimension * 0.4 }}>{fallback || initials}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className={cn('rounded-full object-cover', className)}
      onError={() => setHasError(true)}
    />
  );
}

/**
 * Background Image with lazy loading
 */
interface BackgroundImageProps {
  src: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayClassName?: string;
}

export function BackgroundImage({
  src,
  alt = '',
  className,
  children,
  overlay = false,
  overlayClassName,
}: BackgroundImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Background Image */}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-opacity duration-500',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        sizes="100vw"
      />

      {/* Overlay */}
      {overlay && (
        <div
          className={cn(
            'absolute inset-0 bg-black/40',
            overlayClassName
          )}
        />
      )}

      {/* Content */}
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}

/**
 * Product/Card Image with aspect ratio
 */
interface CardImageProps {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide';
  className?: string;
  priority?: boolean;
}

const aspectRatioMap = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[2/1]',
};

export function CardImage({
  src,
  alt,
  aspectRatio = 'square',
  className,
  priority = false,
}: CardImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gray-100 dark:bg-gray-800',
        aspectRatioMap[aspectRatio],
        className
      )}
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className={cn(
            'object-cover transition-all duration-300',
            isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      )}
    </div>
  );
}

/**
 * Gallery Image with lightbox support placeholder
 */
interface GalleryImageProps {
  src: string;
  alt: string;
  thumbnail?: string;
  onClick?: () => void;
  className?: string;
}

export function GalleryImage({
  src,
  alt,
  thumbnail,
  onClick,
  className,
}: GalleryImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-lg group cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}

      <Image
        src={thumbnail || src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-all duration-300 group-hover:scale-105',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={() => setIsLoading(false)}
        sizes="(max-width: 640px) 50vw, 25vw"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

      {/* Zoom icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2">
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </div>
      </div>
    </button>
  );
}

export default OptimizedImage;
