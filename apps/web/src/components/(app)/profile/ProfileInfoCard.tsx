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
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">معلومات الحساب</h2>
        <Link 
          href="/profile/edit"
          className="text-sm text-[#4FADC0] hover:text-[#193948] flex items-center gap-0.5"
        >
          تعديل
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Info Items */}
      <div className="divide-y divide-gray-50">
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
      <div className="px-4 py-3 bg-gray-50/50">
        <p className="text-xs text-gray-500 mb-2">حالة الأمان</p>
        <div className="flex flex-wrap gap-2">
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
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5 text-gray-500">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        {badge ? (
          <span className="text-xs p-2 px-2 py-1.5 rounded-full bg-[#FCDC73]/30 text-[#193948] font-medium">
            {value}
          </span>
        ) : (
          <span className="text-sm p-2 text-gray-900">{value}</span>
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
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
      enabled 
        ? 'bg-green-100 text-green-700' 
        : 'bg-gray-100 text-gray-500'
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
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="divide-y divide-gray-50">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="px-6 py-4 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProfileInfoCard;
