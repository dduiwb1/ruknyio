'use client';

/**
 * 📴 Offline Page
 * 
 * Shown when the user is offline and the requested page isn't cached
 */

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-reload when back online
  useEffect(() => {
    if (isOnline) {
      // Small delay before reload to ensure connection is stable
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-gray-500 dark:text-gray-400" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            لا يوجد اتصال بالإنترنت
          </h1>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            تحقق من اتصالك بالإنترنت وحاول مرة أخرى.
            <br />
            بعض الصفحات المحفوظة قد تكون متاحة.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isOnline ? 'متصل - جاري إعادة التحميل...' : 'غير متصل'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            إعادة المحاولة
          </button>
          <button
            onClick={handleGoHome}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            الصفحة الرئيسية
          </button>
        </div>

        {/* Tips */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            💡 نصيحة: قم بتثبيت التطبيق للحصول على تجربة أفضل في وضع عدم الاتصال
          </p>
        </div>
      </div>
    </div>
  );
}
