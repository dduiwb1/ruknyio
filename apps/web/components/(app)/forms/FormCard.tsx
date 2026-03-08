'use client';

import { motion } from 'framer-motion';
import { FileText, Edit, Trash2, Copy, BarChart3, Eye, MoreVertical } from 'lucide-react';
import {
  Form,
  FormStatus,
  FORM_STATUS_LABELS,
  FORM_STATUS_CONFIG,
  FORM_TYPE_LABELS,
  FORM_TYPE_CONFIG,
} from '@/lib/hooks/useForms';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { arSA } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FormCardProps {
  form: Form;
  onEdit: (form: Form) => void;
  onDelete: (form: Form) => void;
  onView: (form: Form) => void;
  onDuplicate: (form: Form) => void;
  onViewResponses: (form: Form) => void;
  variant?: 'grid' | 'list';
}

export function FormCard({ form, onEdit, onDelete, onView, onDuplicate, onViewResponses, variant = 'grid' }: FormCardProps) {
  const statusConfig = FORM_STATUS_CONFIG[form.status];
  const typeConfig = FORM_TYPE_CONFIG[form.type];
  const submissionsCount = form._count?.submissions || form.submissionCount || 0;

  const statusDotClass =
    form.status === FormStatus.PUBLISHED
      ? 'bg-emerald-500'
      : form.status === FormStatus.DRAFT
        ? 'bg-muted-foreground/60'
        : form.status === FormStatus.ARCHIVED
          ? 'bg-amber-500'
          : 'bg-destructive';

  if (variant === 'list') {
    return (
      <div
        onClick={() => onView(form)}
        className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-border hover:shadow-sm cursor-pointer"
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
          <span className="text-lg">{typeConfig.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{form.title}</h3>
            <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium', statusConfig.bg, statusConfig.color)}>
              <span className={cn('size-1.5 rounded-full', statusDotClass)} />
              {FORM_STATUS_LABELS[form.status]}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {FORM_TYPE_LABELS[form.type]} · {formatDistanceToNow(new Date(form.updatedAt), { locale: arSA, addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
          <span className="flex items-center gap-1"><Eye className="size-3" />{form.viewCount}</span>
          <span className="flex items-center gap-1"><BarChart3 className="size-3" />{submissionsCount}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <MoreVertical className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(form); }}>
              <Edit className="size-4 mr-2" />تعديل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewResponses(form); }}>
              <BarChart3 className="size-4 mr-2" />الإجابات
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(form); }}>
              <Copy className="size-4 mr-2" />نسخ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(form); }} className="text-destructive">
              <Trash2 className="size-4 mr-2" />حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Grid variant
  return (
    <div
      onClick={() => onView(form)}
      className="group relative rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:border-border hover:shadow-md cursor-pointer"
    >
      {/* Top Color Bar */}
      <div className="h-1.5 bg-gradient-to-l from-violet-500/30 to-violet-500/60" />

      <div className="p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">{typeConfig.icon}</span>
            <h3 className="text-sm font-semibold text-foreground truncate">{form.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" onClick={(e) => e.stopPropagation()} className="p-1 rounded-lg hover:bg-muted transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[140px] rounded-xl">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(form); }}>
                <Edit className="size-4 mr-2" />تعديل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewResponses(form); }}>
                <BarChart3 className="size-4 mr-2" />الإجابات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(form); }}>
                <Copy className="size-4 mr-2" />نسخ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(form); }} className="text-destructive">
                <Trash2 className="size-4 mr-2" />حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5">
          <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium', statusConfig.bg, statusConfig.color)}>
            <span className={cn('size-1.5 rounded-full', statusDotClass)} />
            {FORM_STATUS_LABELS[form.status]}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {FORM_TYPE_LABELS[form.type]}
          </span>
        </div>

        {/* Description */}
        {form.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2">{form.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 pt-1 border-t border-border/30 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Eye className="size-3" />{form.viewCount}</span>
          <span className="flex items-center gap-1"><BarChart3 className="size-3" />{submissionsCount}</span>
          <span className="mr-auto text-[10px]">
            {formatDistanceToNow(new Date(form.updatedAt), { locale: arSA, addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
