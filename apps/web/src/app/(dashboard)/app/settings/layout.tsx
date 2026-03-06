'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePhonePreview } from '@/components/(app)/shared/phone-preview-context';
import { SettingsSidebarSlider } from '@/components/(app)/settings/SettingsSidebar';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { collapsed } = usePhonePreview();

  return (
    <div className={cn(
      'flex gap-4 min-h-[calc(100vh-5rem)]',
      collapsed && 'max-w-7xl'
    )}>
      {/* Main Content */}
      <div className="flex-1 min-w-0 pb-6 lg:pb-0">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>

      {/* Mobile Slider */}
      <SettingsSidebarSlider />
    </div>
  );
}
