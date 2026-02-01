'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  Trash2,
  Loader2,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  Clock,
  Check,
  CheckSquare,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSecuritySettings, SecurityLog } from '@/lib/hooks/settings/useSecuritySettings';
import { format, formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ACTION_LABELS: Record<string, string> = {
  'LOGIN_SUCCESS': 'تسجيل دخول',
  'LOGIN_FAILED': 'دخول فاشل',
  'LOGOUT': 'تسجيل خروج',
  'PROFILE_UPDATE': 'تحديث الملف',
  'PASSWORD_CHANGE': 'تغيير كلمة المرور',
  'EMAIL_CHANGE': 'تغيير البريد',
  'TWO_FA_ENABLED': 'تفعيل 2FA',
  'TWO_FA_DISABLED': 'تعطيل 2FA',
  'SESSION_DELETED': 'حذف جلسة',
  'SESSION_DELETED_ALL': 'حذف الجلسات',
  'SUSPICIOUS_LOGIN': 'دخول مشبوه',
  'NEW_DEVICE': 'جهاز جديد',
  'IP_BLOCKED': 'حظر IP',
  'IP_UNBLOCKED': 'رفع حظر',
};

const STATUS_CONFIG = {
  'SUCCESS': { icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  'FAILED': { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
  'WARNING': { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
};

export function SecurityLogs() {
  const { 
    getSecurityLogs, 
    deleteSecurityLog, 
    deleteMultipleLogs,
    exportSecurityLogs,
    isLoading 
  } = useSecuritySettings();
  
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [filterAction, setFilterAction] = useState<string>('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [page, filterAction]);

  const loadLogs = async () => {
    setLoadingLogs(true);
    const data = await getSecurityLogs({ 
      page, 
      limit: 10,
      action: filterAction || undefined 
    });
    setLogs(data.logs);
    setTotal(data.total);
    setTotalPages(data.totalPages);
    setLoadingLogs(false);
  };

  const handleDeleteLog = async (logId: string) => {
    setDeletingId(logId);
    const success = await deleteSecurityLog(logId);
    if (success) {
      setLogs(prev => prev.filter(l => l.id !== logId));
      setTotal(prev => prev - 1);
    }
    setDeletingId(null);
  };

  const handleDeleteSelected = async () => {
    if (selectedLogs.length === 0) return;
    const success = await deleteMultipleLogs(selectedLogs);
    if (success) {
      setLogs(prev => prev.filter(l => !selectedLogs.includes(l.id)));
      setTotal(prev => prev - selectedLogs.length);
      setSelectedLogs([]);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    setExporting(true);
    await exportSecurityLogs(format);
    setExporting(false);
  };

  const toggleSelectLog = (logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedLogs(
      selectedLogs.length === logs.length ? [] : logs.map(l => l.id)
    );
  };

  const formatTimeAgo = (date: string | Date) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return formatDistanceToNow(d, { addSuffix: true, locale: ar });
    } catch {
      const d = typeof date === 'string' ? new Date(date) : date;
      return format(d, 'dd/MM HH:mm');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl"
      >
        {/* Title Section */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">سجل النشاط</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{total} سجل</p>
            </div>
          </div>
          
          {/* Export Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || logs.length === 0}
              className={cn(
                "p-2.5 rounded-xl transition-colors",
                "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700",
                "text-zinc-600 dark:text-zinc-400",
                "disabled:opacity-50"
              )}
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filter & Actions Bar */}
        <div className="px-4 pb-4 flex flex-wrap items-center gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-2 h-11 px-4 rounded-full text-sm font-medium transition-all border",
                  filterAction 
                    ? "bg-foreground text-background border-foreground" 
                    : "bg-card text-foreground border-border/50 hover:border-border"
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="truncate">{filterAction ? ACTION_LABELS[filterAction] || filterAction : 'فلتر'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px] rounded-2xl">
              {[
                { value: '', label: 'جميع الأحداث' },
                { value: 'LOGIN_SUCCESS', label: 'تسجيل دخول' },
                { value: 'LOGIN_FAILED', label: 'دخول فاشل' },
                { value: 'PROFILE_UPDATE', label: 'تحديث الملف' },
                { value: 'TWO_FA_ENABLED', label: 'تفعيل 2FA' },
              ].map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => {
                    setFilterAction(option.value);
                    setPage(1);
                  }}
                  className={cn("text-sm cursor-pointer flex items-center justify-between", filterAction === option.value && "bg-muted font-medium")}
                >
                  <span>{option.label}</span>
                  {filterAction === option.value && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Select All Button */}
          {logs.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className={cn(
                "flex items-center gap-2 h-11 px-4 rounded-full text-sm font-medium transition-all border",
                selectedLogs.length === logs.length
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-foreground border-border/50 hover:border-border"
              )}
            >
              {selectedLogs.length === logs.length ? (
                <X className="w-4 h-4" />
              ) : (
                <CheckSquare className="w-4 h-4" />
              )}
              {selectedLogs.length > 0 ? `محدد (${selectedLogs.length})` : 'تحديد الكل'}
            </button>
          )}

          {/* Delete Selected */}
          {selectedLogs.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 h-11 px-4 rounded-full text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              حذف ({selectedLogs.length})
            </button>
          )}
        </div>
      </motion.div>

      {/* Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden"
      >
        {loadingLogs ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">جاري التحميل...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-zinc-400" />
            </div>
            <p className="font-medium text-zinc-700 dark:text-zinc-300">لا توجد سجلات</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">ستظهر هنا الأنشطة الأمنية</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {logs.map((log, index) => {
              const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG['WARNING'];
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 active:bg-zinc-50 dark:active:bg-zinc-800/50"
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelectLog(log.id)}
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        selectedLogs.includes(log.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {selectedLogs.includes(log.id) && (
                        <Check className="w-3 h-3" />
                      )}
                    </button>

                    {/* Status Icon */}
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", statusConfig.bg)}>
                      <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                            {ACTION_LABELS[log.action] || log.action}
                          </p>
                          {log.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                              {log.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          disabled={deletingId === log.id}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shrink-0"
                        >
                          {deletingId === log.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Meta */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-zinc-400">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(log.createdAt)}
                        </span>
                        {log.ipAddress && (
                          <span className="flex items-center gap-1 text-xs text-zinc-400">
                            <Globe className="w-3 h-3" />
                            {log.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {page} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
