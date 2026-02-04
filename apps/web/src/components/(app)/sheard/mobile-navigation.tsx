"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutGrid,
  Calendar,
  FileText,
  Store,
  User,
  Settings,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/providers";
import { buildApiPath } from "@/lib/config";
import { secureFetch } from "@/lib/api/api-client";

interface NavItem {
  id: string;
  title: string;
  icon: LucideIcon;
  href: string;
}

interface Separator {
  type: "separator";
}

type NavTabItem = NavItem | Separator;

const navItems: NavTabItem[] = [
  { id: "dashboard", title: "الرئيسية", icon: LayoutGrid, href: "/app" },
  { id: "forms", title: "النماذج", icon: FileText, href: "/app/forms" },
  { type: "separator" },
  { id: "store", title: "المتجر", icon: Store, href: "/app/store" },
  { id: "settings", title: "الإعدادات", icon: Settings, href: "/app/settings" },
  { id: "profile", title: "حسابي", icon: User, href: "/app/profile" },
];

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".75rem",
    paddingRight: ".75rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".75rem",
    paddingRight: isSelected ? "1rem" : ".75rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.05, type: "spring" as const, bounce: 0, duration: 0.5 };

export function MobileNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = React.useState(0);

  // Fetch notification count
  React.useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await secureFetch(buildApiPath("/notifications/unread-count"));
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.unreadCount ?? 0);
        }
      } catch {
        /* ignore */
      }
    };
    if (user) {
      fetchNotificationCount();
      const t = setInterval(fetchNotificationCount, 5 * 60 * 1000);
      return () => clearInterval(t);
    }
  }, [user]);

  // Check if item is active
  const isActive = (item: NavItem): boolean => {
    if (item.href === "/app") {
      return pathname === "/app" || pathname === "/app/analytics";
    }
    return pathname?.startsWith(item.href) ?? false;
  };

  const handleClick = (href: string) => {
    router.push(href);
  };

  const TabSeparator = () => (
    <div className="mx-1 h-6 w-px bg-border/60" aria-hidden="true" />
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" dir="rtl">
      <div className="flex justify-center px-4 pb-5">
        <nav className="flex items-center gap-1 rounded-2xl border border-border/40 bg-card p-1.5 shadow-xl">
          {navItems.map((item, index) => {
            if ("type" in item && item.type === "separator") {
              return <TabSeparator key={`separator-${index}`} />;
            }

            const navItem = item as NavItem;
            const active = isActive(navItem);
            const Icon = navItem.icon;

            return (
              <motion.button
                key={navItem.id}
                variants={buttonVariants}
                initial={false}
                animate="animate"
                custom={active}
                onClick={() => handleClick(navItem.href)}
                transition={transition}
                className={cn(
                  "relative flex items-center rounded-xl py-3 text-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={22} strokeWidth={active ? 2 : 1.5} />
                
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.span
                      variants={spanVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={transition}
                      className="overflow-hidden whitespace-nowrap font-semibold"
                    >
                      {navItem.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function MobileNavigationSkeleton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex justify-center px-4 pb-5">
        <nav className="flex items-center gap-1 rounded-2xl border border-border/40 bg-card p-1.5 shadow-xl animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center px-3 py-3">
              <div className="size-6 rounded-lg bg-muted" />
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
