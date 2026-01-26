import { useEffect, useState } from 'react';
import { Clock, ChevronDown, Save, X } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { staffApi, workingHoursApi } from '@/lib/apiClient';
import type { Staff, WorkingHour } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Måndag', short: 'Mån' },
  { value: 1, label: 'Tisdag', short: 'Tis' },
  { value: 2, label: 'Onsdag', short: 'Ons' },
  { value: 3, label: 'Torsdag', short: 'Tor' },
  { value: 4, label: 'Fredag', short: 'Fre' },
  { value: 5, label: 'Lördag', short: 'Lör' },
  { value: 6, label: 'Söndag', short: 'Sön' },
];

type WorkingHourForm = {
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  start_time: string;
  end_time: string;
  is_active: boolean;
  id?: string;
};

const defaultHours: WorkingHourForm[] = DAYS_OF_WEEK.map((day) => ({
  day_of_week: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  start_time: '09:00',
  end_time: '17:00',
  is_active: day.value < 5, // Mon-Fri active by default
}));

export default function WorkingHoursPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [workingHours, setWorkingHours] = useState<WorkingHourForm[]>(defaultHours);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isLoadingHours, setIsLoadingHours] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [openDays, setOpenDays] = useState<number[]>([0, 1, 2, 3, 4]); // Mon-Fri open by default on mobile

  const fetchStaff = async () => {
    setIsLoadingStaff(true);
    const response = await staffApi.list();
    
    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      setStaff(response.data.filter(s => s.is_active));
      if (response.data.length > 0 && !selectedStaffId) {
        setSelectedStaffId(response.data[0].id);
      }
    }
    
    setIsLoadingStaff(false);
  };

  const fetchWorkingHours = async (staffId: string) => {
    setIsLoadingHours(true);
    setError(null);
    
    const response = await workingHoursApi.list(staffId);
    
    if (response.error) {
      setError(response.error.message);
      setWorkingHours(defaultHours);
    } else if (response.data) {
      // Merge with default hours
      const merged = DAYS_OF_WEEK.map((day) => {
        const existing = response.data?.find((h) => h.day_of_week === day.value);
        if (existing) {
          return {
            day_of_week: existing.day_of_week,
            start_time: existing.start_time,
            end_time: existing.end_time,
            is_active: existing.is_active,
            id: existing.id,
          };
        }
        return {
          day_of_week: day.value as 0 | 1 | 2 | 3 | 4 | 5 | 6,
          start_time: '09:00',
          end_time: '17:00',
          is_active: false,
        };
      });
      setWorkingHours(merged);
    }
    
    setIsLoadingHours(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedStaffId) {
      fetchWorkingHours(selectedStaffId);
    }
  }, [selectedStaffId]);

  const updateWorkingHour = (dayIndex: number, field: keyof WorkingHourForm, value: string | boolean) => {
    setWorkingHours(prev => prev.map((h, i) => 
      i === dayIndex ? { ...h, [field]: value } : h
    ));
  };

  const toggleDay = (dayValue: number) => {
    setOpenDays(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue)
        : [...prev, dayValue]
    );
  };

  const handleSave = async () => {
    if (!selectedStaffId) return;
    
    setIsSaving(true);

    try {
      for (const hour of workingHours) {
        if (hour.id) {
          await workingHoursApi.update(hour.id, {
            start_time: hour.start_time,
            end_time: hour.end_time,
            is_active: hour.is_active,
          });
        } else {
          await workingHoursApi.create({
            staff_id: selectedStaffId,
            day_of_week: hour.day_of_week,
            start_time: hour.start_time,
            end_time: hour.end_time,
            is_active: hour.is_active,
          });
        }
      }

      toast({
        title: 'Arbetstider sparade',
        description: 'Arbetstiderna har uppdaterats.',
      });
      
      // Refetch to get IDs for newly created entries
      fetchWorkingHours(selectedStaffId);
    } catch {
      toast({
        title: 'Något gick fel',
        description: 'Kunde inte spara arbetstiderna.',
        variant: 'destructive',
      });
    }

    setIsSaving(false);
  };

  const selectedStaff = staff.find(s => s.id === selectedStaffId);

  return (
    <AppLayout>
      <PageContainer hasStickyMobileCTA={!!selectedStaffId}>
        <PageHeader 
          title="Arbetstider"
          description="Undantag som semester och lunch hanteras under Frånvaro."
          stickyMobileCTA={!!selectedStaffId}
          showBackButton
        >
          {selectedStaffId && (
            <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Sparar...' : 'Spara'}
            </Button>
          )}
        </PageHeader>

        <div className="mt-6 space-y-6">
          {/* Staff selector */}
          <Card>
            <CardContent className="p-4">
              <Label htmlFor="staff-select" className="mb-2 block">Välj frisör</Label>
              {isLoadingStaff ? (
                <div className="h-10 bg-muted rounded-md animate-pulse" />
              ) : staff.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Inga aktiva frisörer. Lägg till frisörer först.
                </p>
              ) : (
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger id="staff-select">
                    <SelectValue placeholder="Välj frisör" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Working hours */}
          {selectedStaffId && (
            <>
              {isLoadingHours ? (
                <LoadingState variant="list" rows={7} />
              ) : error ? (
                <ErrorState 
                  title="Kunde inte ladda arbetstider" 
                  message={error} 
                  onRetry={() => fetchWorkingHours(selectedStaffId)} 
                />
              ) : isMobile ? (
                // Mobile: Accordion view
                <div className="space-y-2">
                  {workingHours.map((hour, index) => {
                    const day = DAYS_OF_WEEK[index];
                    const isOpen = openDays.includes(day.value);
                    
                    return (
                      <Card key={day.value} className={cn(!hour.is_active && 'bg-muted/30')}>
                        <CardHeader className="py-3 px-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-base font-medium">
                                {day.label}
                              </CardTitle>
                              {hour.is_active ? (
                                <span className="text-sm text-muted-foreground">
                                  {hour.start_time} - {hour.end_time}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  <X className="w-3 h-3" />
                                  Stängt
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {!hour.is_active && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateWorkingHour(index, 'is_active', true)}
                                  className="text-primary h-8 px-3"
                                >
                                  Öppna
                                </Button>
                              )}
                              <Switch
                                checked={hour.is_active}
                                onCheckedChange={(checked) => updateWorkingHour(index, 'is_active', checked)}
                              />
                            </div>
                          </div>
                        </CardHeader>
                        
                        {hour.is_active && (
                          <CardContent className="pt-0 pb-4 px-4">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Starttid</Label>
                                <Input
                                  type="time"
                                  value={hour.start_time}
                                  onChange={(e) => updateWorkingHour(index, 'start_time', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Sluttid</Label>
                                <Input
                                  type="time"
                                  value={hour.end_time}
                                  onChange={(e) => updateWorkingHour(index, 'end_time', e.target.value)}
                                />
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                // Desktop: Table view
                <Card>
                  <CardHeader>
                    <CardTitle>Arbetstider för {selectedStaff?.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {workingHours.map((hour, index) => {
                        const day = DAYS_OF_WEEK[index];
                        
                        return (
                          <div 
                            key={day.value}
                            className={cn(
                              'flex items-center gap-4 p-3 rounded-lg border border-border',
                              !hour.is_active && 'bg-muted/30'
                            )}
                          >
                            <div className="w-24 shrink-0">
                              <span className="font-medium">{day.label}</span>
                            </div>
                            
                            {/* Switch control - always visible */}
                            <div className="flex items-center gap-2 shrink-0">
                              <Switch
                                checked={hour.is_active}
                                onCheckedChange={(checked) => updateWorkingHour(index, 'is_active', checked)}
                              />
                              <span className={cn(
                                "text-sm min-w-[50px]",
                                hour.is_active ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {hour.is_active ? 'Öppet' : 'Stängt'}
                              </span>
                            </div>

                            {/* Time inputs - shown when active, placeholder space when not */}
                            <div className="flex items-center gap-2 flex-1">
                              {hour.is_active ? (
                                <>
                                  <Input
                                    type="time"
                                    value={hour.start_time}
                                    onChange={(e) => updateWorkingHour(index, 'start_time', e.target.value)}
                                    className="w-32"
                                  />
                                  <span className="text-muted-foreground">–</span>
                                  <Input
                                    type="time"
                                    value={hour.end_time}
                                    onChange={(e) => updateWorkingHour(index, 'end_time', e.target.value)}
                                    className="w-32"
                                  />
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">
                                  Klicka på switchen för att öppna
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!selectedStaffId && !isLoadingStaff && staff.length > 0 && (
            <EmptyState
              icon={Clock}
              title="Välj en frisör"
              description="Välj en frisör ovan för att hantera arbetstider."
            />
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
}
