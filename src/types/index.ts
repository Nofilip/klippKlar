// Core entity types for the salon admin app

export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: string;
  service_name: string;
  staff_id: string;
  staff_name: string;
  start_dt: string;
  end_dt: string;
  status: 'booked' | 'cancelled' | 'completed';
  created_at: string;
}

export interface Staff {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  name_public: string;
  duration_min: 15 | 30 | 60;
  is_active: boolean;
  created_at: string;
}

export interface WorkingHour {
  id: string;
  staff_id: string;
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Monday, 6 = Sunday
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  is_active: boolean;
}

export interface Block {
  id: string;
  staff_id: string;
  staff_name: string;
  start_dt: string;
  end_dt: string;
  reason: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'owner';
  is_active: boolean;
  created_at: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: 'admin' | 'owner';
  salon_name: string;
}

// API Response types
export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
