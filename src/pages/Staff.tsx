import { useEffect, useState } from 'react';
import { Plus, Users, MoreHorizontal, Pencil } from 'lucide-react';
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
import { staffApi } from '@/lib/apiClient';
import type { Staff } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

type StaffFormData = {
  name: string;
  is_active: boolean;
};

const emptyFormData: StaffFormData = {
  name: '',
  is_active: true,
};

export default function StaffPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<StaffFormData>(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);

  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    
    const response = await staffApi.list();
    
    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      setStaff(response.data);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openNewForm = () => {
    setEditingStaff(null);
    setFormData(emptyFormData);
    setIsFormOpen(true);
  };

  const openEditForm = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      is_active: staffMember.is_active,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStaff(null);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let response;
    if (editingStaff) {
      response = await staffApi.update(editingStaff.id, formData);
    } else {
      response = await staffApi.create(formData);
    }

    if (response.error) {
      toast({
        title: 'Något gick fel',
        description: response.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingStaff ? 'Frisör uppdaterad' : 'Frisör tillagd',
        description: `${formData.name} har ${editingStaff ? 'uppdaterats' : 'lagts till'}.`,
      });
      closeForm();
      fetchStaff();
    }

    setIsSaving(false);
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Namn</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="T.ex. Anna Andersson"
          required
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div className="space-y-0.5">
          <Label htmlFor="is_active" className="cursor-pointer">Status</Label>
          <p className="text-xs text-muted-foreground">
            {formData.is_active ? 'Kan ta emot bokningar' : 'Dold från bokningssystemet'}
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
          title="Personal"
          description="Schema och öppettider hanteras under Arbetstider."
          stickyMobileCTA
          showBackButton
        >
          <Button onClick={openNewForm} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Ny frisör
          </Button>
        </PageHeader>

        <div className="mt-6">
          {isLoading ? (
            <LoadingState variant="list" rows={4} />
          ) : error ? (
            <ErrorState 
              title="Kunde inte ladda frisörer" 
              message={error} 
              onRetry={fetchStaff} 
            />
          ) : staff.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Inga frisörer ännu"
              description="Lägg till frisörer för att kunna hantera bokningar och arbetstider."
              action={
                <Button onClick={openNewForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Lägg till frisör
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3" role="list" aria-label="Lista över frisörer">
              {staff.map((member) => (
                <li key={member.id}>
                  <Card className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div 
                            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0"
                            aria-hidden="true"
                          >
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-foreground truncate">{member.name}</p>
                              <StatusBadge variant={member.is_active ? 'active' : 'inactive'}>
                                {member.is_active ? 'Aktiv' : 'Inaktiv'}
                              </StatusBadge>
                            </div>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="shrink-0 touch-target"
                              aria-label={`Åtgärder för ${member.name}`}
                            >
                              <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(member)} className="py-3">
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
                <SheetTitle>{editingStaff ? 'Redigera frisör' : 'Ny frisör'}</SheetTitle>
                <SheetDescription>
                  {editingStaff ? 'Uppdatera frisörens information.' : 'Lägg till en ny frisör i salongen.'}
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
                  {isSaving ? 'Sparar...' : editingStaff ? 'Spara' : 'Lägg till'}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingStaff ? 'Redigera frisör' : 'Ny frisör'}</DialogTitle>
                <DialogDescription>
                  {editingStaff ? 'Uppdatera frisörens information.' : 'Lägg till en ny frisör i salongen.'}
                </DialogDescription>
              </DialogHeader>
              {FormContent}
              <DialogFooter>
                <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                  Avbryt
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Sparar...' : editingStaff ? 'Spara' : 'Lägg till'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageContainer>
    </AppLayout>
  );
}
