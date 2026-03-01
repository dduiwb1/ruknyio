import type { ReactNode } from 'react';
import { requireCompleteProfile } from '@/lib/dal';
import { Sidebar } from './components/dashboard-sidebar';
import { DashboardNav } from './components/dashboard-nav';
import { PhonePreview } from '@/components/(app)/shared/PhonePreview';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireCompleteProfile();

  return (
    <div dir="rtl" className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex gap-2 p-2 ps-0">
        {/* Card Container */}
        <div className="flex-1 min-w-0 relative h-full bg-card rounded-4xl border border-border/50 overflow-hidden">
          {/* Floating Nav */}
          <DashboardNav />

          {/* Scrollable content */}
          <main className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="mx-auto w-full max-w-7xl px-4 pt-14 pb-6 sm:px-6">
              {children}
            </div>
          </main>
        </div>

        {/* Phone Preview - outside card container */}
        <div className="hidden xl:block h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <PhonePreview />
        </div>
      </div>
    </div>
  );
}
