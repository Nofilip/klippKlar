import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
}

export function ProtectedRoute({ children, requireOwner = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isOwner } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireOwner && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Saknar behörighet
          </h1>
          <p className="text-muted-foreground">
            Du behöver ägarrättigheter för att se denna sida.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
