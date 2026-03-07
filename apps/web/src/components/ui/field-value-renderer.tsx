'use client';

import { cn } from '@/lib/utils';
import { FieldType } from '@/lib/hooks/useForms';

interface FieldValueRendererProps {
  type: FieldType;
  value: any;
  className?: string;
}

export function FieldValueRenderer({ type, value, className }: FieldValueRendererProps) {
  if (value === null || value === undefined || value === '') {
    return <span className={cn('text-muted-foreground italic', className)}>—</span>;
  }

  switch (type) {
    case FieldType.CHECKBOX:
    case FieldType.MULTISELECT:
      if (Array.isArray(value)) {
        return (
          <div className={cn('flex flex-wrap gap-1', className)}>
            {value.map((v, i) => (
              <span key={i} className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs">
                {String(v)}
              </span>
            ))}
          </div>
        );
      }
      return <span className={className}>{String(value)}</span>;

    case FieldType.RATING:
      const stars = Number(value) || 0;
      return (
        <span className={cn('text-amber-500', className)}>
          {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
        </span>
      );

    case FieldType.TOGGLE:
      return (
        <span className={cn(value ? 'text-emerald-600' : 'text-muted-foreground', className)}>
          {value ? 'نعم' : 'لا'}
        </span>
      );

    case FieldType.FILE:
      if (typeof value === 'string') {
        return (
          <a href={value} target="_blank" rel="noopener noreferrer" className={cn('text-primary underline text-xs', className)}>
            عرض الملف
          </a>
        );
      }
      return <span className={className}>{String(value)}</span>;

    case FieldType.URL:
      return (
        <a href={String(value)} target="_blank" rel="noopener noreferrer" className={cn('text-primary underline text-xs break-all', className)}>
          {String(value)}
        </a>
      );

    default:
      return <span className={cn('text-sm', className)}>{String(value)}</span>;
  }
}
