import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Adds padding at bottom for sticky mobile CTA */
  hasStickyMobileCTA?: boolean;
}

export function PageContainer({ children, className, hasStickyMobileCTA = false }: PageContainerProps) {
  return (
    <div className={cn(
      'p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto',
      hasStickyMobileCTA && 'pb-24 md:pb-8',
      className
    )}>
      {children}
    </div>
  );
}