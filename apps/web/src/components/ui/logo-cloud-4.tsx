"use client";

import { cn } from "@/lib/utils";
import { useMemo, useCallback, useRef, memo } from "react";

export type Logo =
  | { alt: string; src: string; width?: number; height?: number }
  | { alt: string; svg: React.ReactNode };

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
  /** مدة دورة كاملة بالثواني */
  duration?: number;
};

const LogoItem = memo(function LogoItem({ logo }: { logo: Logo }) {
  const baseClass = "h-6 w-auto max-w-[100px] sm:h-7 sm:max-w-[120px] md:h-8 md:max-w-[140px] object-contain";
  const effectClass = "opacity-50 grayscale transition-all duration-300 ease-out group-hover:opacity-100 group-hover:grayscale-0";
  
  return (
    <div
      className="group flex items-center justify-center px-4 sm:px-6 md:px-8"
      role="img"
      aria-label={logo.alt}
    >
      <div className="relative flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-110">
        {"svg" in logo && logo.svg !== undefined ? (
          <span className={cn(baseClass, effectClass, "flex items-center [&_svg]:h-full [&_svg]:w-auto")}>
            {logo.svg}
          </span>
        ) : "src" in logo ? (
          <img
            alt={logo.alt}
            className={cn(baseClass, effectClass, "select-none")}
            decoding="async"
            loading="lazy"
            src={logo.src}
            width={"width" in logo ? logo.width : undefined}
            height={"height" in logo ? logo.height : undefined}
          />
        ) : null}
      </div>
    </div>
  );
});

export function LogoCloud({
  logos,
  className,
  duration = 20,
  ...props
}: LogoCloudProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  // Memoize duplicated logos to prevent recreation on every render
  const duplicatedLogos = useMemo(() => [...logos, ...logos], [logos]);
  
  // Stable event handlers
  const handleMouseEnter = useCallback(() => {
    if (marqueeRef.current) {
      marqueeRef.current.style.animationPlayState = "paused";
    }
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    if (marqueeRef.current) {
      marqueeRef.current.style.animationPlayState = "running";
    }
  }, []);

  if (!logos?.length) return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        className
      )}
      dir="ltr"
      {...props}
    >
      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes logo-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
      
      {/* شريط الشعارات */}
      <div
        ref={marqueeRef}
        className="relative flex w-max items-center"
        style={{
          animation: `logo-marquee ${duration}s linear infinite`,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* المجموعة الأولى */}
        <div className="flex items-center gap-8 sm:gap-12 md:gap-16">
          {duplicatedLogos.map((logo, i) => (
            <LogoItem key={`logo-${i}`} logo={logo} />
          ))}
        </div>
      </div>

      {/* تأثيرات الحواف الضبابية - تستخدم CSS variables للتوافق مع الوضع الداكن */}
      <div 
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-r from-background via-background/80 to-transparent"
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 md:w-32 lg:w-40 bg-gradient-to-l from-background via-background/80 to-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
