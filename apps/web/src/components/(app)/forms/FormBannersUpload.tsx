'use client';

import { useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, X, Plus, Layers, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BannerDisplayMode = 'single' | 'slider' | 'grid';

interface FormBannersUploadProps {
  banners: (File | string)[];
  onChange: (banners: (File | string)[]) => void;
  displayMode: BannerDisplayMode;
  onDisplayModeChange: (mode: BannerDisplayMode) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function FormBannersUpload({
  banners,
  onChange,
  displayMode,
  onDisplayModeChange,
  maxFiles = 5,
  maxSizeMB = 5,
}: FormBannersUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPreviewUrl = (banner: File | string): string => {
    if (typeof banner === 'string') return banner;
    return URL.createObjectURL(banner);
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const validFiles = files.filter((file) => {
        if (!file.type.startsWith('image/')) return false;
        if (file.size > maxSizeMB * 1024 * 1024) return false;
        return true;
      });

      const remaining = maxFiles - banners.length;
      const toAdd = validFiles.slice(0, remaining);

      if (toAdd.length > 0) {
        onChange([...banners, ...toAdd]);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [banners, maxFiles, maxSizeMB, onChange]
  );

  const handleRemove = (index: number) => {
    const updated = banners.filter((_, i) => i !== index);
    onChange(updated);
    // If only one image left, switch to single mode
    if (updated.length <= 1 && displayMode !== 'single') {
      onDisplayModeChange('single');
    }
  };

  return (
    <div className="space-y-3">
      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Banners Preview Grid */}
      {banners.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence>
            {banners.map((banner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted group"
              >
                <img
                  src={getPreviewUrl(banner)}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {index === 0 && banners.length > 1 && (
                  <span className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-black/60 text-white rounded-full">
                    رئيسية
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add more button */}
          {banners.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px]">إضافة</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state - Upload button */}
      {banners.length === 0 && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-border hover:border-primary/50 rounded-xl bg-muted/30 text-muted-foreground hover:text-primary transition-colors"
        >
          <ImageIcon className="w-8 h-8" />
          <span className="text-sm font-medium">اضغط لاختيار صورة</span>
          <span className="text-xs">
            حتى {maxFiles} صور بحجم أقصى {maxSizeMB} ميجابايت
          </span>
        </button>
      )}

      {/* Display Mode Selector (only when multiple banners) */}
      {banners.length > 1 && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-xl">
          <span className="text-xs text-muted-foreground shrink-0">طريقة العرض:</span>
          <div className="flex gap-1 flex-1">
            {(
              [
                { value: 'single', label: 'صورة واحدة', icon: Maximize2 },
                { value: 'slider', label: 'سلايدر', icon: Layers },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => onDisplayModeChange(value)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  displayMode === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
