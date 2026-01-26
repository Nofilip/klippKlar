import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Plus, Ban, Trash2, Calendar, Users } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { staffApi, blocksApi } from '@/lib/apiClient';
import type { Staff, Block } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

type BlockFormData = {
  staff_id: string;
  start_dt: string;
  end_dt: string;
  reason: string;
};

const emptyFormData: BlockFormData = {
  staff_id: '',
  start_dt: '',
  end_dt: '',
  reason: '',
};

export default function BlocksPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<BlockFormData>(emptyFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingBlock, setDeletingBlock] = useState<Block | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStaff = async () => {
    setIsLoadingStaff(true);
    const response = await staffApi.list();
    
    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      setStaff(response.data.filter(s => s.is_active));
    }
    
    setIsLoadingStaff(false);
  };

  const fetchBlocks = async () => {
    setIsLoadingBlocks(true);
    setError(null);
    
    // Get blocks for the next 3 months
    const from = format(new Date(), 'yyyy-MM-dd');
    const to = format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    const response = await blocksApi.list({ from, to });
    
    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      setBlocks(response.data);
    }
    
    setIsLoadingBlocks(false);
  };

  useEffect(() => {
    fetchStaff();
    fetchBlocks();
  }, []);

  const openNewForm = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData({
      staff_id: staff[0]?.id || '',
      start_dt: format(tomorrow, "yyyy-MM-dd'T'09:00"),
      end_dt: format(tomorrow, "yyyy-MM-dd'T'17:00"),
      reason: '',
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(emptyFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const response = await blocksApi.create({
      staff_id: formData.staff_id,
      start_dt: new Date(formData.start_dt).toISOString(),
      end_dt: new Date(formData.end_dt).toISOString(),
      reason: formData.reason,
    });

    if (response.error) {
      toast({
        title: 'Något gick fel',
        description: response.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Frånvaro tillagd',
        description: 'Frånvaron har sparats.',
      });
      closeForm();
      fetchBlocks();
    }

    setIsSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingBlock) return;
    
    setIsDeleting(true);
    const response = await blocksApi.delete(deletingBlock.id);
    
    if (response.error) {
      toast({
        title: 'Kunde inte ta bort',
        description: response.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Frånvaro borttagen',
        description: 'Frånvaron har tagits bort.',
      });
      fetchBlocks();
    }
    
    setIsDeleting(false);
    setDeletingBlock(null);
  };

  const isLoading = isLoadingStaff || isLoadingBlocks;

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="staff_id">Frisör</Label>
        <Select
          value={formData.staff_id}
          onValueChange={(value) => setFormData({ ...formData, staff_id: value })}
        >
          <SelectTrigger>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_dt">Starttid</Label>
          <Input
            id="start_dt"
            type="datetime-local"
            value={formData.start_dt}
            onChange={(e) => setFormData({ ...formData, start_dt: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_dt">Sluttid</Label>
          <Input
            id="end_dt"
            type="datetime-local"
            value={formData.end_dt}
            onChange={(e) => setFormData({ ...formData, end_dt: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Anledning (valfritt)</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="T.ex. Semester, Lunch, Möte..."
          rows={2}
        />
      </div>
    </form>
  );

  // Sort blocks by start date
  const sortedBlocks = [...blocks].sort((a, b) => 
    new Date(a.start_dt).getTime() - new Date(b.start_dt).getTime()
  );

  return (
    <AppLayout>
      <PageContainer hasStickyMobileCTA>
        <PageHeader 
          title="Frånvaro"
          description="Hantera semester, lunch och andra undantag"
          stickyMobileCTA
          showBackButton
        >
          <Button onClick={openNewForm} disabled={staff.length === 0} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Lägg till frånvaro
          </Button>
        </PageHeader>

        <div className="mt-6">
          {isLoading ? (
            <LoadingState variant="list" rows={4} />
          ) : error ? (
            <ErrorState 
              title="Kunde inte ladda blockeringar" 
              message={error} 
              onRetry={fetchBlocks} 
            />
          ) : staff.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Lägg till frisörer först"
              description="Du behöver lägga till frisörer innan du kan skapa blockeringar för semester, lunch eller annat."
            />
          ) : sortedBlocks.length === 0 ? (
          <EmptyState
              icon={Calendar}
              title="Ingen frånvaro registrerad"
              description="Lägg till semester, lunch, möten eller annan ledig tid via knappen ovan."
            />
          ) : (
            <ul className="space-y-3" role="list" aria-label="Lista över frånvaro">
              {sortedBlocks.map((block) => (
                <li key={block.id}>
                  <Card className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0" aria-hidden="true">
                            <Ban className="w-5 h-5 text-destructive" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground">{block.staff_name}</p>
                            <p className="text-sm text-muted-foreground">
                              <time dateTime={block.start_dt}>
                                {format(new Date(block.start_dt), 'd MMM HH:mm', { locale: sv })}
                              </time>
                              {' – '}
                              <time dateTime={block.end_dt}>
                                {format(new Date(block.end_dt), 'd MMM HH:mm', { locale: sv })}
                              </time>
                            </p>
                            {block.reason && (
                              <p className="text-sm text-muted-foreground truncate">{block.reason}</p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 touch-target"
                          onClick={() => setDeletingBlock(block)}
                          aria-label={`Ta bort blockering för ${block.staff_name}`}
                        >
                          <Trash2 className="w-5 h-5" aria-hidden="true" />
                        </Button>
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
                <SheetTitle>Ny frånvaro</SheetTitle>
                <SheetDescription>
                  Lägg till semester, lunch, möte eller annan ledig tid.
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                {FormContent}
              </div>
              <SheetFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                  Avbryt
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || !formData.staff_id}>
                  {isSaving ? 'Sparar...' : 'Lägg till'}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ny frånvaro</DialogTitle>
                <DialogDescription>
                  Lägg till semester, lunch, möte eller annan ledig tid.
                </DialogDescription>
              </DialogHeader>
              {FormContent}
              <DialogFooter>
                <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                  Avbryt
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || !formData.staff_id}>
                  {isSaving ? 'Sparar...' : 'Lägg till'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete confirmation dialog */}
        <AlertDialog open={!!deletingBlock} onOpenChange={() => setDeletingBlock(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ta bort frånvaro</AlertDialogTitle>
              <AlertDialogDescription>
                Är du säker på att du vill ta bort frånvaron för {deletingBlock?.staff_name}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? 'Tar bort...' : 'Ta bort'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PageContainer>
    </AppLayout>
  );
}
