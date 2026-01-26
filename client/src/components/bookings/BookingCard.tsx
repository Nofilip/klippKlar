import { format } from 'date-fns';
import { Clock, Scissors, User, Phone, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, getBookingStatusVariant, getBookingStatusText } from '@/components/shared/StatusBadge';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (booking: Booking) => void;
}

export function BookingCard({ booking, onCancel }: BookingCardProps) {
  const timeRange = `${format(new Date(booking.start_dt), 'HH:mm')} - ${format(new Date(booking.end_dt), 'HH:mm')}`;
  const statusText = getBookingStatusText(booking.status);

  return (
    <article aria-label={`Bokning för ${booking.customer_name} kl ${timeRange}`}>
      <Card className="animate-fade-in">
        <CardContent className="p-4">
          {/* Time badge */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div 
              className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg"
            >
              <Clock className="w-4 h-4" aria-hidden="true" />
              <time className="font-semibold text-sm">
                {timeRange}
              </time>
            </div>
            <StatusBadge variant={getBookingStatusVariant(booking.status)}>
              {statusText}
            </StatusBadge>
          </div>

          {/* Service & Staff info */}
          <dl className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <dt className="sr-only">Tjänst</dt>
              <Scissors className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <dd className="font-medium text-foreground">{booking.service_name}</dd>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <dt className="sr-only">Frisör</dt>
              <User className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <dd>
                <span className="text-muted-foreground">med </span>
                <span className="font-medium text-foreground">{booking.staff_name}</span>
              </dd>
            </div>
          </dl>

          {/* Customer info */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground truncate">{booking.customer_name}</p>
                <a 
                  href={`tel:${booking.customer_phone}`} 
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded transition-colors mt-0.5"
                  aria-label={`Ring ${booking.customer_name} på ${booking.customer_phone}`}
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{booking.customer_phone}</span>
                </a>
              </div>

              {booking.status === 'booked' && onCancel && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 touch-target shrink-0"
                  onClick={() => onCancel(booking)}
                  aria-label={`Avboka bokning för ${booking.customer_name}`}
                >
                  <XCircle className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Avboka</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
