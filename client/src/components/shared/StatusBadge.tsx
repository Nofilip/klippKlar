import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Circle } from 'lucide-react';

type BadgeVariant = 'default' | 'booked' | 'cancelled' | 'completed' | 'active' | 'inactive' | 'pending';

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'default';
  showIcon?: boolean;
}

const variantConfig: Record<BadgeVariant, { className: string; icon?: React.ComponentType<{ className?: string }> }> = {
  default: { 
    className: 'bg-muted text-muted-foreground border border-border', 
    icon: Circle 
  },
  booked: { 
    className: 'bg-primary/15 text-primary border border-primary/25', 
    icon: Clock 
  },
  cancelled: { 
    className: 'bg-destructive/10 text-destructive border border-destructive/20', 
    icon: XCircle 
  },
  completed: { 
    className: 'bg-success/10 text-success border border-success/25', 
    icon: CheckCircle2 
  },
  active: { 
    className: 'bg-success/10 text-success border border-success/25', 
    icon: CheckCircle2 
  },
  inactive: { 
    className: 'bg-muted text-muted-foreground border border-border', 
    icon: Circle 
  },
  pending: { 
    className: 'bg-warning/10 text-warning-foreground border border-warning/25', 
    icon: Clock 
  },
};

export function StatusBadge({ variant, children, className, size = 'default', showIcon = true }: StatusBadgeProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-1.5 font-semibold rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        config.className,
        className
      )}
    >
      {showIcon && Icon && <Icon className={cn(size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />}
      {children}
    </span>
  );
}

// Utility to get the right variant based on booking status
export function getBookingStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'booked':
      return 'booked';
    case 'cancelled':
      return 'cancelled';
    case 'completed':
      return 'completed';
    default:
      return 'default';
  }
}

export function getBookingStatusText(status: string): string {
  switch (status) {
    case 'booked':
      return 'Bokad';
    case 'cancelled':
      return 'Avbokad';
    case 'completed':
      return 'Slutförd';
    default:
      return status;
  }
}

// Utility for active/inactive status
export function getActiveStatusVariant(isActive: boolean): BadgeVariant {
  return isActive ? 'active' : 'inactive';
}

export function getActiveStatusText(isActive: boolean): string {
  return isActive ? 'Aktiv' : 'Inaktiv';
}