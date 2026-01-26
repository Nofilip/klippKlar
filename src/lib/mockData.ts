// Mock data and handlers for frontend-only testing
import type { Service, Staff, Booking, CurrentUser, Block, WorkingHour, AdminUser } from '@/types';

// ============ MOCK SERVICES ============
export const mockServices: Service[] = [
  {
    id: 'svc-1',
    name_public: 'Snabb uppfräschning',
    duration_min: 15,
    is_active: true,
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'svc-2',
    name_public: 'Klippning',
    duration_min: 30,
    is_active: true,
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'svc-3',
    name_public: 'Klippning – extra tid',
    duration_min: 60,
    is_active: true,
    created_at: '2025-01-01T10:00:00Z',
  },
];

// ============ MOCK STAFF ============
export const mockStaff: Staff[] = [
  {
    id: 'staff-1',
    name: 'Anna Andersson',
    is_active: true,
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'staff-2',
    name: 'Erik Eriksson',
    is_active: true,
    created_at: '2025-01-01T10:00:00Z',
  },
  {
    id: 'staff-3',
    name: 'Maria Svensson',
    is_active: false,
    created_at: '2025-01-01T10:00:00Z',
  },
];

// ============ MOCK BOOKINGS ============
export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    customer_name: 'Karin Johansson',
    customer_email: 'karin@example.com',
    customer_phone: '+46701112233',
    service_id: 'svc-2',
    service_name: 'Klippning',
    staff_id: 'staff-1',
    staff_name: 'Anna Andersson',
    start_dt: new Date().toISOString().split('T')[0] + 'T10:00:00Z',
    end_dt: new Date().toISOString().split('T')[0] + 'T10:30:00Z',
    status: 'booked',
    created_at: '2025-01-10T08:00:00Z',
  },
  {
    id: 'booking-2',
    customer_name: 'Peter Lindqvist',
    customer_email: 'peter@example.com',
    customer_phone: '+46702223344',
    service_id: 'svc-1',
    service_name: 'Snabb uppfräschning',
    staff_id: 'staff-2',
    staff_name: 'Erik Eriksson',
    start_dt: new Date().toISOString().split('T')[0] + 'T14:00:00Z',
    end_dt: new Date().toISOString().split('T')[0] + 'T14:15:00Z',
    status: 'booked',
    created_at: '2025-01-10T09:00:00Z',
  },
];

// ============ MOCK CURRENT USER ============
export const mockCurrentUser: CurrentUser = {
  id: 'user-1',
  email: 'demo@salong.se',
  role: 'owner',
  salon_name: 'Demo Salong',
};

// ============ MOCK BLOCKS ============
export const mockBlocks: Block[] = [];

// ============ MOCK WORKING HOURS ============
export const mockWorkingHours: WorkingHour[] = [
  { id: 'wh-1', staff_id: 'staff-1', day_of_week: 1, start_time: '09:00', end_time: '17:00', is_active: true },
  { id: 'wh-2', staff_id: 'staff-1', day_of_week: 2, start_time: '09:00', end_time: '17:00', is_active: true },
  { id: 'wh-3', staff_id: 'staff-1', day_of_week: 3, start_time: '09:00', end_time: '17:00', is_active: true },
  { id: 'wh-4', staff_id: 'staff-1', day_of_week: 4, start_time: '09:00', end_time: '17:00', is_active: true },
  { id: 'wh-5', staff_id: 'staff-1', day_of_week: 5, start_time: '09:00', end_time: '15:00', is_active: true },
];

// ============ MOCK ADMIN USERS ============
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    email: 'demo@salong.se',
    role: 'owner',
    is_active: true,
    created_at: '2025-01-01T10:00:00Z',
  },
];

// ============ IVR SIMULATION STATE ============
interface IvrSession {
  callId: string;
  callerPhone: string;
  serviceId: string;
  options: string[];
  selectedOption: number | null;
  holdId: string | null;
}

const ivrSessions = new Map<string, IvrSession>();

const generateTimeOptions = (): string[] => {
  const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag'];
  const times = ['09:00', '10:30', '13:00', '14:30', '16:00'];
  
  const options: string[] = [];
  for (let i = 0; i < 3; i++) {
    const day = days[Math.floor(Math.random() * days.length)];
    const time = times[Math.floor(Math.random() * times.length)];
    options.push(`${day} ${time}`);
  }
  return options;
};

// ============ MOCK API HANDLERS ============
// Handlers are defined with pattern matching support
type MockHandler = (body?: unknown, params?: Record<string, string>) => unknown;

