import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Shows CTA in sticky footer on mobile instead of inline */
  stickyMobileCTA?: boolean;
  /** Shows a back button (not shown on Dashboard) */
  showBackButton?: boolean;
}

export function PageHeader({ title, description, children, className, stickyMobileCTA = false, showBackButton = false }: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show back button on dashboard
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const shouldShowBack = showBackButton && !isDashboard;

  return (
    <>
      <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8', className)}>
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {shouldShowBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="shrink-0 -ml-2 text-muted-foreground hover:text-foreground"
                aria-label="Tillbaka"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              {title}
            </h1>
          </div>
          {description && (
            <p className={cn("text-sm text-muted-foreground max-w-lg", shouldShowBack && "ml-8")}>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className={cn(
            'flex items-center gap-3 shrink-0',
            stickyMobileCTA && 'hidden md:flex'
          )}>
            {children}
          </div>
        )}
      </div>
      
      {/* Sticky mobile CTA */}
      {children && stickyMobileCTA && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 glass border-t border-border z-30 safe-area-bottom">
          <div className="flex items-center gap-3">
            {children}
          </div>
        </div>
      )}
    </>
  );
}