'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Wrench, 
  MessageSquare, 
  FileText,
  Globe,
  Check,
  ClipboardList,
  UserPlus,
  ShoppingBag,
  Star,
  HelpCircle,
  FormInput,
  Plus,
  MousePointer2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  FORM_TEMPLATES, 
  FormTemplate, 
  TemplateLanguage,
  convertTemplateToFields 
} from './templateData';
import type { FormFieldInput } from '../FieldEditor';

// ============================================
// Types
// ============================================

interface FormTemplateSelectorProps {
  selectedTemplateId: string | null;
  selectedLanguage: TemplateLanguage;
  onSelectTemplate: (templateId: string | null, fields: FormFieldInput[]) => void;
  onLanguageChange: (language: TemplateLanguage) => void;
  onStartFromScratch: () => void;
}

// ============================================
// Icon Map - Updated with more icons
// ============================================

const iconMap: Record<string, React.ElementType> = {
  'mail': Mail,
  'wrench': Wrench,
  'message-square': MessageSquare,
  'clipboard-list': ClipboardList,
  'user-plus': UserPlus,
  'shopping-bag': ShoppingBag,
  'star': Star,
  'help-circle': HelpCircle,
  'form-input': FormInput,
  'file-text': FileText,
};

// ============================================
// Component
// ============================================

export function FormTemplateSelector({
  selectedTemplateId,
  selectedLanguage,
  onSelectTemplate,
  onLanguageChange,
  onStartFromScratch,
}: FormTemplateSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const dragThreshold = 5; // pixels before considering it a drag
  
  const handleSelectTemplate = (template: FormTemplate) => {
    if (isDragging) return;
    const fields = convertTemplateToFields(template, selectedLanguage);
    onSelectTemplate(template.id, fields as FormFieldInput[]);
  };

  const handleLanguageChange = (language: TemplateLanguage) => {
    onLanguageChange(language);
    if (selectedTemplateId) {
      const template = FORM_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (template) {
        const fields = convertTemplateToFields(template, language);
        onSelectTemplate(template.id, fields as FormFieldInput[]);
      }
    }
  };

  // Drag to scroll handlers - only drag after threshold
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    // Small delay to allow click to process before resetting drag state
    setTimeout(() => setIsDragging(false), 10);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isMouseDown || !scrollRef.current) return;
    
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    
    // Only start dragging after threshold
    if (Math.abs(walk) > dragThreshold) {
      setIsDragging(true);
      setShowScrollHint(false);
      setHasScrolled(true);
      e.preventDefault();
      scrollRef.current.scrollLeft = scrollLeft - walk * 1.5;
    }
  }, [isMouseDown, startX, scrollLeft, dragThreshold]);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setStartX(e.touches[0].pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    setShowScrollHint(false);
    setHasScrolled(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [startX, scrollLeft]);

  const handleStartFromScratch = () => {
    if (isDragging) return;
    onStartFromScratch();
  };

  // Hide scroll hint after delay or on scroll
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Detect scroll
  const handleScroll = useCallback(() => {
    if (!hasScrolled) {
      setHasScrolled(true);
      setShowScrollHint(false);
    }
  }, [hasScrolled]);

  return (
    <div className="space-y-4 sm:space-y-5 px-1">
      {/* Header - Centered */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">اختر قالباً</h2>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
          ابدأ بقالب جاهز أو أنشئ من الصفر
        </p>
        
        {/* Language Switcher */}
        <div className="flex items-center justify-center gap-2 pt-1.5 sm:pt-2">
          <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          <div className="flex rounded-full bg-gray-100 dark:bg-gray-800 p-0.5">
            <button
              type="button"
              onClick={() => handleLanguageChange('ar')}
              className={cn(
                "px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200",
                selectedLanguage === 'ar' 
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              عربي
            </button>
            <button
              type="button"
              onClick={() => handleLanguageChange('en')}
              className={cn(
                "px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all duration-200",
                selectedLanguage === 'en' 
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Templates Horizontal Scroll - Drag enabled */}
      <div className="relative -mx-1">
        {/* Scrollable Container with smooth drag */}
        <div 
          ref={scrollRef}
          className={cn(
            "flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 px-1 select-none",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onScroll={handleScroll}
        >
          {/* Start from Scratch - First Item */}
          <button
            type="button"
            onClick={handleStartFromScratch}
            className={cn(
              "relative flex-shrink-0 w-[140px] sm:w-[160px] h-[105px] sm:h-[120px] rounded-xl border-2 border-dashed p-2.5 sm:p-3 transition-all duration-300 ease-out flex flex-col justify-center items-center gap-1.5 sm:gap-2",
              selectedTemplateId === null 
                ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800/50" 
                : "border-gray-300 dark:border-gray-600 active:border-gray-400 dark:active:border-gray-500"
            )}
          >
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300",
              selectedTemplateId === null 
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            )}>
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                من الصفر
              </h3>
              <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">
                نموذج فارغ
              </p>
            </div>
            {selectedTemplateId === null && (
              <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-900 dark:text-white" />
              </div>
            )}
          </button>

          {/* Templates */}
          {FORM_TEMPLATES.map((template) => {
            const isSelected = selectedTemplateId === template.id;
            const IconComponent = iconMap[template.icon] || FileText;
            
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelectTemplate(template)}
                className={cn(
                  "relative flex-shrink-0 w-[140px] sm:w-[160px] h-[105px] sm:h-[120px] rounded-xl border p-2.5 sm:p-3 transition-all duration-300 ease-out",
                  isSelected 
                    ? "border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800/50" 
                    : "border-gray-200 dark:border-gray-700 active:border-gray-300 dark:active:border-gray-600"
                )}
              >
                {/* Icon & Check */}
                <div className="flex items-start justify-between mb-1.5 sm:mb-2">
                  <div className={cn(
                    "w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-300",
                    isSelected 
                      ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  )}>
                    <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {template.fields.length} حقل
                    </span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-900 dark:text-white" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="text-right">
                  <h3 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm line-clamp-1 mb-0.5">
                    {template.name[selectedLanguage]}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {template.description[selectedLanguage]}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Fade Edge - Left with scroll hint */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-20 bg-gradient-to-r from-white dark:from-gray-900 via-white/80 dark:via-gray-900/80 to-transparent pointer-events-none flex items-center justify-start pl-1 sm:pl-2">
          <AnimatePresence>
            {showScrollHint && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-1 sm:gap-1.5 bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-medium pointer-events-auto"
              >
                <motion.div
                  animate={{ x: [-2, 2, -2] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MousePointer2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                </motion.div>
                <span className="hidden sm:inline">اسحب للمزيد</span>
                <span className="sm:hidden">مرر</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Selected Template Info */}
      <AnimatePresence>
        {selectedTemplateId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700"
          >
            {(() => {
              const template = FORM_TEMPLATES.find(t => t.id === selectedTemplateId);
              if (!template) return null;
              const IconComponent = iconMap[template.icon] || FileText;
              return (
                <>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white dark:text-gray-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                      {template.name[selectedLanguage]}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                      {template.fields.length} حقول جاهزة للاستخدام
                    </p>
                  </div>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FormTemplateSelector;
