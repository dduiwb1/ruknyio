'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield,
  Smartphone,
  MonitorSmartphone,
  ScrollText,
  Ban,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TwoFactorAuth } from './TwoFactorAuth';
import { SessionsManager } from './SessionsManager';
import { TrustedDevices } from './TrustedDevices';
import { SecurityLogs } from './SecurityLogs';
import { useSecuritySettings } from '@/lib/hooks/settings/useSecuritySettings';

type SecurityTab = '2fa' | 'sessions' | 'devices' | 'logs' ;

interface TabConfig {
  id: SecurityTab;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const tabs: TabConfig[] = [
  {
    id: '2fa',
    label: 'المصادقة الثنائية',
    description: 'إضافة طبقة حماية إضافية',
    icon: Shield,
    color: 'success'
  },
  {
    id: 'sessions',
    label: 'الجلسات النشطة',
    description: 'إدارة تسجيلات الدخول',
    icon: MonitorSmartphone,
    color: 'info'
  },
  {
    id: 'devices',
    label: 'الأجهزة الموثوقة',
    description: 'إدارة أجهزتك المعروفة',
    icon: Smartphone,
    color: 'primary'
  },
  {
    id: 'logs',
    label: 'سجل الأمان',
    description: 'عرض سجل النشاط الأمني',
    icon: ScrollText,
    color: 'warning'
  }
];

const colorClasses = {
  success: {
    bg: 'bg-success/10',
    text: 'text-success',
    hover: 'hover:bg-success/5',
    active: 'bg-success/10 border-success'
  },
  info: {
    bg: 'bg-info/10',
    text: 'text-info',
    hover: 'hover:bg-info/5',
    active: 'bg-info/10 border-info'
  },
  primary: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    hover: 'hover:bg-primary/5',
    active: 'bg-primary/10 border-primary'
  },
  warning: {
    bg: 'bg-warning/20',
    text: 'text-warning-filled',
    hover: 'hover:bg-warning/10',
    active: 'bg-warning/15 border-warning'
  },
  destructive: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    hover: 'hover:bg-destructive/5',
    active: 'bg-destructive/10 border-destructive'
  }
};

export function SecuritySettings() {
  const [activeTab, setActiveTab] = useState<SecurityTab>('2fa');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { getUserProfile } = useSecuritySettings();

  // Fetch 2FA status on mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      const profile = await getUserProfile();
      if (profile?.twoFactorEnabled !== undefined) {
        setIs2FAEnabled(profile.twoFactorEnabled);
      }
    };
    fetch2FAStatus();
  }, [getUserProfile]);

  // Refresh 2FA status
  const refresh2FAStatus = useCallback(async () => {
    const profile = await getUserProfile();
    if (profile?.twoFactorEnabled !== undefined) {
      setIs2FAEnabled(profile.twoFactorEnabled);
    }
  }, [getUserProfile]);

  const renderContent = () => {
    switch (activeTab) {
      case '2fa':
        return <TwoFactorAuth isEnabled={is2FAEnabled} onStatusChange={refresh2FAStatus} />;
      case 'sessions':
        return <SessionsManager />;
      case 'devices':
        return <TrustedDevices />;
      case 'logs':
        return <SecurityLogs />;
      default:
        return null;
    }
  };

  const activeTabConfig = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Mobile Tab Selector */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm"
        >
          <ChevronLeft className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            isMobileNavOpen && "rotate-90"
          )} />
          <div className="flex items-center gap-3">
            <span className="text-base font-medium text-foreground">{activeTabConfig.label}</span>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              colorClasses[activeTabConfig.color as keyof typeof colorClasses].bg
            )}>
              <activeTabConfig.icon className={cn(
                "w-5 h-5",
                colorClasses[activeTabConfig.color as keyof typeof colorClasses].text
              )} />
            </div>
          </div>
        </button>

        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 text-right transition-colors border-r-4",
                    activeTab === tab.id
                      ? colorClasses[tab.color as keyof typeof colorClasses].active
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    colorClasses[tab.color as keyof typeof colorClasses].bg
                  )}>
                    <tab.icon className={cn(
                      "w-5 h-5",
                      colorClasses[tab.color as keyof typeof colorClasses].text
                    )} />
                  </div>
                  <div className="flex-1 text-right">
                    <span className="text-base font-medium text-foreground block">{tab.label}</span>
                    <span className="text-sm text-muted-foreground">{tab.description}</span>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-6">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block w-72 shrink-0">
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden sticky top-24">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-bold text-foreground text-right">إعدادات الأمان</h2>
              <p className="text-sm text-muted-foreground mt-1 text-right">
                إدارة حماية حسابك
              </p>
            </div>

            <div className="p-2">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ x: -4 }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors border-r-4 mb-1",
                    activeTab === tab.id
                      ? colorClasses[tab.color as keyof typeof colorClasses].active
                      : "border-transparent hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    colorClasses[tab.color as keyof typeof colorClasses].bg
                  )}>
                    <tab.icon className={cn(
                      "w-5 h-5",
                      colorClasses[tab.color as keyof typeof colorClasses].text
                    )} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <span className={cn(
                      "font-medium block",
                      activeTab === tab.id ? "text-foreground" : "text-foreground/80"
                    )}>
                      {tab.label}
                    </span>
                    <span className="text-sm text-muted-foreground truncate block">
                      {tab.description}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
