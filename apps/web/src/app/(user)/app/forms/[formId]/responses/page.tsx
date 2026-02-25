'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  MessageSquare,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  ListChecks,
  UserCircle,
  FileSpreadsheet,
  Copy,
  Link as LinkIcon,
  Calendar,
  Clock,
  Mail,
  Hash,
  Eye,
  Percent,
  Star,
  ToggleLeft,
  FileText,
  ChevronDown,
  Download,
  ExternalLink,
  Sheet,
  FolderOpen,
  Plug,
  HardDrive,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, FileText as FormIcon, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useForms,
  Form,
  FormSubmission,
  FIELD_TYPE_LABELS,
  FieldType,
  FormField,
} from '@/lib/hooks/useForms';
import { useGoogleSheets, GoogleSheetsStatus } from '@/lib/hooks/useGoogleSheets';
import { FieldValueRenderer } from '@/components/ui/field-value-renderer';
import { AuthClient } from '@/lib/auth/auth-client';
import { format, formatDistanceToNow, subDays, startOfDay, isWithinInterval } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  AreaChart, Area, CartesianGrid
} from 'recharts';

// ==================== TYPES ====================

type TabType = 'summary' | 'questions' | 'individual';

interface SubmissionData {
  [fieldLabel: string]: any;
}

interface ExtendedFormSubmission {
  id: string;
  formId: string;
  userId?: string;
  data: Record<string, any>;
  submittedAt: string;
  completedAt?: string;
  ipAddress?: string;
  userAgent?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  profile?: { name?: string };
}

interface QuestionSummary {
  fieldId: string;
  label: string;
  type: FieldType;
  responses: { value: any; count: number; percentage: number }[];
  totalResponses: number;
  required: boolean;
}

// ==================== ANIMATION VARIANTS ====================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05 } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

// ==================== SKELETON COMPONENTS ====================

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-muted rounded", className)} />
  );
}

function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-muted">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-3 w-16 mb-3" />
      <div className="flex items-end justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
    </div>
  );
}

function QuestionCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-lg" />
            <Skeleton className="h-5 w-12 rounded-lg" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
    </div>
  );
}

function ResponseCardSkeleton() {
  return (
    <div className="p-4 border-b border-border/40">
      <div className="flex items-start gap-3">
        <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-3" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  );
}

function SubmissionsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Header Skeleton */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-10 rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <QuestionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ==================== EMPTY STATE COMPONENT ====================

function EmptyResponsesState({ onCopyLink }: { onCopyLink: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-card rounded-2xl border border-border/50 overflow-hidden"
    >
      {/* Decorative Header */}
      <div className="h-32 bg-muted relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-card shadow-lg flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground" />
          </div>
        </motion.div>
      </div>
      
      {/* Content */}
      <div className="p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-foreground mb-2">لا توجد إجابات بعد</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            شارك رابط النموذج مع الآخرين لبدء جمع الإجابات. ستظهر جميع الردود هنا فور إرسالها.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCopyLink} 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <Copy className="w-4 h-4" />
            نسخ رابط النموذج
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            معاينة النموذج
          </motion.button>
        </motion.div>
        
        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-border/40"
        >
          <p className="text-xs text-muted-foreground mb-3">نصائح لزيادة الردود</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['شارك على وسائل التواصل', 'أرسل عبر البريد', 'أضف QR Code'].map((tip, i) => (
              <span key={i} className="px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                {tip}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ==================== CHART COLORS ====================

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--muted))',
  '#9CA3AF',
  '#D1D5DB',
  '#E5E7EB',
];

// ==================== CHART COMPONENTS ====================

function InteractivePieChart({ data, total }: { data: { value: any; count: number; percentage: number }[]; total: number }) {
  const chartData = data.slice(0, 6).map((item, index) => ({
    name: formatFieldValue(item.value),
    value: item.count,
    percentage: item.percentage,
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      <div className="w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={60}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value} إجابة`, '']}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                fontSize: '12px',
                direction: 'rtl'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }} />
            <span className="flex-1 truncate text-foreground">{item.name}</span>
            <span className="font-semibold text-foreground">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractiveBarChart({ data }: { data: { value: any; count: number; percentage: number }[] }) {
  const chartData = data.slice(0, 8).map((item) => ({
    name: String(formatFieldValue(item.value)).slice(0, 15),
    count: item.count,
    percentage: item.percentage
  }));

  if (chartData.length === 0) return null;

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={80}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            formatter={(value) => [`${value} إجابة`, '']}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
              direction: 'rtl'
            }}
          />
          <Bar 
            dataKey="count" 
            fill="#374151" 
            radius={[0, 4, 4, 0]}
            animationBegin={0}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ResponsesTimelineChart({ submissions }: { submissions: ExtendedFormSubmission[] }) {
  // Group submissions by date - show actual submission dates
  const timelineData = useMemo(() => {
    // Get all submission dates and group by day
    const dateGroups: Record<string, number> = {};
    
    submissions.forEach(sub => {
      try {
        // Try completedAt first (from API), then submittedAt as fallback
        const dateStr = sub.completedAt || sub.submittedAt;
        if (!dateStr) return;
        
        const subDate = new Date(dateStr);
        if (!isNaN(subDate.getTime())) {
          const dateKey = format(subDate, 'yyyy-MM-dd');
          dateGroups[dateKey] = (dateGroups[dateKey] || 0) + 1;
        }
      } catch {
        // Skip invalid dates
      }
    });
    
    // If no grouped data, show last 7 days with zero
    if (Object.keys(dateGroups).length === 0) {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        days.push({
          day: format(date, 'EEE', { locale: arSA }),
          fullDate: format(date, 'MM/dd'),
          count: 0
        });
      }
      return days;
    }
    
    // Sort dates and take last 7 unique days with data
    const sortedDates = Object.keys(dateGroups).sort();
    const recentDates = sortedDates.slice(-7);
    
    return recentDates.map(dateKey => {
      const date = new Date(dateKey);
      return {
        day: format(date, 'EEE', { locale: arSA }),
        fullDate: format(date, 'MM/dd'),
        count: dateGroups[dateKey]
      };
    });
  }, [submissions]);

  const totalThisPeriod = timelineData.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...timelineData.map(d => d.count), 1);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border/50 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm">توزيع الردود</h3>
          <p className="text-xs text-muted-foreground">حسب تاريخ الإرسال</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>{totalThisPeriod} في الفترة المعروضة</span>
        </div>
      </div>
      
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#374151" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#374151" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis 
              dataKey="fullDate" 
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              domain={[0, maxCount + 1]}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              width={25}
              allowDecimals={false}
            />
            <Tooltip 
              formatter={(value) => [`${value} رد`, '']}
              labelFormatter={(label) => `${label}`}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                direction: 'rtl'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#374151" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCount)"
              animationBegin={0}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
// ==================== HELPER FUNCTIONS ====================

const formatDate = (date: string) => {
  try {
    return format(new Date(date), 'dd/MM/yyyy', { locale: arSA });
  } catch {
    return '-';
  }
};

const formatTime = (date: string) => {
  try {
    return format(new Date(date), 'HH:mm', { locale: arSA });
  } catch {
    return '-';
  }
};

const formatRelativeDate = (date: string) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: arSA });
  } catch {
    return '-';
  }
};

