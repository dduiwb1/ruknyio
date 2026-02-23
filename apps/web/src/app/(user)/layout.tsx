"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarSkeleton } from '@/components/layout/sidebar';
import { MobileNavigation, MobileNavigationSkeleton } from '@/components/layout/mobile-navigation';

/**
 * Normalize pathname: on app subdomain, usePathname() returns paths without /app prefix
 * (e.g., /settings instead of /app/settings). This function handles both cases.
 */
function matchesAppPath(pathname: string | null, subPath: string): boolean {
  if (!pathname) return false;
  return pathname.startsWith(`/app${subPath}`) || pathname.startsWith(subPath);
}

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't show main sidebar on settings pages, form creation pages, and preview pages (they have their own layout)
  const isSettingsPage = matchesAppPath(pathname, '/settings');
  const isFormCreatePage = matchesAppPath(pathname, '/forms/create');
  const isFormPreviewPage = matchesAppPath(pathname, '/forms/preview');
  const hideSidebar = isSettingsPage || isFormCreatePage || isFormPreviewPage;

  return (
    <div className="flex h-svh overflow-hidden" dir="rtl">
      {!hideSidebar && (
        <div className="hidden md:block">
          {mounted ? <Sidebar /> : <SidebarSkeleton />}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Mobile Navigation - Fixed Bottom */}
      {!hideSidebar && (
        <div className="block md:hidden">
          {mounted ? <MobileNavigation /> : <MobileNavigationSkeleton />}
        </div>
      )}
    </div>
  );
}
