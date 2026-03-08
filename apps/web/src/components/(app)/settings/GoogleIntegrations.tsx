'use client';

import type { SVGProps } from 'react';
import { motion } from 'framer-motion';

const GoogleLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 256 262" aria-hidden="true" {...props}>
    <path fill="#4285F4" d="M255.68 133.5c0-9.1-.8-18.2-2.3-27.3H130.9v51.7h69.8c-2.9 15.7-11.9 29.1-25.3 38.1v31h40.9c23.9-22 39.4-54.5 39.4-93.5Z" />
    <path fill="#34A853" d="M130.9 261c34.3 0 63.1-11.3 84.1-30.4l-40.9-31c-11.3 7.6-25.8 12.1-43.2 12.1-33.2 0-61.3-22.4-71.4-52.4H17.7v32.9C38.9 233.3 81.6 261 130.9 261Z" />
    <path fill="#FBBC05" d="M59.5 159.3c-2.6-7.6-4.1-15.7-4.1-24 0-8.3 1.5-16.4 4.1-24.1V78.3H17.7C9.2 95.4 4.4 114.3 4.4 135.3c0 21 4.8 39.9 13.3 57l41.8-32.9Z" />
    <path fill="#EA4335" d="M130.9 51.9c18.8 0 35.6 6.5 48.8 19.3l36.5-36.5C194 12.6 165.2 1.5 130.9 1.5 81.6 1.5 38.9 29.2 17.7 73.6l41.8 32.9c10.1-30 38.2-54.6 71.4-54.6Z" />
  </svg>
);

export function GoogleIntegrations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 30 }}
        className="w-16 h-16 rounded-3xl bg-card border border-border shadow-sm flex items-center justify-center mb-4"
      >
        <GoogleLogo className="w-7 h-7" />
      </motion.div>

      <h3 className="text-xl font-bold text-foreground mb-2 text-center">خدمات جوجل</h3>
      <p className="text-base text-muted-foreground text-center max-w-sm mb-6">
        تم إيقاف ربط Google Drive / Sheets / Calendar حالياً
      </p>

      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border"
      >
        <span className="text-sm text-foreground font-medium">غير متوفر حالياً</span>
      </motion.div>
    </motion.div>
  );
}
