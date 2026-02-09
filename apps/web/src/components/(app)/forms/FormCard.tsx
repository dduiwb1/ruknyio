'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye,
  Copy,
  ExternalLink,
  BarChart3,
  MessageSquare,
  Globe,
  Lock,
  FileText,
  Link2,
  Star,
  ClipboardList,
  UserPlus,
  ShoppingBag,
  HelpCircle,
  MessageCircle,
  FormInput,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Form, 
  FormStatus,
  FormType,
  FORM_STATUS_LABELS,
  FORM_STATUS_CONFIG,
  FORM_TYPE_LABELS
} from '@/lib/hooks/useForms';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FormCardProps {
  form: Form;
  onEdit?: (form: Form) => void;
  onDelete?: (form: Form) => void;
  onView?: (form: Form) => void;
  onDuplicate?: (form: Form) => void;
  onViewResponses?: (form: Form) => void;
  variant?: 'grid' | 'list';
}

// أيقونات وألوان حسب نوع النموذج
const FORM_TYPE_STYLES: Record<FormType, { icon: React.ElementType; color: string; bg: string }> = {
  [FormType.CONTACT]: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500' },
  [FormType.SURVEY]: { icon: ClipboardList, color: 'text-violet-500', bg: 'bg-violet-500' },
  [FormType.REGISTRATION]: { icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  [FormType.ORDER]: { icon: ShoppingBag, color: 'text-orange-500', bg: 'bg-orange-500' },
  [FormType.FEEDBACK]: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-500' },
  [FormType.QUIZ]: { icon: HelpCircle, color: 'text-pink-500', bg: 'bg-pink-500' },
  [FormType.APPLICATION]: { icon: FormInput, color: 'text-indigo-500', bg: 'bg-indigo-500' },
  [FormType.OTHER]: { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-500' },
};

export function FormCardComponent({ 
  form, 
  onEdit, 
  onDelete, 
  onView,
  onDuplicate,
  onViewResponses,
  variant = 'grid'
}: FormCardProps) {
  const statusConfig = FORM_STATUS_CONFIG[form.status];
  const typeStyle = FORM_TYPE_STYLES[form.type] || FORM_TYPE_STYLES[FormType.OTHER];
  const TypeIcon = typeStyle.icon;
  const submissionsCount = form._count?.submissions || form.submissionCount || 0;
  const fieldsCount = form._count?.fields || form.fields?.length || 0;

  const copyFormLink = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const link = `${window.location.origin}/f/${form.slug}`;
    navigator.clipboard.writeText(link);
    toast.success('تم نسخ الرابط');
  };

  const openFormPage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    window.open(`/f/${form.slug}`, '_blank');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-4xl border border-gray-200 p-3 group cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={() => onView?.(form)}
    >
      {/* Image/Icon Section */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden mb-3">
        {/* Cover Image or Icon */}
        {form.coverImage ? (
          <img 
            src={form.coverImage} 
            alt={form.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center",
              "bg-white/80 backdrop-blur-sm shadow-sm"
            )}>
              <TypeIcon className={cn("w-8 h-8", typeStyle.color)} />
            </div>
          </div>
        )}

        {/* Status Badge - Top Right */}
        <span className={cn(
          "absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold",
          statusConfig.bg,
          statusConfig.color
        )}>
          {FORM_STATUS_LABELS[form.status]}
        </span>

        {/* Responses Badge - Top Left (if has responses) */}
        {submissionsCount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-500 text-white flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {submissionsCount}
          </span>
        )}

        {/* Privacy Badge - Bottom Left */}
        <span className={cn(
          "absolute bottom-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center",
          form.requiresAuthentication 
            ? "bg-amber-400" 
            : "bg-emerald-400"
        )}>
          {form.requiresAuthentication ? (
            <Lock className="w-3.5 h-3.5 text-white" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-white" />
          )}
        </span>

        {/* Actions Menu - Bottom Right */}
        <div className="absolute bottom-2 right-2 z-30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center",
                  "text-gray-500 hover:text-gray-900 hover:bg-white",
                  "transition-all duration-200 shadow-sm",
                  "opacity-0 group-hover:opacity-100",
                  "data-[state=open]:opacity-100"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              side="top" 
              sideOffset={4}
              className="min-w-[120px] rounded-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {onView && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onView(form); }}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  عرض
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onEdit(form); }}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  تحرير
                </DropdownMenuItem>
              )}
              {onViewResponses && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onViewResponses(form); }}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  الردود ({submissionsCount})
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); copyFormLink(e); }}
                className="flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                نسخ الرابط
              </DropdownMenuItem>
              {form.status === FormStatus.PUBLISHED && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); openFormPage(e); }}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  فتح النموذج
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDuplicate(form); }}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  نسخ
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(form); }}
                    variant="destructive"
                    className="flex items-center gap-2 px-3 py-2 text-[12px] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Section */}
      <div className="text-right">
        {/* Name & Type Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-[14px] leading-tight line-clamp-1 flex-1 min-w-0">
            {form.title}
          </h3>
          <span className={cn(
            "px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap",
            "bg-gray-100 text-gray-700"
          )}>
            {FORM_TYPE_LABELS[form.type]}
          </span>
        </div>

        {/* Description */}
        <p className="text-[12px] text-gray-400 line-clamp-2 mb-3 leading-relaxed">
          {form.description || 'بدون وصف'}
        </p>

        {/* Tags Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Responses Tag */}
          <span className={cn(
            "flex items-center gap-1 text-[11px]",
            submissionsCount > 0 ? "text-violet-500" : "text-gray-400"
          )}>
            <span className={cn(
              "w-2 h-2 rounded-full",
              submissionsCount > 0 ? "bg-violet-400" : "bg-gray-300"
            )} />
            {submissionsCount} رد
          </span>

          {/* Views Tag */}
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            {form.viewCount || 0} مشاهدة
          </span>

          {/* Fields Tag */}
          <span className="flex items-center gap-1 text-[11px] text-gray-400">
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            {fieldsCount} حقل
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Skeleton loader for FormCard
export function FormCardSkeleton() {
  return (
    <div className="bg-white rounded-4xl border border-gray-200 p-3 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] bg-gray-200 rounded-3xl mb-3" />
      
      {/* Content Skeleton */}
      <div className="text-right">
        {/* Name & Type Row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-7 w-16 bg-gray-200 rounded-lg" />
        </div>
        
        {/* Description */}
        <div className="space-y-1.5 mb-3">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
        
        {/* Tags */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-12 bg-gray-100 rounded" />
          <div className="h-3 w-14 bg-gray-100 rounded" />
          <div className="h-3 w-10 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export const FormCard = memo(FormCardComponent);
