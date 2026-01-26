import { useMemo } from 'react';
import { format, isToday, isTomorrow, eachDayOfInterval, parseISO } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookingCardCompact } from './BookingCardCompact';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';

interface WeekDayAccordionProps {
  fromDate: string;
  toDate: string;
  bookings: Booking[];
  onCancelBooking?: (booking: Booking) => void;
}

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Idag';
  if (isTomorrow(date)) return 'Imorgon';
  return format(date, 'EEEE', { locale: sv });
}

export function WeekDayAccordion({ 
  fromDate, 
  toDate, 
  bookings, 
  onCancelBooking 
}: WeekDayAccordionProps) {
  // Generate all days in the week
  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: parseISO(fromDate),
      end: parseISO(toDate),
    });
  }, [fromDate, toDate]);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const groups = new Map<string, Booking[]>();
    
    bookings.forEach((booking) => {
      const dateKey = format(new Date(booking.start_dt), 'yyyy-MM-dd');
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(booking);
    });

    // Sort bookings within each day by time
    groups.forEach((dayBookings) => {
      dayBookings.sort((a, b) => 
        new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime()
      );
    });
    
    return groups;
  }, [bookings]);

  // Determine default expanded day
  const defaultExpandedDay = useMemo(() => {
    // First, check if today is in the week and has bookings
    const todayKey = weekDays.find(d => isToday(d));
    if (todayKey) {
      const todayDateKey = format(todayKey, 'yyyy-MM-dd');
      if (bookingsByDate.has(todayDateKey)) {
        return todayDateKey;
      }
      // Today is in week but no bookings - still expand it
      return todayDateKey;
    }
    
    // Otherwise, expand first day with bookings
    for (const day of weekDays) {
      const dateKey = format(day, 'yyyy-MM-dd');
      if (bookingsByDate.has(dateKey)) {
        return dateKey;
      }
    }
    
    // Fallback: first day
    return format(weekDays[0], 'yyyy-MM-dd');
  }, [weekDays, bookingsByDate]);

  return (
    <Accordion 
      type="single" 
      collapsible 
      defaultValue={defaultExpandedDay}
      className="space-y-2"
    >
      {weekDays.map((day) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const dayBookings = bookingsByDate.get(dateKey) || [];
        const bookedCount = dayBookings.filter(b => b.status === 'booked').length;
        const dateLabel = getDateLabel(day);
        const dayOfMonth = format(day, 'd');
        const monthLabel = format(day, 'MMM', { locale: sv });
        const isTodayDate = isToday(day);
        const hasBookings = dayBookings.length > 0;

        return (
          <AccordionItem 
            key={dateKey} 
            value={dateKey}
            className={cn(
              "border border-border rounded-xl overflow-hidden bg-card",
              isTodayDate && "ring-2 ring-primary/30 border-primary/50"
            )}
          >
            <AccordionTrigger 
              className={cn(
                "px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors",
                "[&[data-state=open]]:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                {/* Date badge */}
                <div 
                  className={cn(
                    "w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-medium",
                    isTodayDate 
                      ? "bg-primary text-primary-foreground" 
                      : hasBookings 
                        ? "bg-muted text-foreground"
                        : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  <span className="text-sm font-semibold leading-none">{dayOfMonth}</span>
                  <span className="text-[10px] uppercase leading-none mt-0.5">{monthLabel}</span>
                </div>

                {/* Day label */}
                <div className="text-left flex-1">
                  <p className={cn(
                    "font-medium capitalize",
                    isTodayDate && "text-primary"
                  )}>
                    {dateLabel}
                  </p>
                  {hasBookings ? (
                    <p className="text-xs text-muted-foreground">
                      {bookedCount} {bookedCount === 1 ? 'bokning' : 'bokningar'}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground/60">
                      Inga bokningar
                    </p>
                  )}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4">
              {hasBookings ? (
                <div className="space-y-2 pt-2">
                  {dayBookings.map((booking) => (
                    <BookingCardCompact
                      key={booking.id}
                      booking={booking}
                      onCancel={onCancelBooking}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Inga bokningar den här dagen</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
