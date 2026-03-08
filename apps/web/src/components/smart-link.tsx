'use client';

/**
 * 🔗 Smart Link Component
 * 
 * A Next.js Link wrapper that intelligently prefetches routes
 * based on network conditions and user interactions.
 */

import Link, { LinkProps } from 'next/link';
import { forwardRef, type ReactNode, type MouseEvent, type FocusEvent } from 'react';
import { usePrefetchRoute } from '@/lib/hooks/use-prefetch';

interface SmartLinkProps extends Omit<LinkProps, 'prefetch'> {
  children: ReactNode;
  className?: string;
  /** Prefetch strategy: 'hover' (default), 'visible', 'immediate', 'none' */
  prefetchStrategy?: 'hover' | 'visible' | 'immediate' | 'none';
  /** Additional delay before prefetching */
  prefetchDelay?: number;
  /** onClick handler */
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  /** onFocus handler */
  onFocus?: (e: FocusEvent<HTMLAnchorElement>) => void;
  /** onBlur handler */
  onBlur?: (e: FocusEvent<HTMLAnchorElement>) => void;
  /** onMouseEnter handler */
  onMouseEnter?: (e: MouseEvent<HTMLAnchorElement>) => void;
  /** onMouseLeave handler */
  onMouseLeave?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  function SmartLink(
    {
      href,
      children,
      className,
      prefetchStrategy = 'hover',
      prefetchDelay,
      onClick,
      onFocus,
      onBlur,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) {
    const hrefString = typeof href === 'string' ? href : href.pathname || '/';

    const {
      onMouseEnter: prefetchOnEnter,
      onMouseLeave: prefetchOnLeave,
      onFocus: prefetchOnFocus,
      onBlur: prefetchOnBlur,
    } = usePrefetchRoute(hrefString, {
      onHover: prefetchStrategy === 'hover',
      delay: prefetchDelay,
    });

    const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
      prefetchOnEnter?.();
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: MouseEvent<HTMLAnchorElement>) => {
      prefetchOnLeave?.();
      onMouseLeave?.(e);
    };

    const handleFocus = (e: FocusEvent<HTMLAnchorElement>) => {
      prefetchOnFocus?.();
      onFocus?.(e);
    };

    const handleBlur = (e: FocusEvent<HTMLAnchorElement>) => {
      prefetchOnBlur?.();
      onBlur?.(e);
    };

    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        prefetch={prefetchStrategy === 'immediate'}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

export default SmartLink;
