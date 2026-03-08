'use client';

import { cn } from '@/lib/utils';

export function FormCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden animate-pulse">
      <div className="h-1.5 bg-muted" />
      <div className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="size-5 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-3 w-full rounded bg-muted" />
        <div className="flex items-center gap-3 pt-2 border-t border-border/30">
          <div className="h-3 w-10 rounded bg-muted" />
          <div className="h-3 w-10 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function FormsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <FormCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FormsStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 animate-pulse">
          <div className="size-9 rounded-lg bg-muted" />
          <div className="space-y-1.5">
            <div className="h-5 w-10 rounded bg-muted" />
            <div className="h-2.5 w-16 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
