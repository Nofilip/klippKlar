import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  rows?: number;
  variant?: 'card' | 'list' | 'table' | 'booking-card' | 'calendar';
  className?: string;
}

export function LoadingState({ rows = 3, variant = 'card', className }: LoadingStateProps) {
  if (variant === 'card') {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card animate-pulse">
            <Skeleton className="h-5 w-2/3 mb-3" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card animate-pulse">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'booking-card') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border border-border bg-card animate-pulse">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <div className="space-y-1 text-right shrink-0">
                    <Skeleton className="h-4 w-12 ml-auto" />
                    <Skeleton className="h-3 w-10 ml-auto" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pl-[52px] sm:pl-[60px]">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'calendar') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Week navigation skeleton */}
        <div className="p-4 rounded-lg border border-border bg-card animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-8 w-14 rounded-md" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
          {/* Week days skeleton */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-2 sm:p-3 min-h-[72px] sm:min-h-[80px]">
                <Skeleton className="h-3 w-4 mb-1" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Day header skeleton */}
        <Skeleton className="h-6 w-48" />
        {/* Booking list skeleton */}
        <LoadingState variant="booking-card" rows={3} />
      </div>
    );
  }

  // Table variant
  return (
    <div className={cn('rounded-lg border border-border overflow-hidden animate-pulse', className)}>
      <div className="bg-muted/50 p-4">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-t border-border">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
