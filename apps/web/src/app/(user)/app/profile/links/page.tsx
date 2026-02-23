'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, 
  ArrowRight,
  Loader2,
  Link2,
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Copy,
  Check,
  Pin,
  MousePointerClick,
  X,
  Image as ImageIcon,
  LayoutGrid
} from 'lucide-react';
import { toast } from '@/components/toast-provider';
import { cn } from '@/lib/utils';

// Components
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { PhoneMockup, AddLinkModal } from '@/components/(app)/profile';

// Hooks
import { useProfile } from '@/lib/hooks/profile';
import type { SocialLink } from '@/lib/types/profile';
import { useAuthContext } from '@/lib/auth/auth-provider';
import { getAccessToken } from '@/lib/api/client';
import { getAuthUrl } from '@/lib/url';

// Utils
import { detectPlatform, KNOWN_PLATFORMS, getSimpleIconKey, getFaviconUrl } from '@/lib/utils/urlDetection';
import { getThumbnailUrl } from '@/lib/utils/avatar';
import { PlatformIcon, FaviconIcon } from '@/components/ui/platform-icon';

// ============================================
// Types
// ============================================

interface LinkItemProps {
  link: SocialLink;
  onEdit: (link: SocialLink) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'active' | 'hidden') => void;
  onTogglePin: (id: string, isPinned: boolean) => void;
  onUpdateLayout: (id: string, layout: 'classic' | 'featured', thumbnail?: string, thumbnailFile?: File) => void;
}

type LinkLayout = 'classic' | 'featured';

// ============================================
// Layout Modal Component
// ============================================

