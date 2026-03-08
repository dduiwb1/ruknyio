'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileText, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CreateFormWizard, type FormDraftRestore } from '@/components/(app)/forms';
import { isValidFormSlug } from '@/lib/utils/generateFormSlug';

// LocalStorage key for form draft persistence (must match CreateFormWizard)
const FORM_DRAFT_KEY = 'rukny_form_draft';

// Inner component that uses useSearchParams
function CreateFormContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftCleared, setDraftCleared] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState<FormDraftRestore | null>(null);
  const [isValidSlug, setIsValidSlug] = useState(true);

  // Validate slug format
  useEffect(() => {
    if (!slug || !isValidFormSlug(slug)) {
      setIsValidSlug(false);
      return;
    }
  }, [slug]);

  useEffect(() => {
    if (!isValidSlug) return;

    const isNew = searchParams.get('new') === 'true';

    if (isNew) {
      localStorage.removeItem(FORM_DRAFT_KEY);
      setDraftCleared(true);
      setDraftToRestore(null);
      window.history.replaceState({}, '', `/app/forms/create/${slug}`);
      return;
    }

    const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.slug === slug && (draft.currentStep > 1 || draft.title)) {
          setShowDraftDialog(true);
        } else if (draft.slug !== slug) {
          setDraftCleared(true);
        }
      } catch {
        localStorage.removeItem(FORM_DRAFT_KEY);
      }
    }
  }, [searchParams, slug, isValidSlug]);

  const handleContinueDraft = () => {
    const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
    if (savedDraft) {
      try {
        setDraftToRestore(JSON.parse(savedDraft) as FormDraftRestore);
      } catch {
        localStorage.removeItem(FORM_DRAFT_KEY);
      }
    }
    setShowDraftDialog(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(FORM_DRAFT_KEY);
    setDraftCleared(true);
    setDraftToRestore(null);
    setShowDraftDialog(false);
  };

  // Invalid slug - show error
  if (!isValidSlug) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center px-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-100 dark:bg-red-900/30">
            <FileText className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">رابط غير صالح</h1>
          <p className="text-muted-foreground mb-6">
            رمز النموذج في الرابط غير صالح. يرجى إنشاء نموذج جديد.
          </p>
          <Link
            href="/app/forms"
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors inline-block"
          >
            العودة للنماذج
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Draft Dialog */}
      {showDraftDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl shadow-xl p-6 mx-4 max-w-md w-full border border-border"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  لديك مسودة محفوظة
                </h3>
                <p className="text-sm text-muted-foreground">
                  هل تريد متابعة العمل عليها؟
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleContinueDraft}
                className="flex-1 px-4 py-3 bg-foreground text-background rounded-xl font-medium hover:bg-foreground/90 transition-colors"
              >
                متابعة المسودة
              </button>
              <button
                onClick={handleStartFresh}
                className="flex-1 px-4 py-3 border border-border text-foreground rounded-xl font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                البدء من جديد
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-border/40 bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-foreground tracking-tight">Rukny</span>
          <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-muted rounded-md">إنشاء نموذج</span>
        </div>
        <Link
          href="/app/forms"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </Link>
      </header>

      {/* Wizard Content */}
      <div className="flex-1 min-h-0">
        <CreateFormWizard
          key={draftCleared ? 'fresh' : draftToRestore ? 'restored' : 'default'}
          initialDraft={draftToRestore ?? undefined}
          initialSlug={slug}
        />
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function CreateFormLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
    </div>
  );
}

// Main page component wraps content in Suspense
export default function CreateFormWithSlugPage() {
  return (
    <Suspense fallback={<CreateFormLoading />}>
      <CreateFormContent />
    </Suspense>
  );
}
