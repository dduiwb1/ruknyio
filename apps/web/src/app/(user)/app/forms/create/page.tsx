'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CreateFormWizard } from '@/components/(app)/forms';

// LocalStorage key for form draft persistence (must match CreateFormWizard)
const FORM_DRAFT_KEY = 'rukny_form_draft';

// Inner component that uses useSearchParams
function CreateFormContent() {
  const searchParams = useSearchParams();
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftCleared, setDraftCleared] = useState(false);

  useEffect(() => {
    // Check if we should clear draft (coming from a "new form" action)
    const isNew = searchParams.get('new') === 'true';
    
    if (isNew) {
      // Clear any existing draft when explicitly creating new form
      localStorage.removeItem(FORM_DRAFT_KEY);
      setDraftCleared(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/app/forms/create');
      return;
    }

    // Check if there's an existing draft
    const savedDraft = localStorage.getItem(FORM_DRAFT_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        // Only show dialog if there's meaningful progress (past step 1 or has title)
        if (draft.currentStep > 1 || draft.title) {
          setHasDraft(true);
          setShowDraftDialog(true);
        }
      } catch {
        localStorage.removeItem(FORM_DRAFT_KEY);
      }
    }
  }, [searchParams]);

  const handleContinueDraft = () => {
    setShowDraftDialog(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(FORM_DRAFT_KEY);
    setDraftCleared(true);
    setShowDraftDialog(false);
  };

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      {/* Draft Dialog */}
      {showDraftDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
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
                className="flex-1 px-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
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

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              href="/app/forms" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للنماذج</span>
            </Link>
          </motion.div>

          {/* Create Form Wizard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Key forces remount when draft is cleared to reset all state */}
            <CreateFormWizard key={draftCleared ? 'fresh' : 'default'} />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function CreateFormLoading() {
  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    </div>
  );
}

// Main page component wraps content in Suspense
export default function CreateFormPage() {
  return (
    <Suspense fallback={<CreateFormLoading />}>
      <CreateFormContent />
    </Suspense>
  );
}
