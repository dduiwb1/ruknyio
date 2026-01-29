'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FieldType } from '@/lib/hooks/useForms';
import { Star, Check, X, Calendar, Clock, Mail, Phone, Hash, FileText, ToggleLeft, Link as LinkIcon } from 'lucide-react';

interface FieldValueRendererProps {
  value: any;
  fieldType: FieldType;
  className?: string;
  compact?: boolean;
}

export function FieldValueRenderer({ value, fieldType, className, compact = false }: FieldValueRendererProps) {
  if (value === null || value === undefined || value === '') {
    return <span className={cn('text-gray-400 italic', className)}>لا توجد إجابة</span>;
  }

  const renderValue = () => {
    switch (fieldType) {
      case FieldType.RATING:
        const rating = Number(value);
        return (
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-4 h-4',
                  star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                )}
              />
            ))}
            <span className="mr-2 text-sm text-gray-600">({rating})</span>
          </div>
        );

      case FieldType.SCALE:
        const scaleValue = Number(value);
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${(scaleValue / 10) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">{scaleValue}/10</span>
          </div>
        );

      case FieldType.TOGGLE:
        const isEnabled = value === true || value === 'true' || value === 1;
        return (
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
            isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          )}>
            {isEnabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {isEnabled ? 'نعم' : 'لا'}
          </span>
        );

      case FieldType.CHECKBOX:
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-1">
              {value.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                  <Check className="w-3 h-3" />
                  {String(item)}
                </span>
              ))}
            </div>
          );
        }
        return <span className={className}>{String(value)}</span>;

      case FieldType.DATE:
        try {
          const date = new Date(value);
          return (
            <span className="inline-flex items-center gap-1 text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              {date.toLocaleDateString('ar-IQ')}
            </span>
          );
        } catch {
          return <span className={className}>{String(value)}</span>;
        }

      case FieldType.TIME:
        return (
          <span className="inline-flex items-center gap-1 text-gray-700">
            <Clock className="w-4 h-4 text-gray-400" />
            {String(value)}
          </span>
        );

      case FieldType.EMAIL:
        return (
          <a 
            href={`mailto:${value}`} 
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            <Mail className="w-4 h-4" />
            {String(value)}
          </a>
        );

      case FieldType.PHONE:
        return (
          <a 
            href={`tel:${value}`} 
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline"
            dir="ltr"
          >
            <Phone className="w-4 h-4" />
            {String(value)}
          </a>
        );

      case FieldType.NUMBER:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-gray-700">
            <Hash className="w-4 h-4 text-gray-400" />
            {Number(value).toLocaleString('ar-IQ')}
          </span>
        );

      case FieldType.TEXTAREA:
        return (
          <div className="text-gray-700 whitespace-pre-wrap max-w-md">
            {String(value)}
          </div>
        );

      case FieldType.FILE:
        if (Array.isArray(value)) {
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((file, idx) => (
                <a 
                  key={idx}
                  href={file.url || file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  {file.name || `ملف ${idx + 1}`}
                </a>
              ))}
            </div>
          );
        }
        return (
          <a 
            href={value.url || value}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
          >
            <FileText className="w-4 h-4" />
            {value.name || 'ملف'}
          </a>
        );

      case FieldType.SELECT:
      case FieldType.RADIO:
        return (
          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-sm">
            {String(value)}
          </span>
        );

      case FieldType.TEXT:
      default:
        return <span className={cn('text-gray-700', className)}>{String(value)}</span>;
    }
  };

  return <div className={className}>{renderValue()}</div>;
}

export default FieldValueRenderer;