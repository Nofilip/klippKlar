import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Calendar, Scissors, Users, Clock, ArrowRight, User } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NextBookingCard } from '@/components/dashboard/NextBookingCard';
import { bookingsApi } from '@/lib/apiClient';
import type { Booking } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    
    const response = await bookingsApi.list({ from: today, to: today });
    
    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      setBookings(response.data);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const todaysBookings = bookings.filter(b => b.status === 'booked');
  const nextBooking = todaysBookings
    .filter(b => new Date(b.start_dt) > new Date())
    .sort((a, b) => new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime())[0];

  const quickLinks = [
    { name: 'Bokningar', href: '/bookings', icon: Calendar, color: 'bg-accent' },
    { name: 'Tjänster', href: '/services', icon: Scissors, color: 'bg-secondary' },
    { name: 'Frisörer', href: '/staff', icon: Users, color: 'bg-accent' },
    { name: 'Arbetstider', href: '/working-hours', icon: Clock, color: 'bg-secondary' },
  ];

  return (
    <AppLayout>
      <PageContainer>
        <PageHeader 
          title={`Hej${user?.salon_name ? `, ${user.salon_name}` : ''}!`}
          description={format(new Date(), "EEEE d MMMM yyyy", { locale: sv })}
        />

        <div className="mt-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((link) => (
              <Link key={link.name} to={link.href}>
                <Card className="hover:shadow-card transition-shadow cursor-pointer group">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center`}>
                      <link.icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {link.name}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Next Booking */}
          <NextBookingCard
            booking={nextBooking || null}
            isLoading={isLoading}
            error={error}
            onRetry={fetchBookings}
          />

          {/* Today's Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Dagens bokningar</CardTitle>
              <Link to="/bookings">
                <Button variant="ghost" size="sm">
                  Visa alla
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingState variant="list" rows={3} />
              ) : error ? (
                <ErrorState message={error} onRetry={fetchBookings} />
              ) : todaysBookings.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Inga bokningar"
                  description="Det finns inga bokningar för idag."
                  action={
                    <Link to="/bookings">
                      <Button variant="outline">Gå till bokningar</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {todaysBookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {booking.customer_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.service_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {format(new Date(booking.start_dt), 'HH:mm')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.staff_name}
                        </p>
                      </div>
                    </div>
                  ))}
                  {todaysBookings.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                      +{todaysBookings.length - 5} fler bokningar
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
