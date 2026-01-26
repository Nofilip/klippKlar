import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, differenceInMinutes } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Calendar, Clock, Scissors, User, Phone, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Booking } from '@/types';

interface NextBookingCardProps {
  booking: Booking | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

function getDateBadge(dateStr: string): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return { label: 'Idag', variant: 'default' };
  }
  if (isTomorrow(date)) {
    return { label: 'Imorgon', variant: 'secondary' };
  }
  return { label: format(date, 'd MMM', { locale: sv }), variant: 'outline' };
}

function getTimeUntil(startDt: string): string | null {
  const now = new Date();
  const start = new Date(startDt);
  const minutes = differenceInMinutes(start, now);
  
  if (minutes <= 0) return null;
  if (minutes < 60) return `Om ${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `Om ${hours} h`;
  return `Om ${hours} h ${remainingMinutes} min`;
}

export function NextBookingCard({ booking, isLoading, error, onRetry }: NextBookingCardProps) {
  const dateBadge = booking ? getDateBadge(booking.start_dt) : null;
  const timeRange = booking
    ? `${format(new Date(booking.start_dt), 'HH:mm')} – ${format(new Date(booking.end_dt), 'HH:mm')}`
    : '';
  const timeUntil = booking && isToday(new Date(booking.start_dt)) ? getTimeUntil(booking.start_dt) : null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-display">Nästa bokning</CardTitle>
        {dateBadge && !isLoading && !error && booking && (
          <Badge variant={dateBadge.variant}>{dateBadge.label}</Badge>
        )}
      </CardHeader>
      <CardContent className="pb-3 flex-1">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-28" />
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              Kunde inte ladda bokningar
            </p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Försök igen
            </Button>
          </div>
        ) : booking ? (
          <div className="space-y-3">
            {/* Time - Primary info */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <time className="text-2xl font-semibold text-foreground tracking-tight">
                  {timeRange}
                </time>
                {timeUntil && (
                  <span className="text-xs text-muted-foreground">{timeUntil}</span>
                )}
              </div>
            </div>

            {/* Customer name - Secondary */}
            <p className="text-lg font-medium text-foreground pl-12">
              {booking.customer_name}
            </p>

            {/* Service & Staff - Tertiary */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pl-12">
              <Scissors className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{booking.service_name}</span>
              <span className="text-muted-foreground/50">•</span>
              <User className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{booking.staff_name}</span>
            </div>

            {/* Phone - Clear action chip */}
            <div className="pl-12">
              <a
                href={`tel:${booking.customer_phone}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 active:bg-primary/25 px-3 py-1.5 rounded-full transition-colors"
                aria-label={`Ring ${booking.customer_name}`}
              >
                <Phone className="w-4 h-4" aria-hidden="true" />
                <span>Ring {booking.customer_phone}</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">Inga kommande bokningar</p>
            <p className="text-sm text-muted-foreground">
              Du har inga fler bokningar idag
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 border-t mt-auto">
        <Link 
          to="/bookings" 
          className="flex items-center justify-between w-full py-3 -mx-1 px-1 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted transition-colors group"
        >
          <span>Visa alla bokningar</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
