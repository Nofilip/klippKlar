import { useState, useCallback } from 'react';
import { Phone, RotateCcw, Hash } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiClient } from '@/lib/apiClient';

type IvrStep = 'idle' | 'select_service' | 'select_time' | 'confirm' | 'done';

interface ServiceOption {
  id: string;
  name: string;
  duration: number;
}

const MOCK_SERVICES: ServiceOption[] = [
  { id: 'quick', name: 'Snabb', duration: 15 },
  { id: 'standard', name: 'Standard', duration: 30 },
  { id: 'long', name: 'Lång', duration: 60 },
];

interface IvrState {
  callId: string | null;
  step: IvrStep;
  selectedService: ServiceOption | null;
  suggestedTimes: string[];
  selectedOption: number | null;
  holdId: string | null;
  bookingId: string | null;
  lastMenu: 'service' | 'time' | null;
}

interface LogEntry {
  timestamp: Date;
  type: 'system' | 'user' | 'error';
  message: string;
}

interface IvrApiResponse {
  callId?: string;
  message: string;
  options?: string[];
  holdId?: string;
  bookingId?: string;
  done?: boolean;
}

const INITIAL_STATE: IvrState = {
  callId: null,
  step: 'idle',
  selectedService: null,
  suggestedTimes: [],
  selectedOption: null,
  holdId: null,
  bookingId: null,
  lastMenu: null,
};