const formatFieldValue = (value: any): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.join('، ');
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getFieldIcon = (type: FieldType) => {
  switch (type) {
    case FieldType.RATING:
    case FieldType.SCALE:
      return Star;
    case FieldType.TOGGLE:
      return ToggleLeft;
    case FieldType.EMAIL:
      return Mail;
    case FieldType.NUMBER:
      return Hash;
    case FieldType.MULTISELECT:
    case FieldType.RANKING:
    case FieldType.SELECT:
    case FieldType.RADIO:
    case FieldType.CHECKBOX:
      return FileText;
    default:
      return FileText;
  }
};

// ==================== SUMMARY TAB ====================

function SummaryQuestionCard({ question, qIndex, submissions, defaultExpanded = false }: {
  question: QuestionSummary;
  qIndex: number;
  submissions: ExtendedFormSubmission[];
  defaultExpanded?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const ITEMS_PER_PAGE = 6;
  
  const FieldIcon = getFieldIcon(question.type);
  const barColor = 'bg-foreground';

  // For text questions, get all responses with user info
  const textResponses = useMemo(() => {
    if ([FieldType.SELECT, FieldType.RADIO, FieldType.CHECKBOX, FieldType.RATING, FieldType.SCALE, FieldType.TOGGLE, FieldType.MULTISELECT, FieldType.RANKING].includes(question.type)) {
      return [];
    }
    return submissions.map((sub, index) => {
      const data = sub.data as SubmissionData;
      const value = data[question.label] || data[question.fieldId];
      // Reverse index: oldest = 1, newest = N (submissions are newest first)
      return { submission: sub, value, submissionIndex: submissions.length - 1 - index };
    }).filter(r => r.value !== undefined && r.value !== null && r.value !== '');
  }, [question, submissions]);

  const totalTextPages = Math.ceil(textResponses.length / ITEMS_PER_PAGE);
  const paginatedTextResponses = textResponses.slice(
    currentPage * ITEMS_PER_PAGE, 
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const isChoiceType = [FieldType.SELECT, FieldType.RADIO, FieldType.CHECKBOX, FieldType.RATING, FieldType.SCALE, FieldType.MULTISELECT, FieldType.RANKING].includes(question.type);
  const isToggleType = question.type === FieldType.TOGGLE;
  const isTextType = !isChoiceType && !isToggleType;

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-200 hover:border-border"
    >
      {/* Question Header */}
      <button 
        className="w-full p-4 cursor-pointer transition-all text-right hover:bg-muted/30"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-foreground"
          >
            {qIndex + 1}
          </motion.span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{question.label}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
                <FieldIcon className="w-3 h-3" />
                {FIELD_TYPE_LABELS[question.type] || question.type}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">{question.totalResponses} إجابة</span>
              {question.required && (
                <span className="px-2 py-0.5 rounded-lg text-xs bg-destructive/10 text-destructive font-medium">مطلوب</span>
              )}
            </div>
          </div>
          <div className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
            expanded ? 'bg-muted text-foreground rotate-180' : 'bg-muted/50 text-muted-foreground'
          )}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Content - Collapsible */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3">
              {/* Choice-based questions: Interactive Charts */}
              {isChoiceType && (
                <div className="space-y-4">
                  {/* Pie Chart for small datasets, Bar Chart for larger */}
                  {question.responses.length <= 5 ? (
                    <InteractivePieChart data={question.responses} total={question.totalResponses} />
                  ) : (
                    <InteractiveBarChart data={question.responses} />
                  )}
                  
                  {/* Fallback bar display */}
                  {question.responses.length > 8 && (
                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs text-muted-foreground/60 text-center">
                        +{question.responses.length - 8} خيار آخر
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Toggle questions: Yes/No Display */}
              {isToggleType && (
                <div className="flex items-center justify-center gap-8 py-4">
                  {question.responses.map((resp, idx) => {
                    const isYes = resp.value === true || resp.value === 'true' || resp.value === 'نعم' || resp.value === 'yes';
                    return (
                      <motion.div 
                        key={idx} 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          isYes ? 'bg-emerald-500/10' : 'bg-muted'
                        )}>
                          {isYes ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-foreground">{resp.count}</p>
                          <p className="text-xs text-muted-foreground">
                            {isYes ? 'نعم' : 'لا'}
                            <span className="text-muted-foreground/60 mr-1">({resp.percentage}%)</span>
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Text questions: Paginated List */}
              {isTextType && (
                <div className="space-y-2">
                  {textResponses.length === 0 ? (
                    <div className="text-center py-6">
                      <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">لا توجد إجابات نصية</p>
                    </div>
                  ) : (
                    <>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentPage}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-2"
                        >
                          {paginatedTextResponses.map((resp, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className="p-3 rounded-xl bg-muted border border-border/40 hover:border-border transition-all"
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-card flex items-center justify-center text-xs font-bold text-muted-foreground">
                                  {currentPage * ITEMS_PER_PAGE + idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm text-foreground font-medium break-words leading-relaxed">
                                    <FieldValueRenderer value={resp.value} fieldType={question.type} compact />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    Response {resp.submissionIndex + 1}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                      
                      {/* Pagination */}
                      {totalTextPages > 1 && (
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40">
                          <button
                            onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(0, p - 1)); }}
                            disabled={currentPage === 0}
                            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
                          >
                            <ChevronRight className="w-3 h-3" /> السابق
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalTextPages, 5) }).map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrentPage(i); }}
                                className={cn(
                                  'w-5 h-5 rounded text-xs font-medium',
                                  currentPage === i ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                                )}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalTextPages - 1, p + 1)); }}
                            disabled={currentPage >= totalTextPages - 1}
                            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors"
                          >
                            التالي <ChevronLeft className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SummaryTab({ form, submissions, questionSummaries }: {
  form: Form;
  submissions: ExtendedFormSubmission[];
  questionSummaries: QuestionSummary[];
}) {
  // Extract all text responses for word cloud
  const allTextResponses = useMemo(() => {
    const textTypes = [FieldType.TEXT, FieldType.TEXTAREA];
    const textFields = form.fields?.filter((f: FormField) => textTypes.includes(f.type as FieldType)) || [];
    
    const responses: string[] = [];
    submissions.forEach(sub => {
      const data = sub.data as SubmissionData;
      textFields.forEach((field: FormField) => {
        const value = data[field.label] || data[field.id];
        if (value && typeof value === 'string') {
          responses.push(value);
        }
      });
    });
    return responses;
  }, [form.fields, submissions]);

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="visible" 
      className="space-y-3"
    >
      {/* Timeline Chart - Show responses over time */}
      {submissions.length > 0 && (
        <ResponsesTimelineChart submissions={submissions} />
      )}
      

      
      {/* Question Summaries */}
      {questionSummaries.map((question, qIndex) => (
        <SummaryQuestionCard
          key={question.fieldId}
          question={question}
          qIndex={qIndex}
          submissions={submissions}
          defaultExpanded={qIndex === 0}
        />
      ))}
      
      {questionSummaries.length === 0 && (
        <motion.div 
          variants={fadeInUp}
          className="text-center py-16 bg-card rounded-xl border border-border/50"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-muted flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-muted-foreground/60" />
          </div>
          <p className="text-muted-foreground font-medium">لا توجد بيانات للعرض</p>
          <p className="text-muted-foreground/60 text-sm mt-1">أضف أسئلة للنموذج أولاً</p>
        </motion.div>
      )}
    </motion.div>
  );
}

// ==================== QUESTIONS TAB ====================

type ResponseFilter = 'all' | 'answered' | 'empty';

function QuestionsTab({ form, submissions, selectedQuestion, onSelectQuestion, onViewIndividual }: {
  form: Form;
  submissions: ExtendedFormSubmission[];
  selectedQuestion: string | null;
  onSelectQuestion: (fieldId: string) => void;
  onViewIndividual: (submissionIndex: number) => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<ResponseFilter>('all');
  const [expandedDuplicateId, setExpandedDuplicateId] = useState<string | null>(null);
  const RESPONSES_PER_PAGE = 8;
  
  const fields = form.fields || [];
  const currentField = fields.find((f: FormField) => f.id === selectedQuestion) || fields[0];
  const currentIndex = fields.findIndex((f: FormField) => f.id === currentField?.id);

  // Fixed color scheme for consistent design
  const colors = { bg: 'bg-primary', light: 'bg-muted', text: 'text-primary', textDark: 'text-foreground', hover: 'hover:bg-muted/50' };

  const fieldResponses = useMemo(() => {
    if (!currentField) return [];
    return submissions.map(sub => ({
      submission: sub,
      value: (sub.data as SubmissionData)[currentField.label] ?? (sub.data as SubmissionData)[currentField.id] ?? null,
    }));
  }, [currentField, submissions]);

  const answeredCount = fieldResponses.filter(r => r.value !== undefined && r.value !== null && r.value !== '').length;
  const emptyCount = fieldResponses.length - answeredCount;
  const answerRate = fieldResponses.length > 0 ? Math.round((answeredCount / fieldResponses.length) * 100) : 0;

  // Calculate duplicate responses
  const duplicatesMap = useMemo(() => {
    const map = new Map<string, number>();
    fieldResponses.forEach(r => {
      if (r.value !== undefined && r.value !== null && r.value !== '') {
        const key = String(r.value).trim().toLowerCase();
        map.set(key, (map.get(key) || 0) + 1);
      }
    });
    return map;
  }, [fieldResponses]);

  // Get duplicate count for a value
  const getDuplicateCount = (value: any): number => {
    if (value === undefined || value === null || value === '') return 0;
    const key = String(value).trim().toLowerCase();
    return duplicatesMap.get(key) || 0;
  };

  // Get all submissions with the same answer
  const getDuplicateSubmissions = (value: any) => {
    if (value === undefined || value === null || value === '') return [];
    const key = String(value).trim().toLowerCase();
    return fieldResponses.filter(r => {
      if (r.value === undefined || r.value === null || r.value === '') return false;
      return String(r.value).trim().toLowerCase() === key;
    });
  };

  // Find submission index - reverse order so oldest is 1, newest is N
  const findSubmissionIndex = (submissionId: string): number => {
    const idx = submissions.findIndex(s => s.id === submissionId);
    // Submissions are ordered newest first, so reverse the index
    return idx >= 0 ? submissions.length - 1 - idx : idx;
  };

  // Filter responses and group duplicates (show unique values only)
  const filteredResponses = useMemo(() => {
    let filtered = fieldResponses;
    
    if (filter === 'answered') {
      filtered = fieldResponses.filter(r => r.value !== undefined && r.value !== null && r.value !== '');
    } else if (filter === 'empty') {
      filtered = fieldResponses.filter(r => r.value === undefined || r.value === null || r.value === '');
    }
    
    // For answered filter, group by unique values to avoid showing duplicates
    if (filter === 'answered' || filter === 'all') {
      const seen = new Set<string>();
      const uniqueResponses: typeof filtered = [];
      
      filtered.forEach(r => {
        const isEmpty = r.value === undefined || r.value === null || r.value === '';
        if (isEmpty) {
          uniqueResponses.push(r);
        } else {
          const key = String(r.value).trim().toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            uniqueResponses.push(r);
          }
        }
      });
      
      return uniqueResponses;
    }
    
    return filtered;
  }, [fieldResponses, filter]);

  useEffect(() => {
    setCurrentPage(0);
  }, [selectedQuestion, filter]);

  const totalPages = Math.ceil(filteredResponses.length / RESPONSES_PER_PAGE);
  const paginatedResponses = filteredResponses.slice(currentPage * RESPONSES_PER_PAGE, (currentPage + 1) * RESPONSES_PER_PAGE);

  const goToQuestion = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      onSelectQuestion(fields[currentIndex - 1].id);
    } else if (direction === 'next' && currentIndex < fields.length - 1) {
      onSelectQuestion(fields[currentIndex + 1].id);
    }
  };

  if (fields.length === 0) {
    return (
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center py-12 bg-card rounded-2xl border border-border/50"
      >
        <ListChecks className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground">لا توجد أسئلة في هذا النموذج</p>
      </motion.div>
    );
  }

  const FieldIcon = getFieldIcon(currentField?.type as FieldType);

  return (
    <div className="space-y-3 mb-12">
      {/* Question Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border/50 overflow-hidden"
      >
        {/* Question Title & Navigation */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Question Number Badge */}
            <motion.div 
              whileHover={{ scale: 1.02, y: -1 }}
              className={cn(
                'flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold',
                colors.light,
                colors.textDark
              )}
            >
              {currentIndex + 1}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-base mb-1 line-clamp-2">
                {currentField?.label}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium', colors.light, colors.text)}>
                  <FieldIcon className="w-3.5 h-3.5" />
                  {FIELD_TYPE_LABELS[currentField?.type as FieldType] || currentField?.type}
                </span>
                {currentField?.required && (
                  <span className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-600 font-medium">مطلوب</span>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToQuestion('prev')} 
                disabled={currentIndex === 0} 
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                  currentIndex === 0 
                    ? "text-muted-foreground/40 cursor-not-allowed bg-muted/30" 
                    : "text-foreground bg-muted hover:bg-muted/80"
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToQuestion('next')} 
                disabled={currentIndex === fields.length - 1} 
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                  currentIndex === fields.length - 1 
                    ? "text-muted-foreground/40 cursor-not-allowed bg-muted/30" 
                    : "text-foreground bg-muted hover:bg-muted/80"
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Question Selector Dropdown */}
          <div className="mt-3 relative">
            <select 
              value={currentField?.id || ''} 
              onChange={(e) => onSelectQuestion(e.target.value)} 
              className={cn(
                "w-full bg-muted border border-border/50 rounded-xl px-4 py-3 pl-10 text-sm text-foreground font-medium",
                "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent cursor-pointer appearance-none transition-all"
              )}
            >
              {fields.map((field: FormField, idx: number) => (
                <option key={field.id} value={field.id}>
                  {idx + 1}. {field.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="px-4 py-3 bg-muted/30 border-t border-border/40">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground">معدل الإجابة</span>
              <span className="font-bold text-primary">{answerRate}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${answerRate}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-semibold">{answeredCount}</span> إجابة
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <XCircle className="w-3.5 h-3.5 text-muted-foreground/60" />
                <span className="font-semibold">{emptyCount}</span> فارغ
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              سؤال <span className="font-bold text-primary">{currentIndex + 1}</span> من {fields.length}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 p-1 bg-muted rounded-xl"
      >
        {[
          { id: 'all' as ResponseFilter, label: 'الكل', count: fieldResponses.length },
          { id: 'answered' as ResponseFilter, label: 'تمت الإجابة', count: answeredCount },
          { id: 'empty' as ResponseFilter, label: 'فارغ', count: emptyCount },
        ].map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all',
              filter === tab.id 
                ? cn('bg-card shadow-sm', colors.text)
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span>{tab.label}</span>
            <span className={cn(
              'px-1.5 py-0.5 rounded-md text-[10px]',
              filter === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {tab.count}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Responses Card */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={`${currentField?.id}-${filter}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-card rounded-2xl border border-border/50 overflow-hidden"
        >
          {/* Responses List */}
          <div className="divide-y divide-border/40 max-h-[400px] overflow-y-auto custom-scrollbar">
            {filteredResponses.length === 0 ? (
              <div className="p-10 text-center">
                <motion.div 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className={cn('w-14 h-14 mx-auto mb-3 rounded-xl flex items-center justify-center', colors.light)}
                >
                  {filter === 'answered' ? (
                    <CheckCircle2 className={cn('w-7 h-7', colors.text)} />
                  ) : filter === 'empty' ? (
                    <XCircle className="w-7 h-7 text-muted-foreground/60" />
                  ) : (
                    <MessageSquare className={cn('w-7 h-7', colors.text)} />
                  )}
                </motion.div>
                <p className="text-muted-foreground font-medium">
                  {filter === 'answered' ? 'لا توجد إجابات' : filter === 'empty' ? 'لا توجد ردود فارغة' : 'لا توجد مشاركات'}
                </p>
                <p className="text-muted-foreground/60 text-sm mt-1">
                  {filter !== 'all' && 'جرب تغيير الفلتر'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {paginatedResponses.map((resp, idx) => {
                    const isEmpty = resp.value === undefined || resp.value === null || resp.value === '';
                    const responseNumber = (currentPage * RESPONSES_PER_PAGE) + idx + 1;
                    const duplicateCount = getDuplicateCount(resp.value);
                    const submissionIndex = findSubmissionIndex(resp.submission.id);
                    const responseKey = `${currentPage}-${idx}`;
                    const isExpanded = expandedDuplicateId === responseKey;
                    const duplicateSubmissions = duplicateCount > 1 ? getDuplicateSubmissions(resp.value) : [];
                    
                    const handleClick = (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (isEmpty) return;
                      
                      if (duplicateCount > 1) {
                        // Toggle the expanded list
                        setExpandedDuplicateId(isExpanded ? null : responseKey);
                      } else {
                        // Single response - go directly to individual view
                        onViewIndividual(submissionIndex);
                      }
                    };
                    
                    return (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="relative"
                      >
                        <div
                          onClick={handleClick}
                          className={cn(
                            "p-4 transition-all group",
                            isEmpty ? "bg-muted/30" : cn(colors.hover, "cursor-pointer"),
                            !isEmpty && "hover:shadow-sm",
                            isExpanded && cn(colors.light, "border-r-2", colors.bg.replace('bg-', 'border-'))
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Response Number */}
                            <span 
                              className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold",
                                isEmpty ? "bg-muted text-muted-foreground/60" : cn(colors.light, colors.textDark)
                              )}
                            >
                              {responseNumber}
                            </span>
                            
                            {/* Response Content */}
                            <div className="flex-1 min-w-0">
                              {isEmpty ? (
                                <p className="text-muted-foreground/60 text-sm italic flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5" />
                                  لم يتم الإجابة
                                </p>
                              ) : (
                                <div>
                                  <div className="text-foreground text-sm leading-relaxed break-words group-hover:text-foreground">
                                    <FieldValueRenderer value={resp.value} fieldType={currentField?.type} compact />
                                  </div>
                                  {/* Duplicate indicator */}
                                  {duplicateCount > 1 && (
                                    <button 
                                      className={cn(
                                        "inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                                        isExpanded ? cn(colors.bg, 'text-white') : cn(colors.light, colors.text)
                                      )}
                                    >
                                      <Copy className="w-3 h-3" />
                                      {duplicateCount} إجابات متطابقة
                                      <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                                    </button>
                                  )}
                                </div>
                              )}
                              
                              {/* User Info */}
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/60">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Response {submissionIndex + 1}
                                </span>
                              </div>
                            </div>
                            
                            {/* View Details Arrow */}
                            {!isEmpty && duplicateCount <= 1 && (
                              <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  colors.light, colors.text
                                )}>
                                  <ExternalLink className="w-4 h-4" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Expanded Duplicates List */}
                        <AnimatePresence>
                          {isExpanded && duplicateCount > 1 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className={cn("border-r-2 mr-4", colors.bg.replace('bg-', 'border-'))}>
                                <div className="py-2 px-4 bg-muted/50">
                                  <p className="text-xs text-muted-foreground mb-2 font-medium">اختر المشارك للتفاصيل:</p>
                                  <div className="space-y-1">
                                    {duplicateSubmissions.map((dup, dupIdx) => {
                                      const dupSubmissionIndex = findSubmissionIndex(dup.submission.id);
                                      return (
                                        <motion.button
                                          key={dupIdx}
                                          initial={{ opacity: 0, x: -5 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: dupIdx * 0.03 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onViewIndividual(dupSubmissionIndex);
                                          }}
                                          className={cn(
                                            "w-full flex items-center justify-between p-2.5 rounded-lg text-right transition-all",
                                            "bg-card hover:shadow-sm border border-border/40",
                                            colors.hover
                                          )}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", colors.light)}>
                                              <User className={cn("w-3.5 h-3.5", colors.text)} />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">
                                              Response {dupSubmissionIndex + 1}
                                            </span>
                                          </div>
                                          <ChevronLeft className={cn("w-4 h-4", colors.text)} />
                                        </motion.button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-border/40 bg-muted/30 flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className={cn(
                  "text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  "text-muted-foreground hover:bg-card"
                )}
              >
                <ChevronRight className="w-3.5 h-3.5" /> السابق
              </motion.button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum = i;
                  if (totalPages > 5) {
                    if (currentPage < 3) pageNum = i;
                    else if (currentPage > totalPages - 4) pageNum = totalPages - 5 + i;
                    else pageNum = currentPage - 2 + i;
                  }
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                        currentPage === pageNum 
                          ? cn(colors.bg, 'text-white shadow-sm')
                          : "text-muted-foreground hover:bg-card"
                      )}
                    >
                      {pageNum + 1}
                    </motion.button>
                  );
                })}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className={cn(
                  "text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  "text-muted-foreground hover:bg-card"
                )}
              >
                التالي <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ==================== INDIVIDUAL TAB ====================

function IndividualTab({ form, submissions, currentIndex, onChangeIndex, onDelete, deletingId }: {
  form: Form;
  submissions: ExtendedFormSubmission[];
  currentIndex: number;
  onChangeIndex: (index: number) => void;
  onDelete: (submissionId: string) => void;
  deletingId: string | null;
}) {
  const currentSubmission = submissions[currentIndex];
  const data = currentSubmission?.data as SubmissionData;
  const fields = form.fields || [];

  if (submissions.length === 0) {
    return (
      <motion.div 
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center py-12 bg-card rounded-xl border border-border/40"
      >
        <UserCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-muted-foreground">لا توجد إجابات</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-2.5">
      {/* Navigation Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-lg sm:rounded-xl border border-border/50 p-2 sm:p-3"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => onChangeIndex(currentIndex + 1)} 
            disabled={currentIndex === submissions.length - 1} 
            className={cn(
              "w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center transition-all",
              currentIndex === submissions.length - 1 
                ? "text-muted-foreground/40 cursor-not-allowed bg-muted/30" 
                : "text-foreground hover:bg-muted/80 bg-muted"
            )}
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          
          <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground">الإجابة</span>
            <input
              type="number"
              min={1}
              max={submissions.length}
              value={submissions.length - currentIndex}
              onChange={(e) => {
                // Convert display number (1=oldest) to array index (0=newest)
                const displayNum = parseInt(e.target.value);
                const arrayIndex = submissions.length - displayNum;
                if (arrayIndex >= 0 && arrayIndex < submissions.length) onChangeIndex(arrayIndex);
              }}
              className="w-12 sm:w-16 text-center bg-muted border border-border/50 rounded-md sm:rounded-lg py-1 sm:py-1.5 text-xs sm:text-sm text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
            <span className="text-[10px] sm:text-xs text-muted-foreground">من <span className="font-semibold text-foreground">{submissions.length}</span></span>
          </div>
          
          <button 
            onClick={() => onChangeIndex(currentIndex - 1)} 
            disabled={currentIndex === 0} 
            className={cn(
              "w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center transition-all",
              currentIndex === 0 
                ? "text-muted-foreground/40 cursor-not-allowed bg-muted/30" 
                : "text-foreground hover:bg-muted/80 bg-muted"
            )}
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </motion.div>

      {/* Submission Card */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentSubmission?.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="bg-card mb-12 rounded-lg sm:rounded-xl border border-border/50 overflow-hidden"
        >
          {/* User Header */}
          <div className="p-2.5 sm:p-3 border-b border-border/40 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="font-semibold text-foreground text-xs sm:text-sm">Response {submissions.length - currentIndex}</p>                  <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex-wrap">
                    {currentSubmission?.user?.email && (
                      <>
                        <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="truncate max-w-[100px] sm:max-w-none">{currentSubmission.user.email}</span>
                        <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-muted-foreground/30" />
                      </>
                    )}
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{formatDate(currentSubmission?.submittedAt)}</span>
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span>{formatTime(currentSubmission?.submittedAt)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDelete(currentSubmission?.id)}
                disabled={deletingId === currentSubmission?.id}
                className={cn(
                  'w-8 h-8 sm:w-9 sm:h-9 rounded-md sm:rounded-lg flex items-center justify-center transition-all',
                  deletingId === currentSubmission?.id 
                    ? 'text-red-300 cursor-not-allowed bg-red-50' 
                    : 'text-red-400 hover:bg-red-100 hover:text-red-600 bg-red-50'
                )}
              >
                {deletingId === currentSubmission?.id ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
              </button>
            </div>
          </div>
          
          {/* Fields */}
          <div className="divide-y divide-border/40 max-h-[320px] sm:max-h-[380px] overflow-y-auto custom-scrollbar">
            {fields.map((field: FormField, idx: number) => {
              const FieldIcon = getFieldIcon(field.type);
              const value = data?.[field.label] || data?.[field.id];
              const isEmpty = value === undefined || value === null || value === '';
              
              return (
                <div 
                  key={field.id} 
                  className={cn("p-2.5 sm:p-3 hover:bg-muted/50 transition-colors", isEmpty && "bg-muted/20")}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className={cn(
                      "flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-bold",
                      isEmpty ? "bg-muted text-muted-foreground/60" : "bg-foreground text-background"
                    )}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                        <FieldIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/60" />
                        <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{field.label}</p>
                        {field.required && <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
                      </div>
                      {isEmpty ? (
                        <p className="text-muted-foreground/60 text-xs sm:text-sm italic">لم يتم الإجابة</p>
                      ) : (
                        <div className="text-foreground text-xs sm:text-sm leading-relaxed break-words">
                          <FieldValueRenderer value={value} fieldType={field.type} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Footer */}
          <div className="p-2 sm:p-2.5 bg-muted/30 border-t border-border/40 flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground/60">
            <span className="font-mono">#{currentSubmission?.id.slice(0, 8)}</span>
            <span>{formatRelativeDate(currentSubmission?.submittedAt)}</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ==================== DELETE MODAL ====================

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, isLoading }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-[90vw] sm:max-w-sm w-full shadow-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-red-100 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-foreground text-center mb-1.5 sm:mb-2">حذف الإجابة</h3>
        <p className="text-muted-foreground text-center text-sm sm:text-base mb-4 sm:mb-6">
          هل أنت متأكد من حذف هذه الإجابة؟
          <br />
          <span className="text-xs sm:text-sm text-muted-foreground/60">لا يمكن التراجع عن هذا الإجراء</span>
        </p>
        <div className="flex gap-2 sm:gap-3">
          <button 
            onClick={onClose} 
            disabled={isLoading} 
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted/50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading} 
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 sm:gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                <span className="text-xs sm:text-sm">جاري الحذف...</span>
              </>
            ) : (
              'حذف'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ==================== MAIN PAGE ====================

// Simple in-memory cache for submissions
const submissionsCache = new Map<string, { data: ExtendedFormSubmission[]; total: number; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params?.formId as string;
  const { getFormById, getFormSubmissions, exportSubmissions } = useForms();
  const { 
    connect: connectGoogleSheets, 
    getStatus: getGoogleSheetsStatus, 
    exportSubmissions: exportToGoogleSheets,
    toggleAutoSync: toggleGoogleSheetsAutoSync,
    createNewSpreadsheet: createNewGoogleSheet,
    disconnect: disconnectGoogleSheets,
    reconnect: reconnectGoogleSheets,
    isLoading: isGoogleSheetsLoading 
  } = useGoogleSheets();

  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<ExtendedFormSubmission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [isLoadingForm, setIsLoadingForm] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [individualIndex, setIndividualIndex] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; submissionId: string | null }>({ isOpen: false, submissionId: null });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [sheetsStatus, setSheetsStatus] = useState<GoogleSheetsStatus | null>(null);
  const [isExportingToSheets, setIsExportingToSheets] = useState(false);
  const [showIntegrationsMenu, setShowIntegrationsMenu] = useState(false);
  const [activeIntegration, setActiveIntegration] = useState<'sheets' | 'drive'>('sheets');
  const [driveStatus, setDriveStatus] = useState<{ connected: boolean; folderUrl?: string } | null>(null);
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);

  // Fetch Google Sheets status
  useEffect(() => {
    const fetchSheetsStatus = async () => {
      if (!formId) return;
      const status = await getGoogleSheetsStatus(formId);
      setSheetsStatus(status);
    };
    fetchSheetsStatus();
  }, [formId, getGoogleSheetsStatus]);

  // Handle Google Sheets export
  const handleExportToSheets = async () => {
    if (!formId) return;
    setIsExportingToSheets(true);
    try {
      if (!sheetsStatus?.connected) {
        // Connect first - redirect to OAuth
        const result = await connectGoogleSheets(formId);
        if (result && 'authUrl' in result && result.authUrl) {
          // Redirect user to Google OAuth
          window.location.href = result.authUrl as string;
          return; // Stop execution - user will be redirected
        }
      } else {
        // Export to existing sheet
        const result = await exportToGoogleSheets(formId);
        if (result?.spreadsheetUrl) {
          window.open(result.spreadsheetUrl, '_blank');
        }
        // Refresh status
        const status = await getGoogleSheetsStatus(formId);
        setSheetsStatus(status);
      }
    } catch (err) {
      console.error('Error exporting to sheets:', err);
    } finally {
      setIsExportingToSheets(false);
      setShowIntegrationsMenu(false);
    }
  };

  // Handle toggle auto-sync
  const handleToggleAutoSync = async () => {
    if (!formId || !sheetsStatus?.connected) return;
    const newValue = !sheetsStatus.isAutoSync;
    const success = await toggleGoogleSheetsAutoSync(formId, newValue);
    if (success) {
      setSheetsStatus((prev: GoogleSheetsStatus | null) => prev ? { ...prev, isAutoSync: newValue } : null);
    }
  };

  // Handle create new spreadsheet
  const handleCreateNewSheet = async () => {
    if (!formId || !sheetsStatus?.connected) return;
    setIsExportingToSheets(true);
    try {
      const result = await createNewGoogleSheet(formId);
      if (result?.spreadsheetUrl) {
        window.open(result.spreadsheetUrl, '_blank');
      }
      // Refresh status
      const status = await getGoogleSheetsStatus(formId);
      setSheetsStatus(status);
    } catch (err) {
      console.error('Error creating new sheet:', err);
    } finally {
      setIsExportingToSheets(false);
    }
  };

  // Handle disconnect Google Sheets
  const handleDisconnectSheets = async () => {
    if (!formId) return;
    const success = await disconnectGoogleSheets(formId);
    if (success) {
      setSheetsStatus(null);
      // Also disconnect Drive since they share the same OAuth
      setDriveStatus({ connected: false });
    }
  };

  // Handle reconnect with different account
  const handleReconnectSheets = async () => {
    if (!formId) return;
    setIsExportingToSheets(true);
    try {
      const success = await reconnectGoogleSheets(formId);
      if (success) {
        // Refresh status after reconnection
        const status = await getGoogleSheetsStatus(formId);
        setSheetsStatus(status);
      }
    } catch (err) {
      console.error('Error reconnecting sheets:', err);
    } finally {
      setIsExportingToSheets(false);
      setShowIntegrationsMenu(false);
    }
  };

  // Handle Google Drive connect
  const handleConnectDrive = async () => {
    if (!formId) return;
    setIsConnectingDrive(true);
    try {
      const token = await AuthClient.getToken();
      const response = await fetch(
        `/api/v1/integrations/google-drive/status/${formId}`,
        {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (response.ok) {
        const data = await response.json();
        setDriveStatus({ connected: data.connected, folderUrl: data.folderUrl });
      }
    } catch (err) {
      console.error('Error connecting to Drive:', err);
    } finally {
      setIsConnectingDrive(false);
    }
  };

  // Fetch Google Drive status on mount and when sheets status changes
  useEffect(() => {
    const fetchDriveStatus = async () => {
      if (!formId) return;
      try {
        const token = await AuthClient.getToken();
        const response = await fetch(
          `/api/v1/integrations/google-drive/status/${formId}`,
          {
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDriveStatus({ connected: data.connected, folderUrl: data.folderUrl });
        }
      } catch (err) {
        // Drive not connected or error
        setDriveStatus({ connected: false });
      }
    };
    fetchDriveStatus();
  }, [formId, sheetsStatus?.connected]); // Re-fetch when sheets connection changes

  useEffect(() => {
    const fetchForm = async () => {
      if (!formId) return;
      setIsLoadingForm(true);
      try {
        const formData = await getFormById(formId);
        setForm(formData);
        if (formData?.fields?.[0]) setSelectedQuestion(formData.fields[0].id);
      } catch (err) {
        console.error('Error fetching form:', err);
      } finally {
        setIsLoadingForm(false);
      }
    };
    fetchForm();
  }, [formId, getFormById]);

  const fetchSubmissions = useCallback(async (forceRefresh = false) => {
    if (!formId) return;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = submissionsCache.get(formId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setSubmissions(cached.data);
        setTotalSubmissions(cached.total);
        setIsCached(true);
        return;
      }
    }
    
    setIsLoadingSubmissions(true);
    setIsCached(false);
    try {
      const result = await getFormSubmissions(formId, 1, 1000);
      const submissionsData = result.submissions as ExtendedFormSubmission[];
      setSubmissions(submissionsData);
      setTotalSubmissions(result.total);
      
      // Update cache
      submissionsCache.set(formId, {
        data: submissionsData,
        total: result.total,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [formId, getFormSubmissions]);
  
  // Force refresh function
  const refreshSubmissions = useCallback(() => {
    fetchSubmissions(true);
  }, [fetchSubmissions]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const questionSummaries = useMemo((): QuestionSummary[] => {
    if (!form?.fields) return [];
    return form.fields.map((field: FormField) => {
      const responses: Map<string, number> = new Map();
      let total = 0;
      submissions.forEach((sub) => {
        const data = sub.data as SubmissionData;
        const value = data[field.label] || data[field.id];
        if (value !== undefined && value !== null && value !== '') {
          total++;
          if (Array.isArray(value)) {
            value.forEach((v) => {
              const key = String(v);
              responses.set(key, (responses.get(key) || 0) + 1);
            });
          } else {
            const key = String(value);
            responses.set(key, (responses.get(key) || 0) + 1);
          }
        }
      });
      const sortedResponses = Array.from(responses.entries())
        .map(([value, count]) => ({ value, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);
      return { fieldId: field.id, label: field.label, type: field.type, responses: sortedResponses, totalResponses: total, required: field.required };
    });
  }, [form?.fields, submissions]);

  const handleDeleteClick = (submissionId: string) => setDeleteModal({ isOpen: true, submissionId });

  const handleDeleteConfirm = async () => {
    if (!deleteModal.submissionId || !formId) return;
    setDeletingId(deleteModal.submissionId);
    setDeleteModal({ isOpen: false, submissionId: null });
    try {
      const token = await AuthClient.getToken();
      const response = await fetch(`/api/v1/forms/${formId}/submissions/${deleteModal.submissionId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        setSubmissions((prev: ExtendedFormSubmission[]) => prev.filter((s) => s.id !== deleteModal.submissionId));
        setTotalSubmissions((prev) => prev - 1);
        if (individualIndex >= submissions.length - 1) setIndividualIndex(Math.max(0, submissions.length - 2));
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = async () => {
    if (!formId) return;
    setIsExporting(true);
    try {
      const blob = await exportSubmissions(formId, 'csv');
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${form?.title || 'submissions'}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const copyFormLink = () => {
    const link = `${window.location.origin}/f/${form?.slug}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Loading state - Form Loading
  if (isLoadingForm) {
    return (
      <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="p-4 sm:p-6">
            <SubmissionsLoadingSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!form) {
    return (
      <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">لم يتم العثور على النموذج</h2>
            <p className="text-muted-foreground mb-8">
              النموذج المطلوب غير موجود أو ليس لديك صلاحية الوصول إليه
            </p>
            <Link 
              href="/app/forms" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-all"
            >
              <ArrowRight className="w-5 h-5" />
              العودة للنماذج
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary' as TabType, label: 'ملخص', icon: BarChart3, description: 'عرض إحصائي' },
    { id: 'questions' as TabType, label: 'سؤال', icon: ListChecks, description: 'سؤال بسؤال' },
    { id: 'individual' as TabType, label: 'فردي', icon: UserCircle, description: 'إجابة بإجابة' },
  ];

  // Response stats
  const responseRate = form.viewCount && form.viewCount > 0 
    ? Math.round((totalSubmissions / form.viewCount) * 100) 
    : 0;

  // Stats cards configuration - unified theme color scheme
  const statsCards = [
    {
      key: 'responses',
      title: 'إجمالي الإجابات',
      subtitle: `من ${form.viewCount || 0} مشاهدة`,
      value: totalSubmissions,
      change: responseRate,
      bgColor: 'bg-muted',
      hoverColor: 'hover:bg-muted/80',
      textColor: 'text-foreground',
    },
    {
      key: 'views',
      title: 'مشاهدات النموذج',
      subtitle: `${totalSubmissions} تحويل`,
      value: form.viewCount || 0,
      change: form.viewCount ? Math.round((totalSubmissions / form.viewCount) * 100) : 0,
      bgColor: 'bg-muted',
      hoverColor: 'hover:bg-muted/80',
      textColor: 'text-foreground',
    },
    {
      key: 'rate',
      title: 'معدل الاستجابة',
      subtitle: `${totalSubmissions} من ${form.viewCount || 0}`,
      value: responseRate,
      isPercentage: true,
      change: responseRate,
      bgColor: 'bg-muted',
      hoverColor: 'hover:bg-muted/80',
      textColor: 'text-foreground',
    },
    {
      key: 'questions',
      title: 'عدد الأسئلة',
      subtitle: `${form.fields?.filter((f: FormField) => f.required).length || 0} سؤال مطلوب`,
      value: form.fields?.length || 0,
      change: form.fields?.length ? Math.round((form.fields.filter((f: FormField) => f.required).length / form.fields.length) * 100) : 0,
      bgColor: 'bg-muted',
      hoverColor: 'hover:bg-muted/80',
      textColor: 'text-foreground',
    },
  ];

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(num >= 10000 ? 0 : 1) + 'K';
    return (num ?? 0).toLocaleString('en-US');
  };

  return (
    <div className="relative flex h-[calc(100%-1rem)] flex-1 min-w-0 bg-card m-2 md:ms-0 rounded-2xl border border-border/50 overflow-hidden" dir="rtl">
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4 sm:p-6 space-y-5">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Breadcrumb>
            <BreadcrumbList className="text-sm">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">الرئيسية</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-muted-foreground/30 rotate-180" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/app/forms" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <FormIcon className="w-3.5 h-3.5" />
                    <span>النماذج</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-muted-foreground/30 rotate-180" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/app/forms/${formId}`} className="text-muted-foreground hover:text-foreground transition-colors max-w-[120px] sm:max-w-[200px] truncate">
                    {form.title}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-muted-foreground/30 rotate-180" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  الردود
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4"
        >
          {statsCards.map((stat) => (
            <motion.div
              key={stat.key}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              className={cn(
                "relative rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5",
                "transition-all duration-300",
                "text-right",
                stat.bgColor,
                stat.hoverColor
              )}
            >
              {/* Title */}
              <p className={cn("text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 line-clamp-1", stat.textColor)}>
                {stat.title}
              </p>

              {/* Subtitle */}
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 line-clamp-1">
                {stat.subtitle}
              </p>

              {/* Value & Change Row */}
              <div className="flex items-end justify-between gap-1">
                {/* Value */}
                <motion.div
                  className={cn("text-lg sm:text-2xl lg:text-3xl font-bold", stat.textColor)}
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {stat.isPercentage ? `${stat.value}%` : formatNumber(stat.value)}
                </motion.div>

                {/* Change Indicator */}
                <div className={cn(
                  "hidden sm:flex items-center gap-0.5 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full",
                  "bg-card/50 text-foreground/70"
                )}>
                  <span>~{stat.change}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl sm:rounded-2xl border border-border/50 mb-4"
        >
          {/* Top Header */}
          <div className="p-3 sm:p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {/* Form Info */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-base lg:text-lg font-bold text-foreground truncate">
                    {form.title}
                  </h1>
                  <Link 
                    href={`/app/forms/${formId}`} 
                    className="text-[10px] sm:text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors inline-flex items-center gap-1"
                  >
                    تعديل النموذج
                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </Link>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {/* Copy Link Button */}
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={copyFormLink} 
                  className={cn(
                    'h-8 sm:h-9 px-2 sm:px-3 rounded-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-all border',
                    linkCopied 
                      ? 'bg-foreground text-background border-foreground' 
                      : 'bg-card text-foreground border-border hover:bg-muted/50'
                  )}
                >
                  {linkCopied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">نسخ الرابط</span>
                    </>
                  )}
                </motion.button>

                {/* Integrations Button */}
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowIntegrationsMenu(true)}
                  className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium transition-all border bg-card text-foreground border-border hover:bg-muted/50"
                >
                  <Plug className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden lg:inline">التكاملات</span>
                  {sheetsStatus?.connected && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                  )}
                </motion.button>

                {/* Export CSV Button */}
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExport} 
                  disabled={isExporting || submissions.length === 0} 
                  className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium bg-card text-foreground border border-border hover:bg-muted/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  <span className="hidden sm:inline">CSV</span>
                </motion.button>
                
                {/* Refresh Button */}
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshSubmissions} 
                  disabled={isLoadingSubmissions} 
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center bg-card text-muted-foreground border border-border hover:bg-muted/50 transition-all disabled:opacity-50"
                  title="تحديث"
                >
                  <RefreshCcw className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', isLoadingSubmissions && 'animate-spin')} />
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Tabs - Pills Style */}
          <div className="px-2 sm:px-3 pb-2 sm:pb-3">
            <div className="flex gap-1 sm:gap-1.5 p-0.5 sm:p-1 bg-muted rounded-lg sm:rounded-xl">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button 
                    key={tab.id} 
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: isActive ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-semibold transition-all',
                      isActive 
                        ? 'bg-card text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoadingSubmissions ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <QuestionCardSkeleton key={i} />
            ))}
          </div>
        ) : submissions.length === 0 ? (
          <EmptyResponsesState onCopyLink={copyFormLink} />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'summary' && (
              <SummaryTab 
                key="summary" 
                form={form} 
                submissions={submissions} 
                questionSummaries={questionSummaries} 
              />
            )}
            {activeTab === 'questions' && (
              <QuestionsTab 
                key="questions" 
                form={form} 
                submissions={submissions} 
                selectedQuestion={selectedQuestion} 
                onSelectQuestion={setSelectedQuestion}
                onViewIndividual={(reversedIndex) => {
                  // Convert reversed index back to actual array index
                  const actualIndex = submissions.length - 1 - reversedIndex;
                  setIndividualIndex(actualIndex);
                  setActiveTab('individual');
                }}
              />
            )}
            {activeTab === 'individual' && (
              <IndividualTab 
                key="individual" 
                form={form} 
                submissions={submissions} 
                currentIndex={individualIndex} 
                onChangeIndex={setIndividualIndex} 
                onDelete={handleDeleteClick} 
                deletingId={deletingId} 
              />
            )}
          </AnimatePresence>
        )}
      
      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <DeleteConfirmationModal 
            isOpen={deleteModal.isOpen} 
            onClose={() => setDeleteModal({ isOpen: false, submissionId: null })} 
            onConfirm={handleDeleteConfirm} 
            isLoading={deletingId !== null} 
          />
        )}
      </AnimatePresence>

      {/* Integrations Hub Dialog */}
      <AnimatePresence mode="wait">
        {showIntegrationsMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[12vh]"
            onClick={() => setShowIntegrationsMenu(false)}
          >
            {/* Backdrop */}
            <motion.div 
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-md mx-4"
            >
              <div className={cn(
                "w-full rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden",
                "bg-card/95 backdrop-blur-xl",
                "shadow-xl shadow-black/10",
                "border border-border/50",
                "max-h-[85vh] sm:max-h-[80vh] flex flex-col"
              )}>
                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 border-b border-border/40 shrink-0"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.15 }}
                    className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground"
                  >
                    <Plug className="h-5 w-5 sm:h-6 sm:w-6" />
                  </motion.div>
                  <div className="flex-1 overflow-hidden text-right">
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">
                      التكاملات
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ربط ومزامنة البيانات مع خدمات Google
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowIntegrationsMenu(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </motion.button>
                </motion.div>

                {/* Integration Tabs */}
                <div className="px-4 pt-3 shrink-0">
                  <div className="flex gap-1 p-1 bg-muted rounded-xl">
                    <button
                      onClick={() => setActiveIntegration('sheets')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                        activeIntegration === 'sheets'
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Sheets</span>
                      {sheetsStatus?.connected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveIntegration('drive')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                        activeIntegration === 'drive'
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Drive</span>
                      {sheetsStatus?.connected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 sm:p-5 overflow-y-auto flex-1"
                >
                  <AnimatePresence mode="wait">
                    {/* Google Sheets Tab */}
                    {activeIntegration === 'sheets' && (
                      <motion.div
                        key="sheets"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {sheetsStatus?.connected ? (
                          <div className="space-y-3">
                            {/* Status Card */}
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-green-800">متصل</p>
                                <p className="text-xs text-green-600">المزامنة تعمل</p>
                              </div>
                            </div>

                            {/* Auto-sync Toggle */}
                            <button
                              onClick={handleToggleAutoSync}
                              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium bg-muted/50 hover:bg-muted transition-all"
                            >
                              <div 
                                className={cn(
                                  "w-11 h-6 rounded-full transition-colors relative cursor-pointer",
                                  sheetsStatus.isAutoSync ? "bg-foreground" : "bg-muted-foreground/30"
                                )}
                              >
                                <div 
                                  className={cn(
                                    "w-5 h-5 rounded-full bg-background absolute top-0.5 shadow-sm transition-all",
                                    sheetsStatus.isAutoSync ? "right-0.5" : "left-0.5"
                                  )} 
                                />
                              </div>
                              <span className="text-foreground">المزامنة التلقائية</span>
                            </button>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={handleExportToSheets}
                                disabled={isExportingToSheets}
                                className="h-10 w-10 flex items-center justify-center bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all disabled:opacity-50"
                                title="مزامنة الآن"
                              >
                                {isExportingToSheets ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCcw className="w-4 h-4" />
                                )}
                              </button>
                              
                              {sheetsStatus.spreadsheetUrl && (
                                <a
                                  href={sheetsStatus.spreadsheetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-2 h-10 px-4 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-all"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  فتح الجدول
                                </a>
                              )}
                            </div>

                            {/* Disconnect */}
                            <button
                              onClick={handleDisconnectSheets}
                              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <LinkIcon className="w-4 h-4" />
                              فصل الربط
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {/* Icon */}
                            <div className="text-center">
                              <motion.div 
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4"
                              >
                                <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                              </motion.div>
                              <p className="text-sm font-medium text-foreground">Google Sheets</p>
                              <p className="text-xs text-muted-foreground mt-1">تصدير ومزامنة الردود تلقائياً</p>
                            </div>
                            
                            {/* Features */}
                            <div className="space-y-2">
                              {[
                                'مزامنة تلقائية للردود الجديدة',
                                'تحديث لحظي للبيانات',
                                'جدول بيانات خاص بالنموذج'
                              ].map((feature, index) => (
                                <div 
                                  key={feature}
                                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                                >
                                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                            
                            {/* Connect Button */}
                            <button
                              onClick={handleExportToSheets}
                              disabled={isExportingToSheets}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-all disabled:opacity-50"
                            >
                              {isExportingToSheets ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <LinkIcon className="w-4 h-4" />
                                  ربط Google Sheets
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Google Drive Tab */}
                    {activeIntegration === 'drive' && (
                      <motion.div
                        key="drive"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {sheetsStatus?.connected ? (
                          <div className="space-y-3">
                            {/* Status Card */}
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="flex-1 text-right">
                                <p className="text-sm font-medium text-green-800">متصل</p>
                                <p className="text-xs text-green-600">الملفات ترفع تلقائياً</p>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="p-3 bg-muted/50 rounded-xl">
                              <p className="text-xs text-muted-foreground text-right">
                                الملفات والتوقيعات المرفوعة في هذا النموذج تُحفظ تلقائياً في Google Drive
                              </p>
                            </div>

                            {/* Actions */}
                            {driveStatus?.folderUrl && (
                              <a
                                href={driveStatus.folderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 h-10 px-4 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-all"
                              >
                                <FolderOpen className="w-4 h-4" />
                                فتح المجلد في Drive
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-5">
                            {/* Icon */}
                            <div className="text-center">
                              <motion.div 
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4"
                              >
                                <FolderOpen className="w-8 h-8 text-muted-foreground" />
                              </motion.div>
                              <p className="text-sm font-medium text-foreground">Google Drive</p>
                              <p className="text-xs text-muted-foreground mt-1">رفع الملفات والتوقيعات تلقائياً</p>
                            </div>
                            
                            {/* Features */}
                            <div className="space-y-2">
                              {[
                                'رفع الملفات إلى Drive تلقائياً',
                                'حفظ التوقيعات كصور',
                                'مجلد خاص لكل نموذج'
                              ].map((feature, index) => (
                                <div 
                                  key={feature}
                                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                                >
                                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>

                            {/* Note */}
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                              <p className="text-xs text-amber-700 text-right">
                                💡 يتم تفعيل Google Drive تلقائياً عند ربط Google Sheets
                              </p>
                            </div>
                            
                            {/* Connect Button - Uses Sheets OAuth which includes Drive scopes */}
                            <button
                              onClick={() => {
                                handleExportToSheets();
                                setActiveIntegration('sheets');
                              }}
                              disabled={isExportingToSheets}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-all disabled:opacity-50"
                            >
                              {isExportingToSheets ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <LinkIcon className="w-4 h-4" />
                                  ربط Google (Sheets + Drive)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

          {/* Bottom Blur Gradient Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </div>
  );
}
