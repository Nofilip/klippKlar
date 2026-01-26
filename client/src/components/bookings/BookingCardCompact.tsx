import { format } from 'date-fns';
import { Clock, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, getBookingStatusVariant, getBookingStatusText } from '@/components/shared/StatusBadge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';

interface BookingCardCompactProps {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
}

export function BookingCardCompact({ booking, onCancel }: BookingCardCompactProps) {
  const timeRange = `${format(new Date(booking.start_dt), 'HH:mm')} - ${format(new Date(booking.end_dt), 'HH:mm')}`;
  const statusText = getBookingStatusText(booking.status);

  return (
    <article 
      className={cn(
        "bg-card border border-border rounded-xl p-3 transition-all relative",
        "hover:shadow-md hover:border-primary/20"
      )}
      aria-label={`Bokning för ${booking.customer_name} kl ${timeRange}`}
    >
      {/* Cancel button - top right icon */}
      {booking.status === 'booked' && onCancel && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label={`Avboka ${booking.customer_name}`}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Avboka bokning?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Är du säker på att du vill avboka denna bokning?</p>
                  <div className="bg-accent/50 rounded-lg p-3 space-y-1">
                    <p><strong>Kund:</strong> {booking.customer_name}</p>
                    <p><strong>Tid:</strong> {timeRange}</p>
                    <p><strong>Tjänst:</strong> {booking.service_name}</p>
                    <p><strong>Frisör:</strong> {booking.staff_name}</p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onCancel(booking)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Avboka
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Header: Time + Status */}
      <div className="flex items-center justify-between gap-2 mb-1.5 pr-8">
        <div className="flex items-center gap-1.5 text-primary font-semibold text-sm">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <time>{timeRange}</time>
        </div>
        <StatusBadge variant={getBookingStatusVariant(booking.status)} className="text-[10px] py-0 px-1.5">
          {statusText}
        </StatusBadge>
      </div>

      {/* Primary: Customer name */}
      <p className="font-semibold text-base text-foreground truncate mb-0.5">
        {booking.customer_name}
      </p>

      {/* Secondary: Service • Stylist */}
      <p className="text-sm text-muted-foreground truncate mb-2">
        {booking.service_name} <span className="mx-1">•</span> {booking.staff_name}
      </p>

      {/* Phone link */}
      <a 
        href={`tel:${booking.customer_phone}`} 
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors bg-accent/50 rounded-full px-2.5 py-1"
        aria-label={`Ring ${booking.customer_name}`}
      >
        <Phone className="w-3 h-3" aria-hidden="true" />
        <span>Ring {booking.customer_phone}</span>
      </a>
    </article>
  );
}