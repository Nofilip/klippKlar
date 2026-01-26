import { useEffect, useState, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';
import { sv } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BookingFilters } from '@/components/bookings/BookingFilters';
import { WeekDayAccordion } from '@/components/bookings/WeekDayAccordion';
import { bookingsApi } from '@/lib/apiClient';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

import { useNavigate } from 'react-router-dom';

export default function BookingsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Date range state
  const today = new Date();
  const defaultFromDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const defaultToDate = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(defaultToDate);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    
    const params: { from: string; to: string; status?: string } = {
      from: fromDate,
      to: toDate,
    };
    
    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }
    
    const response = await bookingsApi.list(params);
    
    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      setBookings(response.data);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, [fromDate, toDate, statusFilter]);

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    
    setIsCancelling(true);
    const response = await bookingsApi.cancel(cancellingBooking.id);
    
    if (response.error) {
      toast({
        title: 'Kunde inte avboka',
        description: response.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Bokning avbokad',
        description: `Bokningen för ${cancellingBooking.customer_name} har avbokats.`,
      });
      fetchBookings();
    }
    
    setIsCancelling(false);
    setCancellingBooking(null);
  };

  // Quick navigation
  const goToPreviousWeek = () => {
    const newFrom = format(addDays(parseISO(fromDate), -7), 'yyyy-MM-dd');
    const newTo = format(addDays(parseISO(toDate), -7), 'yyyy-MM-dd');
    setFromDate(newFrom);
    setToDate(newTo);
  };

  const goToNextWeek = () => {
    const newFrom = format(addDays(parseISO(fromDate), 7), 'yyyy-MM-dd');
    const newTo = format(addDays(parseISO(toDate), 7), 'yyyy-MM-dd');
    setFromDate(newFrom);
    setToDate(newTo);
  };

  const goToToday = () => {
    setFromDate(defaultFromDate);
    setToDate(defaultToDate);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setFromDate(defaultFromDate);
    setToDate(defaultToDate);
  };

  const hasActiveFilters = statusFilter !== 'all';
  const totalBookings = bookings.length;
  const bookedCount = bookings.filter(b => b.status === 'booked').length;

  // Check if today is within the selected period
  const periodIncludesToday = isWithinInterval(today, {
    start: parseISO(fromDate),
    end: parseISO(toDate),
  });

  // Format week period label
  const weekPeriodLabel = `${format(parseISO(fromDate), 'd MMM', { locale: sv })} – ${format(parseISO(toDate), 'd MMM yyyy', { locale: sv })}`;

  return (
    <AppLayout>
      <PageContainer className="pb-0">
        {/* Sticky header */}
        <div className={cn(
          "sticky top-0 z-20 -mx-4 px-4 pt-4 pb-3",
          "bg-background/95 backdrop-blur-sm border-b border-border"
        )}>
          {/* Title row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="shrink-0 -ml-2 text-muted-foreground hover:text-foreground"
                aria-label="Tillbaka"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Bokningar</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">
                  Veckoöversikt
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Filter button - mobile */}
              <Sheet open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <SlidersHorizontal className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Filter</span>
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-2xl">
                  <SheetHeader className="pb-4">
                    <SheetTitle>Filtrera bokningar</SheetTitle>
                  </SheetHeader>
                  <BookingFilters
                    fromDate={fromDate}
                    toDate={toDate}
                    statusFilter={statusFilter}
                    onFromDateChange={setFromDate}
                    onToDateChange={setToDate}
                    onStatusChange={setStatusFilter}
                    onClearFilters={clearFilters}
                  />
                  <div className="mt-6 pb-safe">
                    <SheetClose asChild>
                      <Button className="w-full">
                        Visa {totalBookings} bokningar
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop status filter */}
              <div className="hidden lg:block">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alla status</SelectItem>
                    <SelectItem value="booked">Bokade</SelectItem>
                    <SelectItem value="cancelled">Avbokade</SelectItem>
                    <SelectItem value="completed">Slutförda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Week navigation row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPreviousWeek} 
                className="h-8 w-8"
                aria-label="Föregående vecka"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextWeek} 
                className="h-8 w-8"
                aria-label="Nästa vecka"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              {!periodIncludesToday && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={goToToday} 
                  className="h-8 ml-1 text-primary"
                >
                  Idag
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {weekPeriodLabel}
              </span>
              {bookedCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {bookedCount} bokade
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="py-4">
          {isLoading ? (
            <LoadingState variant="booking-card" rows={4} />
          ) : error ? (
            <ErrorState 
              title="Kunde inte ladda bokningar" 
              message={error} 
              onRetry={fetchBookings} 
            />
          ) : bookings.length === 0 && !hasActiveFilters ? (
            <EmptyState
              icon={Calendar}
              title="Inga bokningar denna vecka"
              description="Det finns inga bokningar för den valda veckan. Bokningar dyker upp här när kunder bokar tider."
            />
          ) : (
            <WeekDayAccordion
              fromDate={fromDate}
              toDate={toDate}
              bookings={bookings}
              onCancelBooking={setCancellingBooking}
            />
          )}
        </div>

        {/* Cancel confirmation dialog */}
        <AlertDialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Avboka bokning</AlertDialogTitle>
              <AlertDialogDescription>
                Är du säker på att du vill avboka bokningen för {cancellingBooking?.customer_name}? 
                Kunden kommer att meddelas via e-post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleCancelBooking}
                disabled={isCancelling}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isCancelling ? 'Avbokar...' : 'Ja, avboka'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageContainer>
    </AppLayout>
  );
}