function LayoutModal({ 
  open, 
  onOpenChange, 
  link,
  onLayoutChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  link: SocialLink;
  onLayoutChange: (layout: 'classic' | 'featured', thumbnail?: string, thumbnailFile?: File) => void;
}) {
  const [selectedLayout, setSelectedLayout] = useState<LinkLayout>(
    link.layout || 'classic'
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | undefined>(link.thumbnail);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const platform = detectPlatform(link.url);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens with new link
  useMemo(() => {
    if (open) {
      setSelectedLayout(link.layout || 'classic');
      setThumbnailPreview(link.thumbnail);
      setThumbnailFile(null);
      setRemoveThumbnail(false);
      setHasChanges(false);
    }
  }, [open, link.layout, link.thumbnail]);

  // Handle layout selection (without saving)
  const handleLayoutSelect = (layout: LinkLayout) => {
    if (layout !== selectedLayout) {
      setSelectedLayout(layout);
      setHasChanges(true);
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار صورة صالحة');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 2MB');
        return;
      }
      
      // Store the actual file for upload
      setThumbnailFile(file);
      setRemoveThumbnail(false);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle remove thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnailPreview(undefined);
    setThumbnailFile(null);
    setRemoveThumbnail(true);
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle save
  const handleSave = async () => {
    if (!hasChanges || isSaving) return;
    
    setIsSaving(true);
    try {
      await onLayoutChange(selectedLayout, removeThumbnail ? undefined : thumbnailPreview, thumbnailFile || undefined);
      onOpenChange(false);
    } catch (error) {
      toast.error('فشل في حفظ التغييرات');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden border-0 shadow-2xl" 
        dir="rtl" 
        aria-describedby={undefined}
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-4">
          <DialogTitle className="text-lg font-bold text-foreground text-center">
            اختر طريقة العرض
          </DialogTitle>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {link.title || platform?.nameAr || 'الرابط'}
          </p>
        </DialogHeader>
        
        <div className="px-5 pb-5 space-y-3">
          {/* Classic Layout Option */}
          <button
            type="button"
            onClick={() => handleLayoutSelect('classic')}
            className={cn(
              "w-full rounded-2xl border-2 transition-all duration-200 overflow-hidden",
              "hover:shadow-md",
              selectedLayout === 'classic' 
                ? "border-primary shadow-lg shadow-primary/10" 
                : "border-border hover:border-border"
            )}
          >
            {/* Preview Area */}
            <div className="p-4 bg-gradient-to-br from-muted to-card">
              <div className="bg-primary rounded-full h-12 flex items-center px-4 gap-3 shadow-md">
                {platform?.key ? (
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <PlatformIcon 
                      platformData={platform}
                      url={link.url}
                      size="sm"
                      className="brightness-0 invert"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <FaviconIcon url={link.url} size="sm" className="brightness-0 invert" />
                  </div>
                )}
                <div className="flex-1 text-right">
                  <div className="text-white text-sm font-medium truncate">
                    {link.title || platform?.nameAr || 'رابط'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Label */}
            <div className={cn(
              "px-4 py-3 flex items-center justify-between border-t",
              selectedLayout === 'classic' ? "bg-primary/5 border-primary/10" : "bg-card border-border/50"
            )}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedLayout === 'classic' 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground/30"
                )}>
                  {selectedLayout === 'classic' && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>
                <span className={cn(
                  "font-semibold text-sm",
                  selectedLayout === 'classic' ? "text-primary" : "text-muted-foreground"
                )}>
                  كلاسيكي
                </span>
              </div>
              <span className="text-xs text-muted-foreground">بسيط ومباشر</span>
            </div>
          </button>

          {/* Featured Layout Option */}
          <button
            type="button"
            onClick={() => handleLayoutSelect('featured')}
            className={cn(
              "w-full rounded-2xl border-2 transition-all duration-200 overflow-hidden",
              "hover:shadow-md",
              selectedLayout === 'featured' 
                ? "border-primary shadow-lg shadow-primary/10" 
                : "border-border hover:border-border"
            )}
          >
            {/* Preview Area */}
            <div className="p-4 bg-gradient-to-br from-muted to-card">
              <div 
                className="rounded-2xl h-28 relative overflow-hidden shadow-md"
                style={thumbnailPreview ? {
                  backgroundImage: `url(${thumbnailPreview})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                {/* Default Gradient Background */}
                {!thumbnailPreview && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white" />
                      <div className="absolute top-6 right-12 w-4 h-4 rounded bg-white" />
                    </div>
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Platform Icon */}
                <div className="absolute top-3 left-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {platform?.key ? (
                      <PlatformIcon 
                        platformData={platform}
                        url={link.url}
                        size="sm"
                        className="brightness-0 invert"
                      />
                    ) : (
                      <FaviconIcon url={link.url} size="sm" className="brightness-0 invert" />
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-3 right-3 left-3">
                  <h4 className="text-white font-bold text-base mb-0.5 truncate">
                    {link.title || platform?.nameAr || 'رابط'}
                  </h4>
                  <p className="text-white/60 text-xs truncate" dir="ltr">
                    {link.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Label */}
            <div className={cn(
              "px-4 py-3 flex items-center justify-between border-t",
              selectedLayout === 'featured' ? "bg-primary/5 border-primary/10" : "bg-card border-border/50"
            )}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                  selectedLayout === 'featured' 
                    ? "border-primary bg-primary" 
                    : "border-muted-foreground/30"
                )}>
                  {selectedLayout === 'featured' && (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  )}
                </div>
                <span className={cn(
                  "font-semibold text-sm",
                  selectedLayout === 'featured' ? "text-primary" : "text-muted-foreground"
                )}>
                  مميز
                </span>
              </div>
              <span className="text-xs text-muted-foreground">بارز وجذاب</span>
            </div>
          </button>

          {/* Thumbnail Upload - Only show when featured is selected */}
          {selectedLayout === 'featured' && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
                id="thumbnail-upload"
              />
              
              {thumbnailPreview ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">تم إضافة صورة مصغرة</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف الصورة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <label
                    htmlFor="thumbnail-upload"
                    className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="تغيير الصورة"
                  >
                    <Pencil className="w-4 h-4" />
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="thumbnail-upload"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:bg-muted hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span>إضافة صورة مصغرة</span>
                </label>
              )}
              <p className="text-xs text-muted-foreground text-center">
                الحد الأقصى 2MB • PNG, JPG, GIF
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-11 rounded-xl"
              disabled={isSaving}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 h-11 rounded-xl"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Link Item Component - Premium Design
// ============================================

function LinkItem({ link, onEdit, onDelete, onToggleStatus, onTogglePin, onUpdateLayout }: LinkItemProps) {
  const [copied, setCopied] = useState(false);
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const platform = detectPlatform(link.url);
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link.url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = link.url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('تم نسخ الرابط');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('فشل في نسخ الرابط');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(link.id);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صالحة');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      // Call update with file
      await onUpdateLayout(link.id, 'featured', previewUrl, file);
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      toast.error('فشل في رفع الصورة');
    } finally {
      setIsUploadingImage(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const handleRemoveThumbnail = async () => {
    setIsUploadingImage(true);
    try {
      await onUpdateLayout(link.id, 'featured', undefined);
      toast.success('تم حذف الصورة');
    } catch (error) {
      toast.error('فشل في حذف الصورة');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const isActive = link.status === 'active';
  const isFeatured = link.layout === 'featured';
  const cleanUrl = link.url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35);

  return (
    <Reorder.Item
      value={link}
      id={link.id}
      className="touch-manipulation"
    >
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "relative rounded-xl border transition-all duration-200 overflow-hidden",
          isActive 
            ? "bg-card border-border/50" 
            : "bg-muted/30 border-border/30 opacity-60",
          isFeatured && "border-primary/20"
        )}
      >
        {/* Main Content Area */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Drag Handle */}
            <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none">
              <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            {/* Platform Icon */}
            <div 
              className={cn(
                "w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0 relative"
              )}
              style={{ 
                backgroundColor: platform?.color ? `${platform.color}15` : '#f1f5f9',
              }}
            >
              {platform?.key ? (
                <PlatformIcon 
                  platformData={platform}
                  url={link.url}
                  size="md"
                />
              ) : (
                <FaviconIcon url={link.url} size="md" />
              )}
              {/* Pinned Badge */}
              {link.isPinned && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                  <Pin className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-semibold text-foreground truncate text-sm sm:text-base">
                  {link.title || platform?.nameAr || 'رابط'}
                </h3>
                {isFeatured && (
                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    مميز
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate" dir="ltr">
                {cleanUrl}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MousePointerClick className="w-3 h-3" />
                  <span className="text-[10px] sm:text-xs font-medium">{link.totalClicks || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  <span className="text-[10px] sm:text-xs font-medium">{link.views || 0}</span>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => onToggleStatus(link.id, isActive ? 'hidden' : 'active')}
              className={cn(
                "relative w-10 h-5 sm:w-11 sm:h-6 rounded-full transition-all duration-200 flex-shrink-0",
                isActive ? "bg-green-500" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-sm transition-all duration-200",
                  isActive ? "right-0.5" : "right-5 sm:right-5"
                )}
              />
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 border-t border-border/30">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onEdit(link)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-md transition-colors"
              title="تعديل"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopy}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                copied ? "text-green-600" : "text-muted-foreground hover:text-foreground"
              )}
              title="نسخ الرابط"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setShowLayoutOptions(!showLayoutOptions)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                isFeatured ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              title="تخطيط"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onTogglePin(link.id, !link.isPinned)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                link.isPinned ? "text-amber-500" : "text-muted-foreground hover:text-amber-500"
              )}
              title={link.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
            >
              <Pin className={cn("w-3.5 h-3.5", link.isPinned && "fill-current")} />
            </button>
          </div>
          <button
            onClick={() => setDeleteDialogOpen(true)}
            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md transition-colors"
            title="حذف"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Layout Options Panel */}
        <AnimatePresence>
          {showLayoutOptions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border/30"
            >
              <div className="p-3 sm:p-4 bg-muted/30 space-y-3">
                {/* Featured Toggle */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">عرض مميز</span>
                  </div>
                  <button
                    onClick={() => {
                      onUpdateLayout(link.id, isFeatured ? 'classic' : 'featured');
                      if (isFeatured) setShowLayoutOptions(false);
                    }}
                    className={cn(
                      "relative w-12 h-6 rounded-full transition-all duration-300",
                      isFeatured 
                        ? "bg-gradient-to-r from-primary to-primary/80" 
                        : "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center",
                        isFeatured ? "right-1" : "right-6"
                      )}
                    >
                      {isFeatured ? (
                        <Check className="w-2.5 h-2.5 text-primary" />
                      ) : null}
                    </span>
                  </button>
                </div>

                {/* Thumbnail Upload - Only show when featured */}
                {isFeatured && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-3 border-t border-border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">صورة مصغرة (اختياري)</span>
                    </div>
                    
                    {link.thumbnail ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                          <img 
                            src={getThumbnailUrl(link.thumbnail) || ''} 
                            alt="صورة مصغرة"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => thumbnailInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="text-xs text-primary hover:text-primary/80 font-medium"
                          >
                            تغيير الصورة
                          </button>
                          <button
                            onClick={handleRemoveThumbnail}
                            disabled={isUploadingImage}
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                          >
                            {isUploadingImage ? 'جاري الحذف...' : 'حذف الصورة'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed rounded-lg transition-all",
                          isUploadingImage 
                            ? "border-border bg-muted cursor-wait" 
                            : "border-border hover:border-primary hover:bg-primary/5"
                        )}
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">جاري الرفع...</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">اضغط لإضافة صورة</span>
                          </>
                        )}
                      </button>
                    )}
                    
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                    
                    <p className="text-[10px] text-muted-foreground mt-2">
                      الصورة تظهر بجانب الرابط في العرض المميز
                    </p>
                  </motion.div>
                )}

                {!isFeatured && (
                  <p className="text-[11px] text-muted-foreground">
                    فعّل العرض المميز لإضافة صورة مصغرة للرابط
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد من حذف هذا الرابط؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيتم حذف الرابط "{link.title || platform?.nameAr || 'رابط'}" نهائياً. هذا الإجراء لا يمكن التراجع عنه.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                    جاري الحذف...
                  </>
                ) : (
                  'حذف الرابط'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </Reorder.Item>
  );
}

// ============================================
// Empty State Component - Elegant Design
// ============================================

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="bg-card rounded-xl border border-border/50 p-8 sm:p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Link2 className="w-6 h-6 text-primary" />
      </div>
      
      <h3 className="text-base font-bold text-foreground mb-1.5">
        ابدأ بإضافة روابطك
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
        اجمع كل حساباتك وروابطك المهمة في مكان واحد وشاركها بسهولة
      </p>
      
      <Button 
        onClick={onAddClick}
        className="gap-2 h-10 px-5 rounded-xl text-sm"
      >
        <Plus className="w-4 h-4" />
        إضافة رابط جديد
      </Button>
    </div>
  );
}



// ============================================
// Main Page Component
// ============================================

export default function LinksPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  
  const {
    profile,
    socialLinks,
    isLoading,
    isUpdating,
    fetchSocialLinks,
  } = useProfile();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [localLinks, setLocalLinks] = useState<SocialLink[]>([]);

  // Sync local links with fetched links
  useEffect(() => {
    if (socialLinks && socialLinks.length > 0) {
      setLocalLinks(socialLinks);
    }
  }, [socialLinks]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeLinks = localLinks.filter(l => l.status === 'active').length;
    const totalClicks = localLinks.reduce((sum, l) => sum + (l.totalClicks || 0), 0);
    return { totalLinks: localLinks.length, activeLinks, totalClicks };
  }, [localLinks]);

  // Handle link reorder
  const handleReorder = useCallback(async (newOrder: SocialLink[]) => {
    const previousOrder = [...localLinks];
    setLocalLinks(newOrder);
    
    try {
      const token = getAccessToken();
      const linkIds = newOrder.map(link => link.id);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/social-links/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ linkIds }),
      });

      if (!response.ok) {
        throw new Error('فشل في حفظ الترتيب');
      }
      
      // Success - silent (no toast for better UX during drag)
    } catch (error) {
      // Revert on error
      setLocalLinks(previousOrder);
      toast.error('فشل في حفظ ترتيب الروابط');
    }
  }, [localLinks]);

  // Handle edit link
  const handleEdit = useCallback((link: SocialLink) => {
    setEditingLink(link);
    setIsAddModalOpen(true);
  }, []);

  // Handle delete link
  const handleDelete = useCallback(async (id: string) => {
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/social-links/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('فشل في حذف الرابط');
      }

      setLocalLinks(prev => prev.filter(l => l.id !== id));
      toast.success('تم حذف الرابط بنجاح');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في حذف الرابط');
      throw error; // Re-throw to let the caller know it failed
    }
  }, []);

  // Handle toggle status
  const handleToggleStatus = useCallback(async (id: string, status: 'active' | 'hidden') => {
    const previousLinks = [...localLinks];
    
    // Optimistic update
    setLocalLinks(prev => prev.map(l => 
      l.id === id ? { ...l, status } : l
    ));
    
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/social-links/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث الرابط');
      }
      
      toast.success(status === 'active' ? 'تم إظهار الرابط' : 'تم إخفاء الرابط');
    } catch (error) {
      // Revert on error
      setLocalLinks(previousLinks);
      toast.error('فشل في تحديث الرابط');
    }
  }, [localLinks]);

  // Handle toggle pin
  const handleTogglePin = useCallback(async (id: string, isPinned: boolean) => {
    const previousLinks = [...localLinks];
    
    // Optimistic update
    setLocalLinks(prev => prev.map(l => 
      l.id === id ? { ...l, isPinned } : l
    ));
    
    try {
      const token = getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/social-links/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ isPinned }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث الرابط');
      }
      
      toast.success(isPinned ? 'تم تثبيت الرابط' : 'تم إلغاء التثبيت');
    } catch (error) {
      // Revert on error
      setLocalLinks(previousLinks);
      toast.error('فشل في تحديث الرابط');
    }
  }, [localLinks]);

  // Handle update layout
  const handleUpdateLayout = useCallback(async (id: string, layout: 'classic' | 'featured', thumbnail?: string, thumbnailFile?: File) => {
    const currentLink = localLinks.find(l => l.id === id);
    const previousLayout: 'classic' | 'featured' = currentLink?.layout || 'classic';
    const previousThumbnail = currentLink?.thumbnail;
    
    // Optimistic update - update UI immediately with preview
    setLocalLinks(prev => prev.map(l => 
      l.id === id ? { ...l, layout, thumbnail } : l
    ));
    
    try {
      const token = getAccessToken();
      let finalThumbnail: string | undefined = thumbnail;
      
      // If there's a new file to upload, upload it first
      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('file', thumbnailFile);
        
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/social-links/${id}/thumbnail`, {
          method: 'POST',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('فشل في رفع الصورة');
        }
        
        const uploadedLink = await uploadResponse.json();
        finalThumbnail = uploadedLink.thumbnail;
        
        // Update with the actual server URL
        setLocalLinks(prev => prev.map(l => 
          l.id === id ? { ...l, thumbnail: finalThumbnail } : l
        ));
      } else if (thumbnail === undefined && previousThumbnail) {
        // Delete the thumbnail if it was removed
        const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/social-links/${id}/thumbnail`, {
          method: 'DELETE',
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!deleteResponse.ok) {
          throw new Error('فشل في حذف الصورة');
        }
        finalThumbnail = undefined;
      }
      
      // Update layout (if no file was uploaded, we still need to update layout)
      if (!thumbnailFile) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/social-links/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ layout }),
        });

        if (!response.ok) {
          throw new Error('فشل في تحديث التخطيط');
        }
      }

      toast.success(layout === 'featured' ? 'تم تغيير التخطيط إلى مميز' : 'تم تغيير التخطيط إلى كلاسيكي');
    } catch (error) {
      // Revert on error
      setLocalLinks(prev => prev.map(l => 
        l.id === id ? { ...l, layout: previousLayout || 'classic', thumbnail: previousThumbnail } : l
      ));
      toast.error(error instanceof Error ? error.message : 'فشل في تحديث التخطيط');
    }
  }, [localLinks]);

  // Handle save link (add/edit)
  const handleSaveLink = useCallback(async (linkData: any) => {
    try {
      if (editingLink) {
        // Update existing link
        setLocalLinks(prev => prev.map(l => 
          l.id === editingLink.id ? { ...l, ...linkData } : l
        ));
        toast.success('تم تحديث الرابط');
      } else {
        // Add new link
        const newLink: SocialLink = {
          id: `temp-${Date.now()}`,
          profileId: profile?.id || '',
          ...linkData,
          displayOrder: localLinks.length,
          views: 0,
          totalClicks: 0,
          isPinned: false,
          isPopular: false,
        };
        setLocalLinks(prev => [...prev, newLink]);
        toast.success('تم إضافة الرابط');
      }
      setIsAddModalOpen(false);
      setEditingLink(null);
      fetchSocialLinks(); // Refresh from server
    } catch (error) {
      toast.error('فشل في حفظ الرابط');
    }
  }, [editingLink, localLinks.length, profile?.id, fetchSocialLinks]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingLink(null);
  }, []);

  // Auth check
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.replace(getAuthUrl('/login'));
    return null;
  }

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 gap-4 m-2 md:ms-0" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 min-w-0 bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 pb-28 md:pb-6">
          
            {/* Page Header - Same style as Forms */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors active:scale-95"
                    title="رجوع"
                  >
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
                    <Link2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">روابطي</h1>
                    <p className="text-sm text-muted-foreground">
                      {localLinks.length > 0 ? (
                        <span>{localLinks.filter(l => l.status === 'active').length} نشط من {localLinks.length}</span>
                      ) : (
                        <span>لم تضف أي روابط بعد</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">إضافة رابط</span>
                    <span className="sm:hidden">إضافة</span>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Links List */}
            <div>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                  <div key={i} className="bg-card rounded-xl border border-border/50 p-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-5 bg-muted rounded" />
                        <div className="w-10 h-10 bg-muted rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 bg-muted rounded w-28" />
                          <div className="h-2.5 bg-muted/50 rounded w-40" />
                        </div>
                        <div className="w-10 h-5 bg-muted rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : localLinks.length === 0 ? (
                <EmptyState onAddClick={() => setIsAddModalOpen(true)} />
              ) : (
                <Reorder.Group 
                  axis="y" 
                  values={localLinks} 
                  onReorder={handleReorder}
                  className="space-y-3"
                >
                  <AnimatePresence>
                    {localLinks.map(link => (
                      <LinkItem
                        key={link.id}
                        link={link}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                        onTogglePin={handleTogglePin}
                        onUpdateLayout={handleUpdateLayout}
                      />
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Phone Preview Sidebar - Desktop Only */}
      <div className="hidden xl:flex">
        {profile && (
          <PhoneMockup 
            profile={profile}
            customLinks={localLinks}
          />
        )}
      </div>

      {/* Add/Edit Link Modal */}
      <AddLinkModal
        open={isAddModalOpen}
        onOpenChange={handleModalClose}
        onSave={handleSaveLink}
        editingLink={editingLink}
      />

      {/* Loading Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-2xl p-6 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-muted-foreground">جاري الحفظ...</span>
          </div>
        </div>
      )}
    </div>
  );
}
