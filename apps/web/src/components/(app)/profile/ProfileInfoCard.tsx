'use client';

import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  ChevronLeft
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserData, ProfileData } from '@/lib/types/profile';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

interface ProfileInfoCardProps {
  user: UserData | null;
  profile: ProfileData | null;
  isLoading: boolean;
}

export function ProfileInfoCard({ user, profile, isLoading }: ProfileInfoCardProps) {
  if (isLoading) {
    return <ProfileInfoSkeleton />;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: ar });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-xl border border-border/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border/50 flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-sm">معلومات الحساب</h2>
        <Link 
          href="/profile/edit"
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
        >
          تعديل
          <ChevronLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Info Items */}
      <div className="divide-y divide-border/30">
        <InfoRow 
          icon={Mail} 
          label="البريد الإلكتروني" 
          value={user?.email || '-'}
          verified={user?.emailVerified}
        />
        <InfoRow 
          icon={Phone} 
          label="الهاتف" 
          value={user?.phone || 'غير مضاف'}
        />
        <InfoRow 
          icon={Calendar} 
          label="تاريخ الانضمام" 
          value={formatDate(user?.createdAt)}
        />
        <InfoRow 
          icon={Shield} 
          label="نوع الحساب" 
          value={getRoleLabel(user?.role || 'BASIC')}
          badge
        />
      </div>

      {/* Security Status */}
      <div className="px-4 py-2.5 bg-muted/30">
        <p className="text-xs text-muted-foreground mb-1.5">حالة الأمان</p>
        <div className="flex flex-wrap gap-1.5">
          <SecurityBadge label="2FA" enabled={user?.twoFactorEnabled} />
          <SecurityBadge label="البريد" enabled={user?.emailVerified} />
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ 
  icon: Icon, 
  label, 
  value, 
  verified,
  badge 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string;
  verified?: boolean;
  badge?: boolean;
}) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {badge ? (
          <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            {value}
          </span>
        ) : (
          <span className="text-xs text-foreground">{value}</span>
        )}
        {verified !== undefined && (
          verified ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-gray-300" />
          )
        )}
      </div>
    </div>
  );
}

function SecurityBadge({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
      enabled 
        ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
        : 'bg-muted text-muted-foreground'
    }`}>
      {enabled ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function getRoleLabel(role: string): string {
  const roles: Record<string, string> = {
    ADMIN: 'مدير',
    PREMIUM: 'مميز',
    BASIC: 'أساسي',
    GUEST: 'ضيف',
  };
  return roles[role] || role;
}

function ProfileInfoSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border/50">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="divide-y divide-border/30">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="px-4 py-2.5 flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfileInfoCard;
