import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/apiClient';
import { demoLogin } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await authApi.requestLink(email);

    if (response.error) {
      if (response.error.code === '403' || response.error.message.toLowerCase().includes('not authorized')) {
        setError('Denna e-postadress är inte registrerad som administratör.');
      } else {
        setError(response.error.message);
      }
    } else {
      setIsSuccess(true);
    }

    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-elevated p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Kolla din e-post
            </h1>
            <p className="text-muted-foreground mb-6">
              Vi har skickat en inloggningslänk till <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Länken är giltig i 10 minuter. Kontrollera skräpposten om du inte hittar mailet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-elevated p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gradient mb-2">
              Salongsadmin
            </h1>
            <p className="text-muted-foreground">
              Logga in för att hantera din salong
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-postadress</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="din@email.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div 
                className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Skicka inloggningslänk
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Info */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Du kommer få en magisk länk som loggar in dig direkt — inget lösenord behövs.
          </p>

          {/* DEMO MODE - Ta bort denna sektion för produktion */}
          <div className="mt-8 pt-6 border-t border-dashed border-amber-500/50">
            <div className="flex items-center justify-center gap-2 mb-3">
              <FlaskConical className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-500 uppercase tracking-wide">
                Endast för demo/dev
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
              onClick={demoLogin}
            >
              <FlaskConical className="mr-2 w-4 h-4" />
              Demo login (owner)
            </Button>
            <p className="mt-2 text-center text-xs text-amber-500/70">
              Loggar in som demo-användare utan backend
            </p>
          </div>
          {/* SLUT PÅ DEMO MODE */}
        </div>
      </div>
    </div>
  );
}
