"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { getAuthUrl } from '@/lib/url';
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
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated, isRateLimited } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔐 Centralized auth guard — protects ALL (user) routes
  // ⚠️ Do NOT redirect when rate limited (429) - auth state is unknown
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !isRateLimited) {
      const loginUrl = getAuthUrl('/login');
      window.location.replace(loginUrl);
    }
  }, [authLoading, isAuthenticated, isRateLimited]);
  
  // 🔐 Show loading spinner while checking auth or rate limited
  if (authLoading || (!isAuthenticated && !isRateLimited)) {
    return (
      <div className="flex h-svh items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
      </div>
    );
  }

  // Don't show main sidebar on settings pages, form creation pages, preview pages, and store creation wizards (they have their own layout)
  const isSettingsPage = matchesAppPath(pathname, '/settings');
  const isFormCreatePage = matchesAppPath(pathname, '/forms/create');
  const isFormPreviewPage = matchesAppPath(pathname, '/forms/preview');
  const isStoreCreatePage = matchesAppPath(pathname, '/store/products/new') || matchesAppPath(pathname, '/store/categories/new');
  const hideSidebar = isSettingsPage || isFormCreatePage || isFormPreviewPage || isStoreCreatePage;

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
