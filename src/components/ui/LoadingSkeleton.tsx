import React from 'react';
import { cn } from '@/lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('animate-pulse rounded-xl bg-slate-200/70', className)} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-7 w-20 rounded-xl" />
        <Skeleton className="h-7 w-24 rounded-xl" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
};

export default Skeleton;