const mockHandlers: Array<{
  method: string;
  pattern: RegExp;
  handler: MockHandler;
}> = [
  // GET /me - Current user
  {
    method: 'GET',
    pattern: /^\/me$/,
    handler: () => mockCurrentUser,
  },
  
  // GET /services
  {
    method: 'GET',
    pattern: /^\/services$/,
    handler: () => mockServices,
  },
  
  // GET /staff
  {
    method: 'GET',
    pattern: /^\/staff$/,
    handler: () => mockStaff,
  },
  
  // GET /bookings
  {
    method: 'GET',
    pattern: /^\/bookings/,
    handler: () => mockBookings,
  },
  
  // GET /blocks
  {
    method: 'GET',
    pattern: /^\/blocks/,
    handler: () => mockBlocks,
  },
  
  // GET /working-hours
  {
    method: 'GET',
    pattern: /^\/working-hours/,
    handler: (_, params) => {
      if (params?.staffId) {
        return mockWorkingHours.filter(wh => wh.staff_id === params.staffId);
      }
      return mockWorkingHours;
    },
  },
  
  // GET /admin-users
  {
    method: 'GET',
    pattern: /^\/admin-users$/,
    handler: () => mockAdminUsers,
  },
  
  // POST /ivr/sim/start
  {
    method: 'POST',
    pattern: /^\/ivr\/sim\/start$/,
    handler: (body) => {
      const { callerPhone, serviceId } = body as { callerPhone: string; serviceId: string };
      const callId = `call-${Date.now()}`;
      const options = generateTimeOptions();
      
      const session: IvrSession = {
        callId,
        callerPhone,
        serviceId,
        options,
        selectedOption: null,
        holdId: null,
      };
      ivrSessions.set(callId, session);
      
      const service = mockServices.find(s => s.id === serviceId);
      const serviceName = service?.name_public || 'tjänsten';
      
      return {
        callId,
        message: `Välkommen till bokningssystemet. Du har valt ${serviceName}. Välj en tid: Tryck 1 för ${options[0]}, tryck 2 för ${options[1]}, tryck 3 för ${options[2]}. Tryck 9 för att höra alternativen igen.`,
        options,
      };
    },
  },
  
  // POST /ivr/sim/input
  {
    method: 'POST',
    pattern: /^\/ivr\/sim\/input$/,
    handler: (body) => {
      const { callId, digit } = body as { callId: string; digit: string };
      const session = ivrSessions.get(callId);
      
      if (!session) {
        return {
          message: 'Fel: Inget aktivt samtal hittades.',
          done: true,
        };
      }
      
      // Repeat options
      if (digit === '9') {
        return {
          message: `Upprepar alternativen… Tryck 1 för ${session.options[0]}, tryck 2 för ${session.options[1]}, tryck 3 för ${session.options[2]}.`,
          options: session.options,
        };
      }
      
      // Select time slot
      if (['1', '2', '3'].includes(digit) && !session.holdId) {
        const optionIndex = parseInt(digit) - 1;
        const selectedTime = session.options[optionIndex];
        const holdId = `hold-${Date.now()}`;
        
        session.selectedOption = parseInt(digit);
        session.holdId = holdId;
        ivrSessions.set(callId, session);
        
        return {
          message: `Du har valt ${selectedTime}. Tryck 1 för att bekräfta bokningen, eller tryck 0 för att avbryta.`,
          holdId,
        };
      }
      
      // Confirm booking (digit 1 after selection)
      if (digit === '1' && session.holdId) {
        const bookingId = `booking-${Date.now()}`;
        const selectedTime = session.options[session.selectedOption! - 1];
        
        ivrSessions.delete(callId);
        
        return {
          message: `Bokning bekräftad! Din tid är ${selectedTime}. Ditt boknings-ID är ${bookingId}. Vi ses då! Hej då.`,
          bookingId,
          done: true,
        };
      }
      
      // Cancel
      if (digit === '0') {
        session.holdId = null;
        session.selectedOption = null;
        ivrSessions.set(callId, session);
        
        return {
          message: `Avbrutet. Välj en ny tid: Tryck 1 för ${session.options[0]}, tryck 2 för ${session.options[1]}, tryck 3 för ${session.options[2]}.`,
          options: session.options,
        };
      }
      
      // Invalid input
      return {
        message: 'Ogiltigt val. Tryck 1, 2 eller 3 för att välja en tid, eller tryck 9 för att höra alternativen igen.',
      };
    },
  },
  
  // POST /auth/logout
  {
    method: 'POST',
    pattern: /^\/auth\/logout$/,
    handler: () => ({ success: true }),
  },
  
  // POST /bookings/cancel
  {
    method: 'POST',
    pattern: /^\/bookings\/cancel$/,
    handler: () => ({ success: true }),
  },
];

// Helper to match endpoint patterns
export function getMockHandler(method: string, endpoint: string): ((body?: unknown) => unknown) | null {
  // Extract base path and query params
  const [basePath, queryString] = endpoint.split('?');
  const params: Record<string, string> = {};
  
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }
  
  for (const route of mockHandlers) {
    if (route.method === method && route.pattern.test(basePath)) {
      return (body?: unknown) => route.handler(body, params);
    }
  }
  
  return null;
}
