'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Loader2,
  Check,
  Globe,
  Sparkles,
  Eye,
  EyeOff,
  X,
  LinkIcon,
  Type,
  ToggleLeft,
} from 'lucide-react';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlatformIcon, FaviconIcon } from '@/components/ui/platform-icon';

// Utils
import { 
  detectPlatform, 
  extractUsername, 
  formatUrl,
  isValidUrl,
  KNOWN_PLATFORMS,
  getPlatformsByCategory,
  getSimpleIconKey,
  getFaviconUrl,
  type PlatformInfo 
} from '@/lib/utils/urlDetection';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { api } from '@/lib/api';
import { iconStyles, buttonStyles } from '@/lib/design-system';

// ============================================
// Types
// ============================================

interface AddLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: LinkFormData) => void;
  editingLink?: any | null;
}

interface LinkFormData {
  platform: string;
  username: string;
  url: string;
  title: string;
  status: 'active' | 'hidden';
}

// ============================================
// Platform Grid Component (Simplified)
// ============================================

function PlatformGrid({ 
  selectedPlatform, 
  onSelect,
  detectedPlatform,
}: { 
  selectedPlatform: string;
  onSelect: (platform: PlatformInfo) => void;
  detectedPlatform: PlatformInfo | null;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const categories = [
    { key: 'all', label: 'الكل' },
    { key: 'social', label: 'اجتماعي' },
    { key: 'media', label: 'وسائط' },
    { key: 'messaging', label: 'تواصل' },
    { key: 'business', label: 'أعمال' },
  ];
  
  const filteredPlatforms = useMemo(() => {
    // Filter out 'website' as it's shown separately
    const platforms = KNOWN_PLATFORMS.filter(p => p.key !== 'website');
    if (activeCategory === 'all') {
      return platforms;
    }
    return platforms.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-4">
      {/* Auto-detected badge */}
      <AnimatePresence>
        {detectedPlatform && detectedPlatform.key !== 'website' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${detectedPlatform.color}15` }}
            >
              <PlatformIcon 
                platformData={detectedPlatform}
                size="md"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">تم التعرف تلقائياً</p>
              <p className="text-xs text-green-600">{detectedPlatform.nameAr}</p>
            </div>
            <Sparkles className="w-5 h-5 text-green-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              activeCategory === cat.key
                ? "bg-[#193948] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Platform grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1.5 max-h-[180px] overflow-y-auto">
        {filteredPlatforms.map((platform) => {
          const isSelected = selectedPlatform === platform.key;
          const isDetected = detectedPlatform?.key === platform.key;
          
          return (
            <motion.button
              key={platform.key}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(platform)}
              className={cn(
                "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                "border",
                isSelected 
                  ? "border-[#4FADC0] bg-[#4FADC0]/10" 
                  : "border-transparent bg-gray-50/80 hover:bg-gray-100",
                isDetected && !isSelected && "ring-1 ring-green-200"
              )}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  isSelected && "scale-105"
                )}
                style={{ backgroundColor: `${platform.color}12` }}
              >
                <PlatformIcon 
                  platformData={platform}
                  size="sm"
                />
              </div>
              <span className={cn(
                "text-[9px] font-medium text-center leading-tight line-clamp-1",
                isSelected ? "text-[#193948]" : "text-gray-500"
              )}>
                {platform.nameAr}
              </span>
              
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  layoutId="platform-check"
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#4FADC0] rounded-full flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
        
        {/* Other/Website option */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const websitePlatform = KNOWN_PLATFORMS.find(p => p.key === 'website');
            if (websitePlatform) onSelect(websitePlatform);
          }}
          className={cn(
            "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
            "border",
            selectedPlatform === 'website' 
              ? "border-[#4FADC0] bg-[#4FADC0]/10" 
              : "border-transparent bg-gray-50/80 hover:bg-gray-100"
          )}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-200">
            <Globe className="w-4 h-4 text-gray-500" />
          </div>
          <span className="text-[9px] font-medium text-gray-500">أخرى</span>
          
          {selectedPlatform === 'website' && (
            <motion.div
              layoutId="platform-check"
              className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#4FADC0] rounded-full flex items-center justify-center"
            >
              <Check className="w-2.5 h-2.5 text-white" />
            </motion.div>
          )}
        </motion.button>
      </div>
    </div>
  );
}

// ============================================
// Link Form Component
// ============================================

function LinkForm({ 
  onSave, 
  onCancel,
  editingLink,
}: { 
  onSave: (data: LinkFormData) => void;
  onCancel: () => void;
  editingLink?: any | null;
}) {
  const [url, setUrl] = useState(editingLink?.url || '');
  const [title, setTitle] = useState(editingLink?.title || '');
  const [platform, setPlatform] = useState(editingLink?.platform || '');
  const [username, setUsername] = useState(editingLink?.username || '');
  const [status, setStatus] = useState<'active' | 'hidden'>(editingLink?.status || 'active');
  
  const [isDetecting, setIsDetecting] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [urlError, setUrlError] = useState('');

  // Fetch URL metadata (title, description, image)
  const fetchUrlMetadata = useCallback(async (targetUrl: string) => {
    try {
      setIsFetchingMetadata(true);
      const response = await api.get<{
        title: string | null;
        description: string | null;
        image: string | null;
        siteName: string | null;
        type: string | null;
      }>(`/utils/url-metadata?url=${encodeURIComponent(targetUrl)}`);
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch URL metadata:', error);
      return null;
    } finally {
      setIsFetchingMetadata(false);
    }
  }, []);

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (!url) {
      setDetectedPlatform(null);
      setUrlError('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsDetecting(true);
      
      // Validate URL
      const formattedUrl = formatUrl(url);
      if (!isValidUrl(formattedUrl)) {
        setUrlError('الرابط غير صالح');
        setIsDetecting(false);
        return;
      }
      setUrlError('');

      // Detect platform locally first
      const detected = detectPlatform(formattedUrl);
      setDetectedPlatform(detected);
      
      if (detected && detected.key !== 'website') {
        setPlatform(detected.key);
        
        // Extract username
        const extractedUsername = extractUsername(formattedUrl, detected);
        if (extractedUsername) {
          setUsername(extractedUsername);
        }
        
        // Auto-fill title if empty - fetch from URL metadata
        if (!title) {
          const metadata = await fetchUrlMetadata(formattedUrl);
          if (metadata?.title) {
            setTitle(metadata.title.slice(0, 50));
          } else {
            setTitle(detected.nameAr.slice(0, 50));
          }
        }
      } else if (detected?.key === 'website') {
        // For unknown websites, fetch metadata for title
        setPlatform('website');
        if (!title) {
          const metadata = await fetchUrlMetadata(formattedUrl);
          if (metadata?.title) {
            setTitle(metadata.title.slice(0, 50));
          } else if (metadata?.siteName) {
            setTitle(metadata.siteName.slice(0, 50));
          }
        }
      }
      
      setIsDetecting(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [url, title, fetchUrlMetadata]);

  // Handle platform selection
  const handlePlatformSelect = useCallback((platformInfo: PlatformInfo) => {
    setPlatform(platformInfo.key);
    if (!title) {
      setTitle(platformInfo.nameAr);
    }
  }, [title]);

  // Handle save
  const handleSave = async () => {
    if (!url) {
      setUrlError('الرجاء إدخال الرابط');
      return;
    }

    const formattedUrl = formatUrl(url);
    if (!isValidUrl(formattedUrl)) {
      setUrlError('الرابط غير صالح');
      return;
    }

    setIsSaving(true);
    
    try {
      const finalTitle = (title || detectedPlatform?.nameAr || 'رابط').slice(0, 50);
      const linkData: LinkFormData = {
        platform: platform || 'website',
        username: username || '',
        url: formattedUrl,
        title: finalTitle,
        status,
      };

      // Call API to save
      if (editingLink) {
        await api.put(`/social-links/${editingLink.id}`, linkData);
      } else {
        await api.post('/social-links', linkData);
      }

      onSave(linkData);
    } catch (error: any) {
      console.error('Error saving link:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = url && !urlError;
  const isLoading = isDetecting || isFetchingMetadata;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain">
        {/* URL Input - Enhanced */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <Label className="text-sm font-semibold text-gray-700">الصق رابطك هنا</Label>
          </div>
          <div className="relative">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://instagram.com/username"
              className={cn(
                "h-12 rounded-xl pl-4 pr-12 text-sm bg-gray-50/80 border-2 transition-all duration-200",
                "focus:bg-white focus:border-[#4FADC0] focus:ring-2 focus:ring-[#4FADC0]/20",
                "placeholder:text-gray-400 text-left font-medium",
                urlError 
                  ? "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-200" 
                  : "border-gray-200"
              )}
              dir="ltr"
              autoComplete="off"
              autoCapitalize="off"
              enterKeyHint="next"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center"
                  >
                    <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                  </motion.div>
                ) : detectedPlatform && !urlError ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </motion.div>
                ) : urlError ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"
                  >
                    <Link2 className="w-4 h-4 text-gray-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <AnimatePresence>
            {urlError && (
              <motion.p 
                initial={{ opacity: 0, y: -5, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -5, height: 0 }}
                className="text-xs text-red-500 flex items-center gap-1 font-medium"
              >
                <X className="w-3 h-3" />
                {urlError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Platform Detection Badge - Enhanced */}
        <AnimatePresence>
          {detectedPlatform && detectedPlatform.key !== 'website' && !urlError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="flex items-center gap-3 p-3 bg-gradient-to-l from-green-50 to-emerald-50/80 rounded-xl border border-green-200/50"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                style={{ backgroundColor: `${detectedPlatform.color}15` }}
              >
                <PlatformIcon 
                  platformData={detectedPlatform}
                  size="md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">تم التعرف على المنصة ✨</p>
                <p className="text-xs text-green-600 truncate">{detectedPlatform.nameAr}</p>
              </div>
              <Sparkles className="w-5 h-5 text-green-500 flex-shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title Input - Enhanced */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Type className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <Label className="text-sm font-semibold text-gray-700">
              العنوان <span className="text-gray-400 font-normal text-xs">(اختياري)</span>
            </Label>
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 50))}
            placeholder={detectedPlatform?.nameAr || "عنوان مخصص للرابط"}
            maxLength={50}
            className="h-12 rounded-xl bg-gray-50/80 border-2 border-gray-200 text-sm font-medium focus:bg-white focus:border-[#4FADC0] focus:ring-2 focus:ring-[#4FADC0]/20 transition-all duration-200"
            enterKeyHint="done"
          />
        </div>

        {/* Status Toggle - Enhanced */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <ToggleLeft className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <Label className="text-sm font-semibold text-gray-700">حالة الرابط</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatus('active')}
              className={cn(
                "flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 border-2",
                status === 'active' 
                  ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20" 
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              )}
            >
              <Eye className="w-4 h-4" />
              <span>ظاهر</span>
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setStatus('hidden')}
              className={cn(
                "flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all duration-200 border-2",
                status === 'hidden' 
                  ? "bg-gray-700 text-white border-gray-700 shadow-md shadow-gray-700/20" 
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              )}
            >
              <EyeOff className="w-4 h-4" />
              <span>مخفي</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Actions - Fixed Footer that stays visible with keyboard */}
      <div 
        className="flex gap-3 pt-3 mt-3 border-t border-gray-100 bg-white flex-shrink-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-11 rounded-xl text-sm font-semibold border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          إلغاء
        </Button>
        <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleSave}
            disabled={isSaving || !isFormValid}
            className={cn(
              "w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200",
              "bg-gradient-to-l from-[#193948] to-[#1e4a5c] hover:from-[#193948]/90 hover:to-[#1e4a5c]/90",
              "shadow-lg shadow-[#193948]/20",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            )}
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </span>
            ) : editingLink ? (
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                حفظ التغييرات
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                إضافة الرابط
              </span>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================
// Main Modal Component
// ============================================

export function AddLinkModal({ 
  open, 
  onOpenChange, 
  onSave,
  editingLink,
}: AddLinkModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const title = editingLink ? 'تعديل الرابط' : 'إضافة رابط جديد';
  const subtitle = editingLink ? 'قم بتعديل بيانات الرابط' : 'أضف رابط جديد لملفك الشخصي';
  
  const formContent = (
    <LinkForm 
      onSave={onSave}
      onCancel={() => onOpenChange(false)}
      editingLink={editingLink}
    />
  );

  // Mobile: Drawer from bottom - Enhanced with keyboard handling
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent 
          className="rounded-t-[24px] border-0 bg-white flex flex-col"
          style={{ 
            maxHeight: '85dvh',
            height: 'auto',
          }}
        >
          {/* Handle bar */}
          <div className="mx-auto w-10 h-1 flex-shrink-0 rounded-full bg-gray-300 mt-3" />
          
          {/* Header - Compact for mobile */}
          <DrawerHeader className="text-right px-5 py-3 border-b border-gray-100 flex-shrink-0">
            <DrawerTitle asChild>
              <div className="flex items-center gap-3">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(iconStyles.circle('emerald'), "w-10 h-10 shadow-md")}
                >
                  <Link2 className="w-4 h-4 text-white" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-gray-900">{title}</p>
                  <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
                </div>
                {/* Close button for mobile */}
                <DrawerClose asChild>
                  <button className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </DrawerClose>
              </div>
            </DrawerTitle>
          </DrawerHeader>
          
          {/* Form Content - Scrollable with keyboard-aware padding */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain px-5 py-4"
            style={{ 
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
            }}
          >
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog - Enhanced
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="text-right p-5 pb-4 bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-100">
          <DialogTitle asChild>
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(iconStyles.circle('emerald'), "w-12 h-12 shadow-md")}
              >
                <Link2 className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <p className="text-lg font-bold text-gray-900">{title}</p>
                <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="p-5 pt-4 max-h-[65vh] overflow-y-auto">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddLinkModal;
