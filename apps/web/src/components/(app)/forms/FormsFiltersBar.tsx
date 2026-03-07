'use client';

import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import {
  FormStatus,
  FormType,
  FORM_STATUS_LABELS,
  FORM_TYPE_LABELS,
  type FormsFilters,
  type FormsSortOption,
} from '@/lib/hooks/useForms';
import { cn } from '@/lib/utils';

interface FormsFiltersBarProps {
  filters: FormsFilters;
  onFiltersChange: (filters: FormsFilters) => void;
  sortBy: FormsSortOption;
  onSortChange: (sort: FormsSortOption) => void;
  resultsCount: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const SORT_OPTIONS: { value: FormsSortOption; label: string }[] = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'oldest', label: 'الأقدم' },
  { value: 'name', label: 'الاسم' },
  { value: 'submissions', label: 'الإجابات' },
  { value: 'views', label: 'المشاهدات' },
];

export function FormsFiltersBar({
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  resultsCount,
  viewMode,
  onViewModeChange,
}: FormsFiltersBarProps) {
  const hasActiveFilters = filters.status || filters.type || filters.search;

  return (
    <div className="space-y-3">
      {/* Search + View Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined })}
            placeholder="بحث في النماذج..."
            className="w-full rounded-xl border border-border/50 bg-muted/30 py-2.5 pr-10 pl-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-xl border border-border/50 bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'rounded-lg p-2 transition-colors',
              viewMode === 'grid' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={cn(
              'rounded-lg p-2 transition-colors',
              viewMode === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
            )}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* Filter Chips + Sort */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Status filters */}
          {Object.entries(FORM_STATUS_LABELS).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  status: filters.status === key ? undefined : (key as FormStatus),
                })
              }
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors',
                filters.status === key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => onFiltersChange({})}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="size-3" />
              مسح
            </button>
          )}
        </div>

        {/* Sort + Results Count */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{resultsCount} نموذج</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as FormsSortOption)}
            className="rounded-lg border border-border/50 bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
