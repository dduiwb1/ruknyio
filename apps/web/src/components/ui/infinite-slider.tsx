'use client';
import { cn } from '@/lib/utils';
import { useMotionValue, animate, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import useMeasure from 'react-use-measure';

type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  /** Alias for duration (seconds per loop). When set, overrides duration. */
  speed?: number;
  /** Alias for durationOnHover (seconds when hovering). When set, overrides durationOnHover. */
  speedOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children,
  gap = 16,
  duration = 25,
  durationOnHover,
  speed,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const resolvedDuration = speed ?? duration;
  const resolvedDurationOnHover = speedOnHover ?? durationOnHover;
  const [currentDuration, setCurrentDuration] = useState(resolvedDuration);
  const [ref, { width, height }] = useMeasure({ scroll: false });
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [key, setKey] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setCurrentDuration(resolvedDuration);
  }, [resolvedDuration]);

  useEffect(() => {
    const size = direction === 'horizontal' ? width : height;
    if (size <= 0) return;

    // 3 نسخ من المحتوى: عرض نسخة واحدة = (الحجم الكلي - فجوتان) / 3
    const oneCopySize = Math.max((size - 2 * gap) / 3, 1);
    const from = reverse ? -oneCopySize : 0;
    const to = reverse ? 0 : -oneCopySize;

    let controls: { stop: () => void } | undefined;

    if (isTransitioning) {
      const current = translation.get();
      const distance = Math.abs(current - to);
      const durationSec = currentDuration * (distance / oneCopySize);
      controls = animate(translation, [current, to], {
        ease: 'linear',
        duration: durationSec,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((k) => k + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: 'linear',
        duration: currentDuration,
        onComplete: () => {
          // إعادة فورية ثم تشغيل الدورة التالية في الإطار التالي
          rafRef.current = requestAnimationFrame(() => {
            translation.set(from);
            setKey((k) => k + 1);
          });
        },
      });
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      controls?.stop();
    };
  }, [
    key,
    width,
    height,
    gap,
    currentDuration,
    isTransitioning,
    direction,
    reverse,
  ]);

  const hoverProps = resolvedDurationOnHover != null
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentDuration(resolvedDurationOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentDuration(resolvedDuration);
        },
      }
    : {};

  return (
    <div className={cn('overflow-hidden', className)}>
      <motion.div
        className="flex w-max shrink-0"
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}
