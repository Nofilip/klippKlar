import { useState } from 'react';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message: string;
  technicalDetails?: string;
  onRetry?: () => void;
  className?: string;
  size?: 'sm' | 'default';
}

// Utility to detect and clean technical error messages
function getUserFriendlyMessage(message: string): { friendly: string; technical?: string } {
  // Detect common technical patterns
  const technicalPatterns = [
    /Unexpected token/i,
    /<!doctype/i,
    /SyntaxError/i,
    /TypeError/i,
    /ReferenceError/i,
    /NetworkError/i,
    /Failed to fetch/i,
    /ECONNREFUSED/i,
    /500 Internal/i,
    /502 Bad Gateway/i,
    /503 Service/i,
    /504 Gateway/i,
  ];

  const isTechnical = technicalPatterns.some(pattern => pattern.test(message));

  if (isTechnical) {
    return {
      friendly: 'Kunde inte ladda data. Kontrollera din anslutning eller försök igen om en stund.',
      technical: message
    };
  }

  // Already user-friendly
  return { friendly: message };
}

export function ErrorState({ 
  title = 'Något gick fel', 
  message, 
  technicalDetails,
  onRetry, 
  className,
  size = 'default'
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { friendly, technical } = getUserFriendlyMessage(message);
  const details = technicalDetails || technical;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      size === 'sm' ? 'py-8 px-4' : 'py-12 px-6',
      className
    )}>
      <div className={cn(
        'rounded-full bg-destructive/10 flex items-center justify-center',
        size === 'sm' ? 'w-10 h-10 mb-3' : 'w-14 h-14 mb-4'
      )}>
        <AlertCircle className={cn(
          'text-destructive',
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
        {friendly}
      </p>
      
      <div className="flex flex-col items-center gap-3">
        {onRetry && (
          <Button variant="default" onClick={onRetry} size={size === 'sm' ? 'sm' : 'default'}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Försök igen
          </Button>
        )}
        
        {details && (
          <div className="w-full max-w-sm">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showDetails ? 'Dölj detaljer' : 'Visa detaljer'}
            </button>
            {showDetails && (
              <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border text-left">
                <code className="text-xs text-muted-foreground break-all whitespace-pre-wrap">
                  {details}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
