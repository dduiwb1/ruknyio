'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  X,
  Chrome,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getGoogleOAuthUrl } from '@/lib/utils/googleOAuth';

interface GoogleSocialConnectProps {
  onConnectionSuccess?: () => void;
}

export function GoogleSocialConnect({ onConnectionSuccess }: GoogleSocialConnectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleGoogleConnect = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    setMessage('جاري الاتصال بـ Google...');

    try {
      const googleAuthUrl = getGoogleOAuthUrl();
      
      // استخدام window.location للانتقال إلى Google OAuth
      window.location.href = googleAuthUrl;

      setConnectionStatus('success');
      setMessage('تم الاتصال بنجاح! جاري تحديث البيانات...');
      
      setTimeout(() => {
        setIsOpen(false);
        setConnectionStatus('idle');
        onConnectionSuccess?.();
      }, 2000);
    } catch (error) {
      setConnectionStatus('error');
      setMessage(
        error instanceof Error
          ? error.message
          : 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.'
      );
      console.error('Google connect error:', error);
      
      setTimeout(() => {
        setConnectionStatus('idle');
        setIsLoading(false);
      }, 3000);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/30 border border-blue-200 dark:border-blue-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-blue-700 dark:text-blue-300 font-medium text-sm shadow-sm"
      >
        <Zap className="w-4 h-4" />
        <span>إضافة عبر Google</span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoading && setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-border/40"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">ربط حسابات Google</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Status Messages */}
              <AnimatePresence mode="wait">
                {connectionStatus === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 space-y-4"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      قم بربط حسابك على Google لإضافة حساباتك الاجتماعية تلقائياً. سيتم الوصول إلى بيانات الملف الشخصي فقط.
                    </p>

                    {/* Features */}
                    <div className="space-y-2">
                      {[
                        'ربط سريع وآمن',
                        'إضافة المنصات تلقائياً',
                        'لا توجد كلمات مرور مخزنة'
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {connectionStatus === 'connecting' && (
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 text-center py-8"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{message}</p>
                  </motion.div>
                )}

                {connectionStatus === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 text-center py-8"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      </div>
                    </div>
                    <p className="text-sm text-success font-medium">{message}</p>
                  </motion.div>
                )}

                {connectionStatus === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 text-center py-8"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                      </div>
                    </div>
                    <p className="text-sm text-destructive">{message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleGoogleConnect}
                  disabled={isLoading || connectionStatus !== 'idle'}
                  className="flex-1 gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الاتصال...
                    </>
                  ) : (
                    <>
                      <Chrome className="w-4 h-4" />
                      متابعة مع Google
                    </>
                  )}
                </Button>
              </div>

              {/* Security Note */}
              <p className="text-[11px] text-muted-foreground text-center mt-4">
                نحن نحافظ على أمان بياناتك ولا نخزن كلمات المرور
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
