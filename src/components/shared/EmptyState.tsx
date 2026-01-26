import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default';
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className,
  size = 'default'
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      size === 'sm' ? 'py-8 px-4' : 'py-12 px-6',
      className
    )}>
      <div className={cn(
        'rounded-full bg-muted flex items-center justify-center',
        size === 'sm' ? 'w-10 h-10 mb-3' : 'w-14 h-14 mb-4'
      )}>
        <Icon className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
        )} />
      </div>
      <h3 className={cn(
        'font-semibold text-foreground',
        size === 'sm' ? 'text-base mb-1' : 'text-lg mb-1.5'
      )}>
        {title}
      </h3>
      <p className={cn(
        'text-muted-foreground max-w-sm',
        size === 'sm' ? 'text-sm mb-4' : 'text-sm mb-5'
      )}>
        {description}
      </p>
      {action}
    </div>
  );
}
