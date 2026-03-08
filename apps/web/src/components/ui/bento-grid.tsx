"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface BentoCardProps {
  name: string;
  className?: string;
  background?: ReactNode;
  Icon: LucideIcon;
  description: string;
  href: string;
  cta: string;
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
        "bg-card/50 backdrop-blur-sm",
        "border border-border/50",
        "transform-gpu transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30",
        className
      )}
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {background}
      </div>

      {/* Content */}
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2">
        <Icon className="h-10 w-10 origin-left transform-gpu text-primary transition-all duration-300 ease-in-out group-hover:scale-75" />
        <h3 className="text-xl font-semibold text-foreground">
          {name}
        </h3>
        <p className="max-w-lg text-muted-foreground text-sm">
          {description}
        </p>
      </div>

      {/* CTA */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        )}
      >
        <Link
          href={href}
          className="pointer-events-auto inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          {cta}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>

      {/* Border gradient on hover */}
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-primary/[0.03]" />
    </div>
  );
}
