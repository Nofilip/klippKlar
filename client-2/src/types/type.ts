

export type Booking = {
  id: string;
  phone_last4: string;
  service_type: string;
  start_dt: string;
  end_dt: string;
  status: 'booked' | 'cancelled' | 'completed';
  created_at: string;
}