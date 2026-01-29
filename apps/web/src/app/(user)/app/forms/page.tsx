'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  Plus,
  RefreshCw
} from 'lucide-react';
import { 
  FormsStats,
  FormsFiltersBar,
  FormCard,
  EmptyFormsState,
  DeleteFormModal,
  FormsGridSkeleton,
  FormsStatsSkeleton
} from '@/components/(app)/forms';
import { 
  useForms, 
  Form, 
  FormsFilters,
  FormsStats as StatsType,
  FormsSortOption,
  filterForms,
  sortForms,
  calculateFormsStats
} from '@/lib/hooks/useForms';
import { useRouter } from 'next/navigation';

export default function FormsPage() {
  const router = useRouter();
  const { 
    getMyForms, 
    deleteForm, 
    duplicateForm,
    isLoading 
  } = useForms();
  
  const [forms, setForms] = useState<Form[]>([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [filters, setFilters] = useState<FormsFilters>({});
  const [sortBy, setSortBy] = useState<FormsSortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load forms on mount
  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    setLoadingForms(true);
    const data = await getMyForms();
    setForms(data);
    setLoadingForms(false);
  };

  // Calculate stats
  const stats: StatsType = useMemo(() => {
    return calculateFormsStats(forms);
  }, [forms]);

  // Filter and sort forms
  const filteredForms = useMemo(() => {
    const filtered = filterForms(forms, filters);
    return sortForms(filtered, sortBy);
  }, [forms, filters, sortBy]);

  // Handlers
  const handleCreateForm = () => {
    router.push('/app/forms/create');
  };

  const handleEditForm = (form: Form) => {
    router.push(`/app/forms/${form.id}/edit`);
  };

  const handleViewForm = (form: Form) => {
    router.push(`/app/forms/${form.id}`);
  };

  const handleViewResponses = (form: Form) => {
    router.push(`/app/forms/${form.id}/responses`);
  };

  const handleDuplicateForm = async (form: Form) => {
    const duplicated = await duplicateForm(form.id);
    if (duplicated) {
      setForms(prev => [duplicated, ...prev]);
    }
  };

  const handleDeleteClick = (form: Form) => {
    setFormToDelete(form);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formToDelete) return;
    
    setIsDeleting(true);
    const success = await deleteForm(formToDelete.id);
    
    if (success) {
      setForms(prev => prev.filter(f => f.id !== formToDelete.id));
    }
    
    setIsDeleting(false);
    setDeleteModalOpen(false);
    setFormToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setFormToDelete(null);
  };

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-500">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">نماذجي</h1>
                  <p className="text-sm text-muted-foreground">
                    إنشاء وإدارة النماذج والاستبيانات
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={loadForms}
                  disabled={loadingForms}
                  className={`p-2 sm:p-2.5 rounded-xl  bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 ${loadingForms ? 'animate-spin' : ''}`}
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                
                <button
                  onClick={handleCreateForm}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>إنشاء نموذج</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {loadingForms ? (
              <FormsStatsSkeleton />
            ) : (
              <FormsStats stats={stats} isLoading={loadingForms} />
            )}
          </motion.div>

          {/* Filters */}
          {forms.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FormsFiltersBar 
                filters={filters}
                onFiltersChange={setFilters}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultsCount={filteredForms.length}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </motion.div>
          )}

          {/* Content */}
          <AnimatePresence mode="popLayout">
            {loadingForms ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <FormsGridSkeleton count={6} />
              </motion.div>
            ) : forms.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EmptyFormsState onCreateForm={handleCreateForm} />
              </motion.div>
            ) : filteredForms.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl border border-border/50 bg-card p-8 text-center"
              >
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-foreground mb-1">لا توجد نتائج</h3>
                <p className="text-sm text-muted-foreground">جرب تغيير معايير البحث</p>
              </motion.div>
            ) : (
              <motion.div
                layout
                className={viewMode === 'grid' 
                  ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-3"
                }
              >
                {filteredForms.map((form, index) => (
                  <motion.div
                    key={form.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <FormCard 
                      form={form}
                      onEdit={handleEditForm}
                      onDelete={handleDeleteClick}
                      onView={handleViewForm}
                      onDuplicate={handleDuplicateForm}
                      onViewResponses={handleViewResponses}
                      variant={viewMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Blur Gradient Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteFormModal
        isOpen={deleteModalOpen}
        formTitle={formToDelete?.title || ''}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
