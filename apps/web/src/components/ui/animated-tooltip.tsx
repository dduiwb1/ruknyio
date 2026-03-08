"use client";
import Image from "next/image";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface TooltipItem {
  id: number | string;
  name: string;
  designation?: string;
  image?: string;
}

export const AnimatedTooltip = ({
  items,
  className,
  size = "md",
  direction = "rtl",
}: {
  items: TooltipItem[];
  className?: string;
  size?: "sm" | "md" | "lg";
  direction?: "ltr" | "rtl";
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | string | null>(null);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // ألوان متنوعة للأعضاء بدون صور
  const avatarColors = [
    "from-blue-400 to-blue-600",
    "from-emerald-400 to-emerald-600",
    "from-violet-400 to-violet-600",
    "from-rose-400 to-rose-600",
    "from-amber-400 to-amber-600",
    "from-cyan-400 to-cyan-600",
  ];

  return (
    <div className={cn("flex items-center", direction === "rtl" ? "flex-row-reverse" : "", className)}>
      {items.map((item, idx) => (
        <div
          className={cn(
            "relative group cursor-pointer",
            direction === "rtl" ? "-ml-2 first:ml-0" : "-mr-2 first:mr-0"
          )}
          key={item.id}
          style={{ zIndex: items.length - idx }}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{ zIndex: 9999 }}
              >
                <div className="relative bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                  <div className="font-medium text-sm text-center">
                    {item.name}
                  </div>
                  {item.designation && (
                    <div className="text-gray-400 text-[10px] text-center">
                      {item.designation}
                    </div>
                  )}
                  {/* السهم */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {item.image ? (
            <motion.div
              whileHover={{ scale: 1.15, zIndex: 50 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <Image
                height={100}
                width={100}
                src={item.image}
                alt={item.name}
                className={cn(
                  "object-cover rounded-full ring-2 ring-white dark:ring-gray-900 shadow-md",
                  sizeClasses[size]
                )}
              />
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.15, zIndex: 50 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={cn(
                "flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900 shadow-md bg-gradient-to-br",
                sizeClasses[size],
                avatarColors[idx % avatarColors.length]
              )}
            >
              <span className="text-xs font-bold text-white drop-shadow-sm">
                {getInitials(item.name)}
              </span>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
};

// مكون بسيط لعرض الأعضاء مع عدد إضافي
export const AnimatedTooltipWithCount = ({
  items,
  maxVisible = 4,
  className,
  size = "md",
  direction = "rtl",
}: {
  items: TooltipItem[];
  maxVisible?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  direction?: "ltr" | "rtl";
}) => {
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  const sizeClasses = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
  };

  return (
    <div className={cn("flex items-center", direction === "rtl" ? "flex-row-reverse" : "", className)}>
      <AnimatedTooltip items={visibleItems} size={size} direction={direction} />
      {remainingCount > 0 && (
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={cn(
            "flex items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-800 text-white font-bold shadow-md cursor-default",
            direction === "rtl" ? "-ml-2" : "-mr-2",
            sizeClasses[size]
          )}
          style={{ zIndex: 0 }}
        >
          +{remainingCount}
        </motion.div>
      )}
    </div>
  );
};
