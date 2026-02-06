"use client";

import { cn } from "@/lib/utils";

export type Logo =
  | { alt: string; src: string; width?: number; height?: number }
  | { alt: string; svg: React.ReactNode };

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
  /** مدة دورة كاملة بالثواني */
  duration?: number;
};

function LogoItem({ logo }: { logo: Logo }) {
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
}

export function LogoCloud({
  logos,
  className,
  duration = 20,
  ...props
}: LogoCloudProps) {
  if (!logos?.length) return null;

  // تكرار الشعارات للحصول على حركة سلسة
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "py-8 sm:py-10 md:py-12",
        className
      )}
      dir="ltr"
      {...props}
    >
      {/* الخلفية الناعمة */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/30 to-transparent" />
      
      {/* شريط الشعارات */}
      <div
        className="relative flex w-max items-center"
        style={{
          animation: `logo-marquee ${duration}s linear infinite`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.animationPlayState = "running";
        }}
      >
        {/* المجموعة الأولى */}
        <div className="flex items-center gap-8 sm:gap-12 md:gap-16">
          {duplicatedLogos.map((logo, i) => (
            <LogoItem key={`logo-${i}`} logo={logo} />
          ))}
        </div>
      </div>

      {/* تأثيرات الحواف الضبابية - متماثلة تماماً */}
      <div 
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 md:w-32 lg:w-40"
        style={{
          background: "linear-gradient(to right, rgb(255 255 255) 0%, rgb(255 255 255 / 0.9) 30%, rgb(255 255 255 / 0.5) 60%, transparent 100%)"
        }}
        aria-hidden="true"
      />
      <div 
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 md:w-32 lg:w-40"
        style={{
          background: "linear-gradient(to left, rgb(255 255 255) 0%, rgb(255 255 255 / 0.9) 30%, rgb(255 255 255 / 0.5) 60%, transparent 100%)"
        }}
        aria-hidden="true"
      />
    </div>
  );
}
