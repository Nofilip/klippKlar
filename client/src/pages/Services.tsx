import { useEffect, useState } from 'react';
import { Plus, Scissors, MoreHorizontal, Pencil } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { servicesApi } from '@/lib/apiClient';
import type { Service } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

type ServiceFormData = {
  name_public: string;
  duration_min: 15 | 30 | 60;
  is_active: boolean;
};

const emptyFormData: ServiceFormData = {
  name_public: '',
  duration_min: 30,
  is_active: true,
};

export default function ServicesPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    setError(null);
    
    const response = await servicesApi.list();
    
    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      setServices(response.data);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openNewForm = () => {
    setEditingService(null);
    setFormData(emptyFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (service: Service) => {
    setEditingService(service);
    setFormData({
      name_public: service.name_public,
      duration_min: service.duration_min,
      is_active: service.is_active,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let response;
    if (editingService) {
      response = await servicesApi.update(editingService.id, formData);
    } else {
      response = await servicesApi.create(formData);
    }

    if (response.error) {
      toast({
        title: 'Något gick fel',
        description: response.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingService ? 'Tjänst uppdaterad' : 'Tjänst skapad',
        description: `${formData.name_public} har ${editingService ? 'uppdaterats' : 'lagts till'}.`,
      });
      closeForm();
      fetchServices();
    }

    setIsSaving(false);
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name_public">Namn (visas för kunder)</Label>
        <Input
          id="name_public"
          value={formData.name_public}
          onChange={(e) => setFormData({ ...formData, name_public: e.target.value })}
          placeholder="T.ex. Klippning herr"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration_min">Längd</Label>
        <Select
          value={formData.duration_min.toString()}
          onValueChange={(value) => setFormData({ ...formData, duration_min: parseInt(value) as 15 | 30 | 60 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minuter</SelectItem>
            <SelectItem value="30">30 minuter</SelectItem>
            <SelectItem value="60">60 minuter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="is_active" className="cursor-pointer">Status</Label>
          <p className="text-xs text-muted-foreground">
            {formData.is_active ? 'Tjänsten kan bokas av kunder' : 'Tjänsten är dold'}
          </p>
        </div>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>
    </form>
  );

  return (
    <AppLayout>
      <PageContainer hasStickyMobileCTA>
        <PageHeader 
          title="Tjänster"
          description="Hantera salongens tjänster"
          stickyMobileCTA
          showBackButton
        >
          <Button onClick={openNewForm} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Ny tjänst
          </Button>
        </PageHeader>

        <div className="mt-6">
          {isLoading ? (
            <LoadingState variant="list" rows={4} />
          ) : error ? (
            <ErrorState 
              title="Kunde inte ladda tjänster" 
              message={error} 
              onRetry={fetchServices} 
            />
          ) : services.length === 0 ? (
            <EmptyState
              icon={Scissors}
              title="Inga tjänster ännu"
              description="Lägg till din första tjänst för att kunder ska kunna boka tider hos dig."
              action={
                <Button onClick={openNewForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Lägg till tjänst
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3" role="list" aria-label="Lista över tjänster">
              {services.map((service) => (
                <li key={service.id}>
                  <Card className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0" aria-hidden="true">
                            <Scissors className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground truncate">{service.name_public}</p>
                              <StatusBadge variant={service.is_active ? 'active' : 'inactive'}>
                                {service.is_active ? 'Aktiv' : 'Inaktiv'}
                              </StatusBadge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{service.duration_min} minuter</p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="shrink-0 touch-target"
                              aria-label={`Åtgärder för ${service.name_public}`}
                            >
                              <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(service)} className="py-3">
                              <Pencil className="w-4 h-4 mr-2" aria-hidden="true" />
                              Redigera
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mobile Sheet */}
        {isMobile ? (
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetContent side="bottom" className="h-auto max-h-[90vh]">
              <SheetHeader>
                <SheetTitle>{editingService ? 'Redigera tjänst' : 'Ny tjänst'}</SheetTitle>
                <SheetDescription>
                  {editingService ? 'Uppdatera tjänstens information.' : 'Lägg till en ny tjänst i salongen.'}
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                {FormContent}
              </div>
              <SheetFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                  Avbryt
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Sparar...' : editingService ? 'Spara' : 'Lägg till'}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingService ? 'Redigera tjänst' : 'Ny tjänst'}</DialogTitle>
                <DialogDescription>
                  {editingService ? 'Uppdatera tjänstens information.' : 'Lägg till en ny tjänst i salongen.'}
                </DialogDescription>
              </DialogHeader>
              {FormContent}
              <DialogFooter>
                <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                  Avbryt
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Sparar...' : editingService ? 'Spara' : 'Lägg till'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageContainer>
    </AppLayout>
  );
}
