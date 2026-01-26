import { format, isToday, isTomorrow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Calendar } from 'lucide-react';
import { BookingCard } from './BookingCard';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';

interface BookingDaySectionProps {
  date: Date;
  bookings: Booking[];
  onCancelBooking?: (booking: Booking) => void;
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Idag';
  if (isTomorrow(date)) return 'Imorgon';
  return format(date, 'EEEE', { locale: sv });
}

export function BookingDaySection({ date, bookings, onCancelBooking }: BookingDaySectionProps) {
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime()
  );

  const bookedCount = bookings.filter(b => b.status === 'booked').length;
  const dateLabel = getDateLabel(date);
  const fullDateLabel = format(date, 'd MMMM yyyy', { locale: sv });

  return (
    <section 
      aria-labelledby={`date-heading-${format(date, 'yyyy-MM-dd')}`}
      className="space-y-3"
    >
      {/* Date header */}
      <header className={cn(
        "sticky top-0 z-10 flex items-center justify-between py-3 px-1",
        "bg-background/95 backdrop-blur-sm border-b border-border"
      )}>
        <div className="flex items-center gap-3">
          <div 
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isToday(date) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            )}
            aria-hidden="true"
          >
            <span className="font-semibold text-sm">{format(date, 'd')}</span>
          </div>
          <div>
            <h2 
              id={`date-heading-${format(date, 'yyyy-MM-dd')}`}
              className={cn(
                "font-semibold capitalize",
                isToday(date) && "text-primary"
              )}
            >
              {dateLabel}
              <span className="sr-only">, {fullDateLabel}</span>
            </h2>
            <p className="text-xs text-muted-foreground" aria-hidden="true">
              {fullDateLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>
            {bookedCount} {bookedCount === 1 ? 'bokning' : 'bokningar'}
          </span>
        </div>
      </header>

      {/* Booking cards list */}
      <ul className="space-y-3 pb-2" role="list" aria-label={`Bokningar för ${dateLabel}`}>
        {sortedBookings.map((booking) => (
          <li key={booking.id}>
            <BookingCard
              booking={booking}
              onCancel={onCancelBooking}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
