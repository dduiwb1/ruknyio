'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FormCardSkeletonProps {
  className?: string;
}

export function FormCardSkeleton({ className }: FormCardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Header Gradient Skeleton */}
      <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded-lg w-3/4 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-100 rounded w-full relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.1 }}
            />
          </div>
          <div className="h-3 bg-gray-100 rounded w-2/3 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.2 }}
            />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="flex items-center gap-3 pt-2">
          <div className="h-6 bg-gray-100 rounded-full w-16 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.3 }}
            />
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-14 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.4 }}
            />
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-100 rounded w-20 relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.5 }}
            />
          </div>
          <div className="h-6 w-6 bg-gray-100 rounded-lg relative overflow-hidden">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: 0.6 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Grid of skeleton cards for loading state
interface FormsGridSkeletonProps {
  count?: number;
}

export function FormsGridSkeleton({ count = 6 }: FormsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <FormCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

// Stats Skeleton
export function FormsStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-100 p-4 relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: index * 0.1 }}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-12 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: index * 0.1 + 0.1 }}
                />
              </div>
              <div className="h-5 bg-gray-200 rounded w-8 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: index * 0.1 + 0.2 }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
