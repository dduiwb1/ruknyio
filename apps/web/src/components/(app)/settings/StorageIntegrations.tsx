'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HardDrive, 
  FileImage, 
  Trash2, 
  RefreshCw,
  AlertTriangle,
  Image,
  File,
  Calendar,
  ShoppingBag,
  ClipboardList,
  ChevronDown,
  Loader2,
  RotateCcw,
  Trash,
  Search,
  ArrowUpDown,
  Download,
  X,
  CheckSquare,
  Check as CheckIcon
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStorage, formatBytes, getCategoryLabel, FileCategory, UserFile } from '@/lib/hooks/settings/useStorage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

type SortBy = 'date' | 'name' | 'size';
type SortOrder = 'asc' | 'desc';

// Confirmation dialog state type
interface ConfirmState {
  open: boolean;
  type: 'delete' | 'permanentDelete' | 'bulkDelete';
  fileId?: string;
  fileName?: string;
  count?: number;
}

export function StorageIntegrations() {
  const { 
    usage, 
    isLoading, 
    error,
    getStorageUsage, 
    getFiles,
    deleteFile,
    restoreFile,
    permanentDeleteFile,
  } = useStorage();
  
  const [files, setFiles] = useState<UserFile[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [trashFiles, setTrashFiles] = useState<UserFile[]>([]);
  const [totalTrash, setTotalTrash] = useState(0);
  const [showFiles, setShowFiles] = useState(false);
  const [fileView, setFileView] = useState<'active' | 'trash'>('active');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [permanentDeletingId, setPermanentDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, type: 'delete' });

  useEffect(() => {
    getStorageUsage();
    loadFiles();
    loadTrash();
  }, [getStorageUsage]);

  const loadFiles = async (category?: FileCategory | 'ALL') => {
    const result = await getFiles({ 
      category: !category || category === 'ALL' ? undefined : category,
      limit: 50,
      deletedOnly: false,
    });
    if (result) {
      setFiles(result.files);
      setTotalFiles(result.total);
    }
  };

  const loadTrash = async () => {
    const result = await getFiles({ limit: 50, deletedOnly: true });
    if (result) {
      setTrashFiles(result.files);
      setTotalTrash(result.total);
    }
  };

  const handleCategoryChange = (category: FileCategory | 'ALL') => {
    setSelectedCategory(category);
    loadFiles(category === 'ALL' ? undefined : category);
  };

  // Open confirmation dialog for single file delete
  const openDeleteConfirm = (fileId: string, fileName: string) => {
    setConfirmState({ open: true, type: 'delete', fileId, fileName });
  };

  // Open confirmation dialog for permanent delete
  const openPermanentDeleteConfirm = (fileId: string, fileName: string) => {
    setConfirmState({ open: true, type: 'permanentDelete', fileId, fileName });
  };

  // Open confirmation dialog for bulk delete
  const openBulkDeleteConfirm = () => {
    if (selectedIds.size === 0) return;
    setConfirmState({ open: true, type: 'bulkDelete', count: selectedIds.size });
  };

  // Close confirmation dialog
  const closeConfirm = () => {
    setConfirmState({ open: false, type: 'delete' });
  };

  // Execute delete action after confirmation
  const executeDelete = async () => {
    const { type, fileId, fileName } = confirmState;
    closeConfirm();

    if (type === 'delete' && fileId) {
      setDeletingId(fileId);
      const success = await deleteFile(fileId);
      
      if (success) {
        toast.success('تم نقل الملف إلى سلة المهملات');
        setFiles(files.filter(f => f.id !== fileId));
        setTotalFiles(prev => prev - 1);
        loadTrash();
      } else {
        toast.error('فشل في حذف الملف');
      }
      setDeletingId(null);
    } else if (type === 'permanentDelete' && fileId) {
      setPermanentDeletingId(fileId);
      const success = await permanentDeleteFile(fileId);
      if (success) {
        toast.success('تم الحذف النهائي للملف');
        setTrashFiles(trashFiles.filter(f => f.id !== fileId));
        setTotalTrash(prev => prev - 1);
        getStorageUsage();
      } else {
        toast.error('فشل في الحذف النهائي');
      }
      setPermanentDeletingId(null);
    } else if (type === 'bulkDelete') {
      let ok = 0;
      for (const id of selectedIds) {
        const success = await deleteFile(id);
        if (success) {
          ok++;
          setFiles((prev) => prev.filter((f) => f.id !== id));
          setTotalFiles((p) => p - 1);
        }
      }
      setSelectedIds(new Set());
      loadTrash();
      getStorageUsage();
      toast.success(`تم نقل ${ok} ملف إلى سلة المهملات`);
    }
  };

  const handleDelete = (fileId: string, fileName: string) => {
    openDeleteConfirm(fileId, fileName);
  };

  const handleRestore = async (fileId: string, fileName: string) => {
    setRestoringId(fileId);
    const success = await restoreFile(fileId);
    
    if (success) {
      toast.success(`تم استرداد "${fileName}" بنجاح`);
      setTrashFiles(trashFiles.filter(f => f.id !== fileId));
      setTotalTrash(prev => prev - 1);
      loadFiles();
    } else {
      toast.error('فشل في استرداد الملف');
    }
    
    setRestoringId(null);
  };

  const handlePermanentDelete = (fileId: string, fileName: string) => {
    openPermanentDeleteConfirm(fileId, fileName);
  };

  /** عدد الأيام المتبقية قبل الحذف النهائي (من تاريخ deletedAt + 30 يوم) */
  const getDaysUntilPermanentDelete = (deletedAt: string | null | undefined): number | null => {
    if (!deletedAt) return null;
    const deleted = new Date(deletedAt);
    const permanentAt = new Date(deleted);
    permanentAt.setDate(permanentAt.getDate() + 30);
    const now = new Date();
    const days = Math.ceil((permanentAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const isImageFile = (file: UserFile) => (file.fileType || '').startsWith('image/');

  /** قائمة الملفات النشطة بعد البحث والترتيب */
  const filteredAndSortedFiles = useMemo(() => {
    let list = [...files];
    const q = searchQuery.trim().toLowerCase();
    if (q) list = list.filter((f) => f.fileName.toLowerCase().includes(q));
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortBy === 'name') cmp = (a.fileName || '').localeCompare(b.fileName || '');
      else if (sortBy === 'size') cmp = a.fileSize - b.fileSize;
      return sortOrder === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [files, searchQuery, sortBy, sortOrder]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size >= filteredAndSortedFiles.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAndSortedFiles.map((f) => f.id)));
  };

  const handleDeleteSelected = () => {
    openBulkDeleteConfirm();
  };

  const handleDownload = (file: UserFile) => {
    if (file.url) window.open(file.url, '_blank', 'noopener');
  };

  const percentage = usage?.percentage || 0;
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;

  const getProgressColor = () => {
    if (isCritical) return 'bg-destructive';
    if (isWarning) return 'bg-amber-500';
    return 'bg-primary';
  };

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'AVATAR':
      case 'COVER':
        return Image;
      case 'FORM_COVER':
      case 'FORM_BANNER':
      case 'FORM_SUBMISSION':
        return ClipboardList;
      case 'EVENT_COVER':
      case 'EVENT_GALLERY':
        return Calendar;
      case 'PRODUCT_IMAGE':
        return ShoppingBag;
      default:
        return File;
    }
  };

  const categories: { id: FileCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'الكل' },
    { id: 'AVATAR', label: 'صور شخصية' },
    { id: 'COVER', label: 'أغلفة' },
    { id: 'FORM_COVER', label: 'نماذج' },
    { id: 'EVENT_COVER', label: 'أحداث' },
    { id: 'PRODUCT_IMAGE', label: 'منتجات' },
  ];

  // Loading State
  if (isLoading && !usage) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-xs sm:text-sm mt-4">جاري تحميل معلومات التخزين...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-foreground font-semibold text-sm sm:text-base mb-1">فشل في التحميل</p>
        <p className="text-muted-foreground text-xs sm:text-sm mb-5">{error}</p>
        <button
          onClick={() => getStorageUsage()}
          className="px-4 py-2 bg-primary text-primary-foreground text-xs sm:text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Storage Card */}
      <div className="bg-card rounded-4xl border border-border/50 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base text-foreground">مساحة التخزين</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">إدارة الملفات المرفوعة</p>
            </div>
          </div>
          
          <button
            onClick={() => getStorageUsage()}
            disabled={isLoading}
            className="p-2 hover:bg-muted/50 rounded-lg transition-colors disabled:opacity-50"
            aria-label="تحديث"
          >
            <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {usage ? formatBytes(usage.used) : '0'} / {usage ? formatBytes(usage.limit) : '5 GB'}
            </span>
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-md",
              isCritical ? "bg-destructive/10 text-destructive" : isWarning ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
            )}>
              {percentage}%
            </span>
          </div>
          
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              style={{ width: `${percentage}%` }}
              className={cn("h-full rounded-full transition-all duration-500", getProgressColor())}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3  gap-2 sm:gap-3">
          <div className="text-center p-3 sm:p-4 bg-muted/40 rounded-2xl">
            <p className="text-sm sm:text-base font-semibold text-foreground">{usage ? formatBytes(usage.used) : '0'}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">مستخدم</p>
            {usage?.trashUsed != null && usage.trashUsed > 0 && (
              <p className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 mt-1.5">
                منها {formatBytes(usage.trashUsed)}
              </p>
            )}
          </div>
          <div className="text-center p-3  sm:p-4 bg-primary/5 rounded-2xl">
            <p className="text-sm sm:text-base font-semibold text-primary">{usage ? formatBytes(usage.available) : '0'}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">متبقي</p>
          </div>
          <div className="text-center p-3 sm:p-4 bg-muted/40 rounded-2xl">
            <p className="text-sm sm:text-base font-semibold text-foreground">{usage?.files || 0}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">ملف</p>
          </div>
        </div>


        {/* Warning */}
        {isWarning && (
          <div className={cn(
            "mt-6 p-3 sm:p-4 rounded-lg flex items-start gap-3",
            isCritical ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"
          )}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm">
              {isCritical ? 'المساحة على وشك النفاد! قم بحذف بعض الملفات.' : 'المساحة تقترب من الحد الأقصى'}
            </p>
          </div>
        )}
      </div>

      {/* Files Section */}
      <div className="bg-card rounded-4xl border border-border/50 overflow-hidden">
        <button
          onClick={() => setShowFiles(!showFiles)}
          className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileImage className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-sm sm:text-base text-foreground">
              الملفات ({totalFiles}) {totalTrash > 0 && `• سلة المهملات (${totalTrash})`}
            </span>
          </div>
          <ChevronDown className={cn(
            "w-5 h-5 text-muted-foreground transition-transform",
            showFiles && "rotate-180"
          )} />
        </button>

        {showFiles && (
          <div>
            {/* Tabs: الملفات | سلة المهملات */}
            <div className="px-4 sm:px-6 pt-4 border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setFileView('active'); setSelectedIds(new Set()); }}
                  className={cn(
                    "h-10 px-4 rounded-full text-sm font-medium flex items-center gap-2 transition-all border",
                    fileView === 'active'
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border/50 hover:border-border"
                  )}
                >
                  <FileImage className="w-4 h-4" />
                  الملفات ({totalFiles})
                </button>
                <button
                  onClick={() => { setFileView('trash'); setSelectedIds(new Set()); }}
                  className={cn(
                    "h-10 px-4 rounded-full text-sm font-medium flex items-center gap-2 transition-all border",
                    fileView === 'trash'
                      ? "bg-foreground text-background border-foreground"
                      : "bg-card text-foreground border-border/50 hover:border-border"
                  )}
                >
                  <Trash className="w-4 h-4" />
                  سلة المهملات ({totalTrash})
                </button>
              </div>
            </div>

            {fileView === 'active' && (
              <>
                {/* Category Filter */}
                <div className="px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "h-10 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                        selectedCategory === cat.id
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card text-foreground border-border/50 hover:border-border"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search + Sort + Multi-delete */}
                <div className="px-4 sm:px-6 py-3 border-t border-border/50 flex flex-wrap items-center gap-2">
                  {/* Search Button / Input */}
                  <AnimatePresence mode="wait">
                    {searchQuery || showSearch ? (
                      <motion.div
                        key="search-input"
                        initial={{ width: 44, opacity: 0 }}
                        animate={{ width: 200, opacity: 1 }}
                        exit={{ width: 44, opacity: 0 }}
                        className="relative"
                      >
                        <input
                          type="text"
                          autoFocus
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="بحث بالاسم..."
                          className="w-full h-11 pr-4 pl-10 bg-card rounded-full text-sm border border-border/50 focus:border-border focus:outline-none"
                          onBlur={() => !searchQuery && setShowSearch(false)}
                        />
                        <button
                          onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="search-button"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowSearch(true)}
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-card border border-border/50 hover:border-border transition-colors"
                      >
                        <Search className="w-5 h-5 text-muted-foreground" />
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 h-11 px-4 bg-card rounded-full border border-border/50 hover:border-border transition-colors">
                        <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">ترتيب</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[140px] rounded-2xl">
                      <DropdownMenuItem
                        onClick={() => { setSortBy('date'); setSortOrder('desc'); }}
                        className={cn("text-sm cursor-pointer", sortBy === 'date' && sortOrder === 'desc' && "bg-muted font-medium")}
                      >
                        الأحدث
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSortBy('date'); setSortOrder('asc'); }}
                        className={cn("text-sm cursor-pointer", sortBy === 'date' && sortOrder === 'asc' && "bg-muted font-medium")}
                      >
                        الأقدم
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSortBy('name'); setSortOrder('asc'); }}
                        className={cn("text-sm cursor-pointer", sortBy === 'name' && sortOrder === 'asc' && "bg-muted font-medium")}
                      >
                        الاسم أ–ي
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSortBy('name'); setSortOrder('desc'); }}
                        className={cn("text-sm cursor-pointer", sortBy === 'name' && sortOrder === 'desc' && "bg-muted font-medium")}
                      >
                        الاسم ي–أ
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSortBy('size'); setSortOrder('desc'); }}
                        className={cn("text-sm cursor-pointer", sortBy === 'size' && sortOrder === 'desc' && "bg-muted font-medium")}
                      >
                        الأكبر
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { setSortBy('size'); setSortOrder('asc'); }}
                        className={cn("text-sm cursor-pointer", sortBy === 'size' && sortOrder === 'asc' && "bg-muted font-medium")}
                      >
                        الأصغر
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Select All Button */}
                  {filteredAndSortedFiles.length > 0 && (
                    <button
                      onClick={toggleSelectAll}
                      className={cn(
                        "flex items-center gap-2 h-11 px-4 rounded-full text-sm font-medium transition-all border",
                        selectedIds.size === filteredAndSortedFiles.length
                          ? "bg-foreground text-background border-foreground"
                          : "bg-card text-foreground border-border/50 hover:border-border"
                      )}
                    >
                      {selectedIds.size === filteredAndSortedFiles.length ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <CheckSquare className="w-4 h-4" />
                      )}
                      {selectedIds.size > 0 ? `محدد (${selectedIds.size})` : 'تحديد الكل'}
                    </button>
                  )}

                  {/* Delete Selected Button */}
                  {selectedIds.size > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      disabled={!!deletingId}
                      className="flex items-center gap-2 h-11 px-4 rounded-full text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف ({selectedIds.size})
                    </button>
                  )}
                </div>

                {/* Active Files List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredAndSortedFiles.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 bg-muted/60 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FileImage className="w-5 h-5 text-muted-foreground/60" />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {files.length === 0 ? 'لا توجد ملفات' : 'لا توجد نتائج للبحث'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {filteredAndSortedFiles.map((file) => {
                        const Icon = getCategoryIcon(file.category);
                        const selected = selectedIds.has(file.id);
                        return (
                          <div
                            key={file.id}
                            className={cn(
                              "px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-3 hover:bg-muted/30 transition-colors",
                              selected && "bg-primary/5"
                            )}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}
                                className={cn(
                                  "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                                  selected 
                                    ? "bg-primary border-primary text-primary-foreground" 
                                    : "border-border hover:border-primary/50"
                                )}
                              >
                                {selected && <CheckIcon className="w-3 h-3" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => (isImageFile(file) ? setPreviewFile(file) : null)}
                                className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 text-right"
                              >
                                <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                                  <Icon className="w-4 h-4 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-foreground truncate">{file.fileName}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                                    {getCategoryLabel(file.category)} • {formatBytes(file.fileSize)}
                                  </p>
                                </div>
                              </button>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleDownload(file)}
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="تنزيل"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {isImageFile(file) && (
                                <button
                                  onClick={() => setPreviewFile(file)}
                                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hidden sm:block"
                                  title="معاينة"
                                >
                                  <Image className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(file.id, file.fileName)}
                                disabled={deletingId === file.id}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                                title="نقل إلى سلة المهملات"
                              >
                                {deletingId === file.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}

            {fileView === 'trash' && (
              <div className="max-h-80 overflow-y-auto">
                <p className="px-4 sm:px-6 py-3 text-xs sm:text-sm text-muted-foreground border-b border-border/50">
                  الملفات هنا تُحذف نهائياً بعد 30 يوماً. يمكنك استردادها أو حذفها نهائياً الآن.
                </p>
                {trashFiles.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-muted/60 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Trash className="w-5 h-5 text-muted-foreground/60" />
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">سلة المهملات فارغة</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {trashFiles.map((file) => {
                      const Icon = getCategoryIcon(file.category);
                      const daysLeft = getDaysUntilPermanentDelete(file.deletedAt);
                      return (
                        <div
                          key={file.id}
                          className="px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-foreground truncate">{file.fileName}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                {getCategoryLabel(file.category)} • {formatBytes(file.fileSize)}
                                {daysLeft !== null && (
                                  <span className="text-amber-600 dark:text-amber-400">
                                    {' '}• بعد {daysLeft}d
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownload(file)}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="تنزيل"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRestore(file.id, file.fileName)}
                              disabled={restoringId === file.id}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 hidden sm:block"
                              title="استرداد الملف"
                            >
                              {restoringId === file.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(file.id, file.fileName)}
                              disabled={permanentDeletingId === file.id}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                              title="حذف نهائي"
                            >
                              {permanentDeletingId === file.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* معاينة الصورة في Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent 
          dir="rtl" 
          className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none shadow-none"
          showCloseButton={false}
        >
          <div className="relative flex items-center justify-center">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-10 left-0 p-2 rounded-lg bg-background text-foreground hover:bg-muted transition-colors border border-border"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
            {previewFile && isImageFile(previewFile) ? (
              <img
                src={previewFile.url}
                alt={previewFile.fileName}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-lg"
              />
            ) : previewFile && (
              <div className="bg-card rounded-lg p-6 text-center border border-border">
                <File className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-foreground mb-2">{previewFile.fileName}</p>
                <p className="text-xs text-muted-foreground mb-4">{formatBytes(previewFile.fileSize)}</p>
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  فتح / تنزيل
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmState.open} onOpenChange={(open) => !open && closeConfirm()}>
        <AlertDialogContent dir="rtl" className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">
              {confirmState.type === 'permanentDelete' ? 'هل أنت متأكد تماماً؟' : 'هل أنت متأكد؟'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right text-muted-foreground">
              {confirmState.type === 'delete' && (
                <>
                  سيتم نقل <span className="font-semibold text-foreground">"{confirmState.fileName}"</span> إلى سلة المهملات.
                  <br />
                  <span className="text-xs">سيُحذف نهائياً بعد 30 يوماً.</span>
                </>
              )}
              {confirmState.type === 'permanentDelete' && (
                <>
                  لا يمكن التراجع عن هذا الإجراء. سيتم حذف <span className="font-semibold text-foreground">"{confirmState.fileName}"</span> نهائياً من الخوادم.
                </>
              )}
              {confirmState.type === 'bulkDelete' && (
                <>
                  سيتم نقل <span className="font-semibold text-foreground">{confirmState.count} ملف</span> إلى سلة المهملات.
                  <br />
                  <span className="text-xs">ستُحذف نهائياً بعد 30 يوماً.</span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 sm:flex-row sm:justify-end">
            <AlertDialogCancel className="mt-0">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDelete}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              متابعة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