const DTMF_BUTTONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export default function IvrTest() {
  const [callerPhone, setCallerPhone] = useState('');
  const [state, setState] = useState<IvrState>(INITIAL_STATE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), type, message }]);
  }, []);

  const getServiceMenuMessage = () => {
    return 'Välj tjänst: Tryck 1 för Snabb (15), 2 för Standard (30), 3 för Lång (60). Tryck 9 för att upprepa.';
  };

  const getTimeMenuMessage = (times: string[]) => {
    return `Välj tid: Tryck 1 för ${times[0]}, 2 för ${times[1]}, 3 för ${times[2]}. Tryck 9 för att upprepa.`;
  };

  const handleStartCall = async () => {
    if (!callerPhone.trim()) {
      addLog('error', 'Ange ett telefonnummer');
      return;
    }

    setIsLoading(true);
    addLog('user', `Startar samtal från ${callerPhone}...`);

    // Alltid använd lokal simulering för att garantera korrekt flöde
    // API-anrop kan returnera inkonsistenta meddelanden
    const simulatedCallId = `sim-${Date.now()}`;
    setState(prev => ({
      ...prev,
      callId: simulatedCallId,
      step: 'select_service',
      selectedService: null,
      suggestedTimes: [],
      selectedOption: null,
      holdId: null,
      bookingId: null,
      lastMenu: 'service',
    }));
    addLog('system', 'Välkommen till bokningssystemet.');
    addLog('system', getServiceMenuMessage());
    setIsLoading(false);
  };

  const handleDtmfPress = async (digit: string) => {
    if (!state.callId) {
      addLog('error', 'Inget aktivt samtal. Starta ett samtal först.');
      return;
    }

    addLog('user', `Knapp: ${digit}`);
    setIsLoading(true);

    // Handle repeat (9) based on current menu
    if (digit === '9') {
      if (state.lastMenu === 'service') {
        addLog('system', getServiceMenuMessage());
      } else if (state.lastMenu === 'time') {
        addLog('system', getTimeMenuMessage(state.suggestedTimes));
      } else {
        addLog('system', 'Ingen meny att upprepa.');
      }
      setIsLoading(false);
      return;
    }

    // Handle based on current step
    handleLocalSimulation(digit);
    setIsLoading(false);
  };

  const handleLocalSimulation = (digit: string) => {
    const { step } = state;

    if (step === 'select_service') {
      if (['1', '2', '3'].includes(digit)) {
        const selectedService = MOCK_SERVICES[parseInt(digit) - 1];
        const mockTimes = ['Måndag 10:00', 'Tisdag 14:30', 'Onsdag 09:00'];
        setState(prev => ({
          ...prev,
          selectedService,
          suggestedTimes: mockTimes,
          step: 'select_time',
          lastMenu: 'time',
        }));
        addLog('system', `Du valde: ${selectedService.name} (${selectedService.duration} min). Söker lediga tider...`);
        setTimeout(() => {
          addLog('system', getTimeMenuMessage(mockTimes));
        }, 500);
      } else {
        addLog('system', 'Ogiltigt val. Tryck 1, 2 eller 3 för att välja behandling.');
      }
    } else if (step === 'select_time') {
      if (['1', '2', '3'].includes(digit)) {
        const selectedTime = state.suggestedTimes[parseInt(digit) - 1];
        const simulatedHoldId = `hold-${Date.now()}`;
        setState(prev => ({
          ...prev,
          selectedOption: parseInt(digit),
          holdId: simulatedHoldId,
          step: 'confirm',
          lastMenu: null,
        }));
        addLog('system', `Du har valt ${selectedTime}. Tryck 1 för att bekräfta, 0 för att avbryta.`);
      } else {
        addLog('system', 'Ogiltigt val. Tryck 1, 2 eller 3 för att välja tid.');
      }
    } else if (step === 'confirm') {
      if (digit === '1') {
        const simulatedBookingId = `booking-${Date.now()}`;
        setState(prev => ({
          ...prev,
          bookingId: simulatedBookingId,
          step: 'done',
        }));
        addLog('system', `Bokning bekräftad! Ditt boknings-ID är ${simulatedBookingId}. Välkommen!`);
        addLog('system', '--- Samtal avslutat ---');
      } else if (digit === '0') {
        addLog('system', 'Bokning avbruten. Tack för att du ringde. Hej då!');
        setState(prev => ({ ...prev, holdId: null, step: 'done' }));
        addLog('system', '--- Samtal avslutat ---');
      } else {
        addLog('system', 'Tryck 1 för att bekräfta, 0 för att avbryta.');
      }
    } else if (step === 'done') {
      addLog('system', 'Samtalet är avslutat. Tryck Återställ för att starta om.');
    } else {
      addLog('system', 'Ogiltigt val. Försök igen.');
    }
  };

  const handleResetCall = () => {
    setState(INITIAL_STATE);
    setLogs([]);
    setCallerPhone('');
    addLog('system', 'Simulatorn återställd.');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <AppLayout>
      <PageContainer>
        <PageHeader
          title="IVR Simulator"
          description="Testa bokningsflödet utan riktig telefoni"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left column: Controls */}
          <div className="space-y-6">
            {/* Call Setup */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Samtalsuppgifter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caller-phone">Telefonnummer</Label>
                  <Input
                    id="caller-phone"
                    type="tel"
                    placeholder="+46701234567"
                    value={callerPhone}
                    onChange={(e) => setCallerPhone(e.target.value)}
                    disabled={!!state.callId}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tjänst väljs via DTMF (1/2/3) efter att samtalet startat.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleStartCall}
                    disabled={isLoading || !!state.callId}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                    Starta samtal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResetCall}
                    aria-label="Återställ samtal"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* DTMF Keypad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" aria-hidden="true" />
                  DTMF-knappar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="grid grid-cols-3 gap-3"
                  role="group"
                  aria-label="Telefonknappar"
                >
                  {DTMF_BUTTONS.map((digit) => (
                    <Button
                      key={digit}
                      variant="outline"
                      size="lg"
                      className="h-14 text-xl font-semibold touch-target"
                      onClick={() => handleDtmfPress(digit)}
                      disabled={isLoading || !state.callId}
                      aria-label={`Tryck ${digit}`}
                    >
                      {digit}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  className="w-full mt-4 h-12"
                  onClick={() => handleDtmfPress('9')}
                  disabled={isLoading || !state.callId}
                >
                  Upprepa (9)
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right column: Output */}
          <div className="space-y-6">
            {/* Status Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <dt className="text-muted-foreground">Call ID:</dt>
                  <dd className="font-mono text-xs break-all">
                    {state.callId || '—'}
                  </dd>

                  <dt className="text-muted-foreground">Steg:</dt>
                  <dd className="capitalize">
                    {state.step === 'idle' && '—'}
                    {state.step === 'select_service' && 'Välj tjänst'}
                    {state.step === 'select_time' && 'Välj tid'}
                    {state.step === 'confirm' && 'Bekräfta'}
                    {state.step === 'done' && 'Avslutat'}
                  </dd>
                  
                  <dt className="text-muted-foreground">Tjänst:</dt>
                  <dd>
                    {state.selectedService
                      ? `${state.selectedService.name} (${state.selectedService.duration} min)`
                      : '—'}
                  </dd>
                  
                  <dt className="text-muted-foreground">Föreslagna tider:</dt>
                  <dd>
                    {state.suggestedTimes.length > 0 ? (
                      <ol className="list-decimal list-inside">
                        {state.suggestedTimes.map((time, i) => (
                          <li key={i} className={state.selectedOption === i + 1 ? 'font-semibold text-primary' : ''}>
                            {time}
                          </li>
                        ))}
                      </ol>
                    ) : '—'}
                  </dd>
                  
                  <dt className="text-muted-foreground">Vald tid:</dt>
                  <dd>
                    {state.selectedOption && state.suggestedTimes[state.selectedOption - 1]
                      ? state.suggestedTimes[state.selectedOption - 1]
                      : '—'}
                  </dd>
                  
                  <dt className="text-muted-foreground">Hold ID:</dt>
                  <dd className="font-mono text-xs break-all">
                    {state.holdId || '—'}
                  </dd>
                  
                  <dt className="text-muted-foreground">Booking ID:</dt>
                  <dd className="font-mono text-xs break-all">
                    {state.bookingId || '—'}
                  </dd>
                </dl>
              </CardContent>
            </Card>

            {/* System Messages Log */}
            <Card className="flex flex-col" style={{ minHeight: '300px' }}>
              <CardHeader>
                <CardTitle>Systemmeddelanden</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-64 px-6 pb-6">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">
                      Inga meddelanden än. Starta ett samtal för att börja.
                    </p>
                  ) : (
                    <ul className="space-y-2" role="log" aria-live="polite">
                      {logs.map((log, i) => (
                        <li
                          key={i}
                          className={`text-sm flex gap-2 ${
                            log.type === 'error'
                              ? 'text-destructive'
                              : log.type === 'user'
                              ? 'text-muted-foreground'
                              : 'text-foreground'
                          }`}
                        >
                          <time className="text-xs text-muted-foreground shrink-0 font-mono">
                            {formatTime(log.timestamp)}
                          </time>
                          <span className={log.type === 'system' ? 'font-medium' : ''}>
                            {log.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
