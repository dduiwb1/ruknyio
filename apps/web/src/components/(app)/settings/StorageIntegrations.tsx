'use client';

import { useEffect, useState, useMemo } from 'react';
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
  X
} from 'lucide-react';
import { useStorage, formatBytes, getCategoryLabel, FileCategory, UserFile } from '@/lib/hooks/settings/useStorage';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SortBy = 'date' | 'name' | 'size';
type SortOrder = 'asc' | 'desc';

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
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);

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

  const handleDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`نقل "${fileName}" إلى سلة المهملات؟ سيُحذف نهائياً بعد 30 يوماً.`)) return;
    
    setDeletingId(fileId);
    const success = await deleteFile(fileId);
    
    if (success) {
      toast.success('تم نقل الملف إلى سلة المهملات (يُحذف نهائياً بعد 30 يوم)');
      setFiles(files.filter(f => f.id !== fileId));
      setTotalFiles(prev => prev - 1);
      loadTrash();
    } else {
      toast.error('فشل في حذف الملف');
    }
    
    setDeletingId(null);
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

  const handlePermanentDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`حذف "${fileName}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
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

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`نقل ${selectedIds.size} ملف إلى سلة المهملات؟`)) return;
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
        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground text-sm mt-4">جاري تحميل معلومات التخزين...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-destructive/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-foreground font-semibold text-base mb-1">فشل في التحميل</p>
        <p className="text-muted-foreground text-sm mb-5">{error}</p>
        <button
          onClick={() => getStorageUsage()}
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Storage Card */}
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <HardDrive className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground">مساحة التخزين</h3>
              <p className="text-sm text-muted-foreground">إدارة الملفات المرفوعة</p>
            </div>
          </div>
          
          <button
            onClick={() => getStorageUsage()}
            className="p-2.5 hover:bg-muted rounded-xl transition-colors"
          >
            <RefreshCw className={cn("w-5 h-5 text-muted-foreground", isLoading && "animate-spin")} />
          </button>
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {usage ? formatBytes(usage.used) : '0'} / {usage ? formatBytes(usage.limit) : '5 GB'}
            </span>
            <span className={cn(
              "text-sm font-medium px-2 py-1 rounded-lg",
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
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <p className="text-lg font-semibold text-foreground">{usage ? formatBytes(usage.used) : '0'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">مستخدم</p>
            {usage?.trashUsed != null && usage.trashUsed > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                منها {formatBytes(usage.trashUsed)} في سلة المهملات
              </p>
            )}
          </div>
          <div className="text-center p-4 bg-primary/5 rounded-xl">
            <p className="text-lg font-semibold text-primary">{usage ? formatBytes(usage.available) : '0'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">متبقي</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <p className="text-lg font-semibold text-foreground">{usage?.files || 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ملف</p>
          </div>
        </div>

        {/* استخدام التخزين حسب النوع */}
        {usage?.categoryBreakdown && Object.keys(usage.categoryBreakdown).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">استخدام التخزين حسب النوع</p>
            <div className="space-y-2">
              {Object.entries(usage.categoryBreakdown)
                .filter(([, size]) => size > 0)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, size]) => {
                  const pct = usage?.used ? Math.round((size / usage.used) * 100) : 0;
                  return (
                    <div key={cat} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-24 truncate">
                        {getCategoryLabel(cat as FileCategory)}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <span className="text-sm text-foreground w-16 text-left">
                        {formatBytes(size)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Warning */}
        {isWarning && (
          <div className={cn(
            "mt-4 p-4 rounded-xl flex items-center gap-3",
            isCritical ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-600"
          )}>
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              {isCritical ? 'المساحة على وشك النفاد! قم بحذف بعض الملفات.' : 'المساحة تقترب من الحد الأقصى'}
            </p>
          </div>
        )}
      </div>

      {/* Files Section */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setShowFiles(!showFiles)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <FileImage className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="font-semibold text-base text-foreground">
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
            <div className="px-5 pt-3 border-t border-border flex gap-2">
              <button
                onClick={() => { setFileView('active'); setSelectedIds(new Set()); }}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors",
                  fileView === 'active'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <FileImage className="w-4 h-4" />
                الملفات ({totalFiles})
              </button>
              <button
                onClick={() => { setFileView('trash'); setSelectedIds(new Set()); }}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors",
                  fileView === 'trash'
                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Trash className="w-4 h-4" />
                سلة المهملات ({totalTrash})
              </button>
            </div>

            {fileView === 'active' && (
              <>
                {/* Category Filter */}
                <div className="px-5 py-3 flex gap-2 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                        selectedCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search + Sort + Multi-delete */}
                <div className="px-5 py-3 border-t border-border flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="بحث بالاسم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 text-sm bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [s, o] = e.target.value.split('-') as [SortBy, SortOrder];
                        setSortBy(s);
                        setSortOrder(o);
                      }}
                      className="text-sm bg-muted border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="date-desc">الأحدث</option>
                      <option value="date-asc">الأقدم</option>
                      <option value="name-asc">الاسم أ–ي</option>
                      <option value="name-desc">الاسم ي–أ</option>
                      <option value="size-desc">الأكبر</option>
                      <option value="size-asc">الأصغر</option>
                    </select>
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                  {filteredAndSortedFiles.length > 0 && (
                    <>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === filteredAndSortedFiles.length}
                          onChange={toggleSelectAll}
                          className="rounded border-border w-4 h-4"
                        />
                        تحديد الكل
                      </label>
                      {selectedIds.size > 0 && (
                        <button
                          onClick={handleDeleteSelected}
                          disabled={!!deletingId}
                          className="px-3 py-2 text-sm font-medium rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                        >
                          حذف المحدد ({selectedIds.size})
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Active Files List */}
                <div className="max-h-80 overflow-y-auto">
                  {filteredAndSortedFiles.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                        <FileImage className="w-7 h-7 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {files.length === 0 ? 'لا توجد ملفات' : 'لا توجد نتائج للبحث'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filteredAndSortedFiles.map((file) => {
                        const Icon = getCategoryIcon(file.category);
                        const selected = selectedIds.has(file.id);
                        return (
                          <div
                            key={file.id}
                            className={cn(
                              "px-5 py-3 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors",
                              selected && "bg-primary/5"
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleSelect(file.id)}
                                onClick={(e) => e.stopPropagation()}
                                className="rounded border-border shrink-0 w-4 h-4"
                              />
                              <button
                                type="button"
                                onClick={() => (isImageFile(file) ? setPreviewFile(file) : null)}
                                className="flex items-center gap-3 min-w-0 flex-1 text-right"
                              >
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                  <Icon className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {getCategoryLabel(file.category)} • {formatBytes(file.fileSize)}
                                  </p>
                                </div>
                              </button>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleDownload(file)}
                                className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                title="تنزيل"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                              {isImageFile(file) && (
                                <button
                                  onClick={() => setPreviewFile(file)}
                                  className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                  title="معاينة"
                                >
                                  <Image className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(file.id, file.fileName)}
                                disabled={deletingId === file.id}
                                className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors disabled:opacity-50"
                                title="نقل إلى سلة المهملات"
                              >
                                {deletingId === file.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
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
                <p className="px-5 py-3 text-sm text-muted-foreground border-b border-border">
                  الملفات هنا تُحذف نهائياً بعد 30 يوماً. يمكنك استردادها أو حذفها نهائياً الآن.
                </p>
                {trashFiles.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Trash className="w-7 h-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground text-sm">سلة المهملات فارغة</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {trashFiles.map((file) => {
                      const Icon = getCategoryIcon(file.category);
                      const daysLeft = getDaysUntilPermanentDelete(file.deletedAt);
                      return (
                        <div
                          key={file.id}
                          className="px-5 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {getCategoryLabel(file.category)} • {formatBytes(file.fileSize)}
                                {daysLeft !== null && (
                                  <span className="text-amber-600 dark:text-amber-400">
                                    {' '}• يُحذف تلقائياً بعد {daysLeft} يوم
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownload(file)}
                              className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="تنزيل"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRestore(file.id, file.fileName)}
                              disabled={restoringId === file.id}
                              className="p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              title="استرداد الملف"
                            >
                              {restoringId === file.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <RotateCcw className="w-5 h-5" />
                                  <span className="text-xs hidden sm:inline">استرداد</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(file.id, file.fileName)}
                              disabled={permanentDeletingId === file.id}
                              className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                              title="حذف نهائي (بدون انتظار 30 يوم)"
                            >
                              {permanentDeletingId === file.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Trash className="w-5 h-5" />
                                  <span className="text-xs hidden sm:inline">حذف نهائي</span>
                                </>
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

      {/* معاينة الصورة في مودال */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-10 left-0 p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
            {isImageFile(previewFile) ? (
              <img
                src={previewFile.url}
                alt={previewFile.fileName}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-xl"
              />
            ) : (
              <div className="bg-card rounded-lg p-6 text-center">
                <File className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
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
        </div>
      )}
    </div>
  );
}
