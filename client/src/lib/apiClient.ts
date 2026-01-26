// Central API client for all REST calls
// All endpoints are relative to /api on the same origin

import type { ApiResponse, ApiError } from '@/types';
import { getMockHandler } from './mockData';

// Toggle mock mode for frontend-only testing
const MOCK_API = true;

// Simulate network delay for realistic UX
const MOCK_DELAY_MS = 300;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const method = options.method || 'GET';
    
    // Check for mock handler
    if (MOCK_API) {
      const handler = getMockHandler(method, endpoint);
      if (handler) {
        await delay(MOCK_DELAY_MS);
        try {
          const body = options.body ? JSON.parse(options.body as string) : undefined;
          const data = handler(body) as T;
          return { data };
        } catch (error) {
          return {
            error: {
              message: error instanceof Error ? error.message : 'Mock error',
              code: 'MOCK_ERROR',
            },
          };
        }
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          error: {
            message: errorData.message || `Request failed with status ${response.status}`,
            code: errorData.code || response.status.toString(),
          },
        };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as T };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Auth endpoints
export const authApi = {
  requestLink: (email: string) => 
    apiClient.post<{ message: string }>('/auth/request-link', { email }),
  logout: () => 
    apiClient.post<void>('/auth/logout'),
  getMe: () => 
    apiClient.get<import('@/types').CurrentUser>('/me'),
};

// Bookings endpoints
export const bookingsApi = {
  list: (params: { from: string; to: string; status?: string }) => 
    apiClient.get<import('@/types').Booking[]>('/bookings', params as Record<string, string>),
  cancel: (bookingId: string) => 
    apiClient.post<void>('/bookings/cancel', { bookingId }),
};

// Services endpoints
export const servicesApi = {
  list: () => 
    apiClient.get<import('@/types').Service[]>('/services'),
  create: (data: Omit<import('@/types').Service, 'id' | 'created_at'>) => 
    apiClient.post<import('@/types').Service>('/services', data),
  update: (id: string, data: Partial<import('@/types').Service>) => 
    apiClient.patch<import('@/types').Service>(`/services/${id}`, data),
};

// Staff endpoints
export const staffApi = {
  list: () => 
    apiClient.get<import('@/types').Staff[]>('/staff'),
  create: (data: Omit<import('@/types').Staff, 'id' | 'created_at'>) => 
    apiClient.post<import('@/types').Staff>('/staff', data),
  update: (id: string, data: Partial<import('@/types').Staff>) => 
    apiClient.patch<import('@/types').Staff>(`/staff/${id}`, data),
};

// Working hours endpoints
export const workingHoursApi = {
  list: (staffId: string) => 
    apiClient.get<import('@/types').WorkingHour[]>('/working-hours', { staffId }),
  create: (data: Omit<import('@/types').WorkingHour, 'id'>) => 
    apiClient.post<import('@/types').WorkingHour>('/working-hours', data),
  update: (id: string, data: Partial<import('@/types').WorkingHour>) => 
    apiClient.patch<import('@/types').WorkingHour>(`/working-hours/${id}`, data),
};

// Blocks endpoints
export const blocksApi = {
  list: (params: { staffId?: string; from?: string; to?: string }) => 
    apiClient.get<import('@/types').Block[]>('/blocks', params as Record<string, string>),
  create: (data: Omit<import('@/types').Block, 'id' | 'staff_name' | 'created_at'>) => 
    apiClient.post<import('@/types').Block>('/blocks', data),
  delete: (id: string) => 
    apiClient.delete<void>(`/blocks/${id}`),
};

// Admin users endpoints
export const adminUsersApi = {
  list: () => 
    apiClient.get<import('@/types').AdminUser[]>('/admin-users'),
  create: (data: Omit<import('@/types').AdminUser, 'id' | 'created_at'>) => 
    apiClient.post<import('@/types').AdminUser>('/admin-users', data),
  update: (id: string, data: Partial<import('@/types').AdminUser>) => 
    apiClient.patch<import('@/types').AdminUser>(`/admin-users/${id}`, data),
};
