import { useState, useEffect, useCallback, createContext, useContext, ReactNode, createElement } from 'react';
import type { CurrentUser } from '@/types';
import { authApi } from '@/lib/apiClient';

// ============================================
// DEMO MODE - Ta bort denna sektion för produktion
// ============================================
const DEMO_STORAGE_KEY = 'demo_auth_user';

const DEMO_USER: CurrentUser = {
  id: 'demo-user-1',
  email: 'demo@example.com',
  role: 'owner',
  salon_name: 'Demo Salong',
};

function getDemoUser(): CurrentUser | null {
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setDemoUser(user: CurrentUser | null): void {
  if (user) {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(DEMO_STORAGE_KEY);
  }
}

export function demoLogin(): void {
  setDemoUser(DEMO_USER);
  window.location.href = '/dashboard';
}

export function isDemoMode(): boolean {
  return getDemoUser() !== null;
}
// ============================================
// SLUT PÅ DEMO MODE
// ============================================

interface AuthContextType {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // DEMO MODE: Kolla localStorage först
    const demoUser = getDemoUser();
    if (demoUser) {
      setUser(demoUser);
      setIsLoading(false);
      return;
    }
    // SLUT PÅ DEMO MODE
    
    const response = await authApi.getMe();
    
    if (response.error) {
      setUser(null);
      if (response.error.code !== '401') {
        setError(response.error.message);
      }
    } else if (response.data) {
      setUser(response.data);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    // DEMO MODE: Rensa localStorage
    if (isDemoMode()) {
      setDemoUser(null);
      setUser(null);
      return;
    }
    // SLUT PÅ DEMO MODE
    
    await authApi.logout();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    isOwner: user?.role === 'owner',
    logout,
    refetch: fetchUser,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
