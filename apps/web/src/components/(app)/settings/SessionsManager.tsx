'use client';

import { useState, useEffect } from 'react';
import { 
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  Trash2,
  LogOut,
  Loader2,
  CheckCircle,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSecuritySettings, Session } from '@/lib/hooks/settings/useSecuritySettings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export function SessionsManager() {
  const { getSessions, deleteSession, deleteOtherSessions } = useSecuritySettings();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoadingSessions(true);
    const data = await getSessions();
    setSessions(data);
    setLoadingSessions(false);
  };

  const handleDeleteSession = async (sessionId: string, isCurrent: boolean) => {
    // 🔒 منع حذف الجلسة الحالية
    if (isCurrent) {
      return;
    }
    
    setDeletingId(sessionId);
    const success = await deleteSession(sessionId, isCurrent);
    if (success) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    }
    setDeletingId(null);
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    const result = await deleteOtherSessions();
    if (result) {
      setSessions(prev => prev.filter(s => s.isCurrent));
      setShowConfirmModal(false);
    }
    setDeletingAll(false);
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const otherSessionsCount = sessions.filter(s => !s.isCurrent).length;

  return (
    <>
      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-foreground">الجلسات النشطة</h3>
              <p className="text-xs text-muted-foreground">{sessions.length} جلسة نشطة</p>
            </div>
          </div>

          {otherSessionsCount > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-medium hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إنهاء الكل</span>
            </button>
          )}
        </div>

        {/* Sessions List */}
        <div className="divide-y divide-border">
          {loadingSessions ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground text-xs mt-3">جاري تحميل الجلسات...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <Globe className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-xs">لا توجد جلسات نشطة</p>
            </div>
          ) : (
            sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.deviceType);
              
              return (
                <div
                  key={session.id}
                  className={cn(
                    "p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors",
                    session.isCurrent && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    session.isCurrent ? "bg-primary/10" : "bg-muted"
                  )}>
                    <DeviceIcon className={cn(
                      "w-4 h-4",
                      session.isCurrent ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-medium text-foreground truncate">
                        {session.browser || 'متصفح'} على {session.os || 'نظام'}
                      </h4>
                      {session.isCurrent && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary text-primary-foreground rounded text-[10px] font-medium">
                          <CheckCircle className="w-2.5 h-2.5" />
                          الحالية
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground flex-wrap">
                      {session.ipAddress && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {session.ipAddress}
                        </span>
                      )}
                      {session.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {session.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true, locale: ar })}
                      </span>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <button
                      onClick={() => handleDeleteSession(session.id, session.isCurrent)}
                      disabled={deletingId === session.id}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                      title="إنهاء هذه الجلسة"
                    >
                      {deletingId === session.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Confirm Modal using AlertDialog */}
      <AlertDialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <AlertDialogContent dir="rtl" className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              هل أنت متأكد؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم إنهاء <span className="font-semibold text-foreground">{otherSessionsCount}</span> جلسة أخرى. 
              ستحتاج لتسجيل الدخول مجدداً على تلك الأجهزة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={deletingAll}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {deletingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'متابعة'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
