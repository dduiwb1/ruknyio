'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Loader2,
  Check,
  Globe,
  Eye,
  EyeOff,
  X,
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
    const platforms = KNOWN_PLATFORMS.filter(p => p.key !== 'website');
    if (activeCategory === 'all') {
      return platforms;
    }
    return platforms.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="space-y-2.5">
      {/* Auto-detected badge */}
      <AnimatePresence>
        {detectedPlatform && detectedPlatform.key !== 'website' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-500/10 rounded-lg"
          >
            <div 
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${detectedPlatform.color}12` }}
            >
              <PlatformIcon 
                platformData={detectedPlatform}
                size="sm"
              />
            </div>
            <p className="text-xs text-green-700 dark:text-green-400 flex-1">تم التعرف: <span className="font-medium">{detectedPlatform.nameAr}</span></p>
            <Check className="w-3.5 h-3.5 text-green-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors",
              activeCategory === cat.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Platform grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-1 max-h-[160px] overflow-y-auto">
        {filteredPlatforms.map((platform) => {
          const isSelected = selectedPlatform === platform.key;
          const isDetected = detectedPlatform?.key === platform.key;
          
          return (
            <button
              key={platform.key}
              type="button"
              onClick={() => onSelect(platform)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all",
                isSelected 
                  ? "bg-primary/10 ring-1 ring-primary/30" 
                  : "hover:bg-muted",
                isDetected && !isSelected && "ring-1 ring-green-300/50"
              )}
            >
              <div 
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${platform.color}12` }}
              >
                <PlatformIcon 
                  platformData={platform}
                  size="sm"
                />
              </div>
              <span className={cn(
                "text-[9px] font-medium text-center leading-tight line-clamp-1",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {platform.nameAr}
              </span>
              
              {isSelected && (
                <motion.div
                  layoutId="platform-check"
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-2 h-2 text-primary-foreground" />
                </motion.div>
              )}
            </button>
          );
        })}
        
        {/* Other/Website option */}
        <button
          type="button"
          onClick={() => {
            const websitePlatform = KNOWN_PLATFORMS.find(p => p.key === 'website');
            if (websitePlatform) onSelect(websitePlatform);
          }}
          className={cn(
            "relative flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all",
            selectedPlatform === 'website' 
              ? "bg-primary/10 ring-1 ring-primary/30" 
              : "hover:bg-muted"
          )}
        >
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-muted">
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
          <span className="text-[9px] font-medium text-muted-foreground">أخرى</span>
          
          {selectedPlatform === 'website' && (
            <motion.div
              layoutId="platform-check"
              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center"
            >
              <Check className="w-2 h-2 text-primary-foreground" />
            </motion.div>
          )}
        </button>
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
      <div className="flex-1 p-2 space-y-5 overflow-y-auto overscroll-contain">
        {/* URL Input */}
        <div>
          <Label className="text-[13px] font-medium text-foreground mb-2 block">الصق رابطك هنا</Label>
          <div className="relative">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://instagram.com/username"
              className={cn(
                "h-12 rounded-2xl pl-4 pr-11 text-sm bg-muted/30 border transition-colors",
                "focus:bg-card focus:border-foreground/30 focus:ring-0",
                "placeholder:text-muted-foreground/40 text-left",
                urlError 
                  ? "border-destructive/40 bg-destructive/5" 
                  : "border-border/60"
              )}
              dir="ltr"
              autoComplete="off"
              autoCapitalize="off"
              enterKeyHint="next"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
              ) : detectedPlatform && !urlError ? (
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/15 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                </div>
              ) : urlError ? (
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                  <X className="w-3.5 h-3.5 text-destructive" />
                </div>
              ) : (
                <Link2 className="w-4 h-4 text-muted-foreground/30" />
              )}
            </div>
          </div>
          {urlError && (
            <p className="text-[11px] text-destructive mt-1.5 pr-1">{urlError}</p>
          )}
        </div>

        {/* Platform Detection */}
        <AnimatePresence>
          {detectedPlatform && detectedPlatform.key !== 'website' && !urlError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-2.5 p-2.5 bg-green-50 dark:bg-green-500/10 rounded-xl"
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${detectedPlatform.color}12` }}
              >
                <PlatformIcon 
                  platformData={detectedPlatform}
                  size="sm"
                />
              </div>
              <p className="text-[13px] text-green-700 dark:text-green-400 flex-1">تم التعرف: <span className="font-semibold">{detectedPlatform.nameAr}</span></p>
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title Input */}
        <div>
          <Label className="text-[13px] font-medium text-foreground mb-2 block">
            العنوان <span className="text-muted-foreground/50 font-normal">(اختياري)</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 50))}
            placeholder={detectedPlatform?.nameAr || "عنوان مخصص للرابط"}
            maxLength={50}
            className="h-12 rounded-2xl bg-muted/30 border border-border/60 text-sm focus:bg-card focus:border-foreground/30 focus:ring-0 transition-colors"
            enterKeyHint="done"
          />
        </div>
      </div>

      {/* Actions Footer */}
      <div 
        className="flex gap-3 pt-5 mt-2 flex-shrink-0"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-12 rounded-2xl text-sm font-medium border-border/60 hover:bg-muted/50"
        >
          إلغاء
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !isFormValid}
          className="flex-1 h-12 rounded-2xl text-sm font-medium bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحفظ...
            </span>
          ) : editingLink ? (
            'حفظ التغييرات'
          ) : (
            <span className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              إضافة الرابط
            </span>
          )}
        </Button>
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

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent 
          className="rounded-t-[20px] border-0 bg-card flex flex-col"
          style={{ 
            maxHeight: '88dvh',
            height: 'auto',
          }}
        >
          {/* Handle bar */}
          <div className="mx-auto w-9 h-1 flex-shrink-0 rounded-full bg-muted-foreground/20 mt-2.5" />
          
          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-4 pb-1 flex-shrink-0">
            <DrawerClose asChild>
              <button className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </DrawerClose>
            <DrawerHeader className="flex-1 text-center p-0">
              <DrawerTitle asChild>
                <div>
                  <p className="text-lg font-bold text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                </div>
              </DrawerTitle>
            </DrawerHeader>
            {/* Invisible spacer for centering */}
            <div className="w-8 flex-shrink-0" />
          </div>
          
          {/* Form Content */}
          <div 
            className="flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-5"
            style={{ 
              paddingBottom: 'env(safe-area-inset-bottom, 20px)',
            }}
          >
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[420px] rounded-2xl p-0 border border-border/40 shadow-xl gap-0"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <button 
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0 order-first"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <DialogHeader className="flex-1 text-center sm:text-center">
            <DialogTitle asChild>
              <div>
                <p className="text-lg font-bold text-foreground">{title}</p>
                <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {/* Invisible spacer for centering */}
          <div className="w-8 flex-shrink-0" />
        </div>
        <div className="px-6 pb-6 pt-5 max-h-[65vh] overflow-y-auto">
          {formContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddLinkModal;
