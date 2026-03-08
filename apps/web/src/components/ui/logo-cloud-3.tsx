'use client';

import { cn } from "@/lib/utils";
import React from "react";

type Logo = {
  src?: string;
  alt: string;
  name?: string;
  width?: number;
  height?: number;
  icon?: React.ReactNode;
  nameColor?: string;
};

type LogoCloudProps = React.ComponentProps<"div"> & {
  logos: Logo[];
};

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  if (!logos || logos.length === 0) {
    return null;
  }

  // Render logo item
  const renderLogo = (logo: Logo, index: number, setKey: string) => (
    <div 
      key={`logo-${setKey}-${index}`}
      className="flex items-center gap-3 mx-8 shrink-0"
    >
      <span 
        className="text-base font-bold md:text-lg whitespace-nowrap"
        style={{ color: logo.nameColor || 'var(--foreground)' }}
      >
        {logo.name || logo.alt}
      </span>
      {logo.icon ? (
        <div className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center [&>svg]:h-8 [&>svg]:w-auto md:[&>svg]:h-10">
          {logo.icon}
        </div>
      ) : logo.src ? (
        <img
          alt={logo.alt}
          className="h-8 w-8 object-contain md:h-10 md:w-10"
          height={40}
          src={logo.src}
          width={40}
        />
      ) : null}
    </div>
  );

  return (
    <div
      {...props}
      className={cn(
        "relative overflow-hidden py-6",
        "before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-24 before:bg-gradient-to-r before:from-background before:to-transparent",
        "after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-24 after:bg-gradient-to-l after:from-background after:to-transparent",
        className
      )}
    >
      <div className="logo-scroll-container">
        <div className="logo-scroll-content">
          {logos.map((logo, index) => renderLogo(logo, index, '1'))}
          {logos.map((logo, index) => renderLogo(logo, index, '2'))}
          {logos.map((logo, index) => renderLogo(logo, index, '3'))}
          {logos.map((logo, index) => renderLogo(logo, index, '4'))}
          {logos.map((logo, index) => renderLogo(logo, index, '5'))}
          {logos.map((logo, index) => renderLogo(logo, index, '6'))}
        </div>
      </div>
    </div>
  );
}