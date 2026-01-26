import { useEffect, useState } from 'react';
import { Plus, Shield, MoreHorizontal, Pencil, Mail, UserCheck, UserX, Crown, ShieldCheck, AlertCircle } from 'lucide-react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { adminUsersApi } from '@/lib/apiClient';
import type { AdminUser } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type AdminUserFormData = {
  email: string;
  role: 'admin' | 'owner';
  is_active: boolean;
};

type FormErrors = {
  email?: string;
  role?: string;
};

const emptyFormData: AdminUserFormData = {
  email: '',
  role: 'admin',
  is_active: true,
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'E-postadress krävs';
  }
  if (trimmed.length > 255) {
    return 'E-postadressen är för lång (max 255 tecken)';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Ange en giltig e-postadress';
  }
  return undefined;
}

function getRoleIcon(role: 'admin' | 'owner') {
  return role === 'owner' ? Crown : ShieldCheck;
}

function getRoleLabel(role: 'admin' | 'owner') {
  return role === 'owner' ? 'Ägare' : 'Personal';
}

function getRoleDescription(role: 'admin' | 'owner') {
  return role === 'owner' 
    ? 'Full tillgång inkl. administratörshantering' 
    : 'Kan hantera bokningar, tjänster och personal';
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<AdminUserFormData>(emptyFormData);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  const fetchAdminUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    const response = await adminUsersApi.list();
    
    if (response.error) {
      setError(response.error.message);
    } else if (response.data) {
      setAdminUsers(response.data);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const openNewForm = () => {
    setEditingUser(null);
    setFormData(emptyFormData);
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData(emptyFormData);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!editingUser) {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        errors.email = emailError;
      }
      
      // Check for duplicate email
      const existingUser = adminUsers.find(
        u => u.email.toLowerCase() === formData.email.trim().toLowerCase()
      );
      if (existingUser) {
        errors.email = 'Denna e-postadress är redan registrerad';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    let response;
    if (editingUser) {
      response = await adminUsersApi.update(editingUser.id, {
        role: formData.role,
        is_active: formData.is_active,
      });
    } else {
      response = await adminUsersApi.create({
        email: formData.email.trim(),
        role: formData.role,
        is_active: formData.is_active,
      });
    }

    if (response.error) {
      toast({
        title: 'Något gick fel',
        description: response.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingUser ? 'Administratör uppdaterad' : 'Inbjudan skickad',
        description: editingUser 
          ? `${editingUser.email} har uppdaterats.`
          : `En inbjudan har skickats till ${formData.email.trim()}.`,
      });
      closeForm();
      fetchAdminUsers();
    }

    setIsSaving(false);
  };

  const handleToggleActive = async (user: AdminUser) => {
    setTogglingUserId(user.id);
    
    const response = await adminUsersApi.update(user.id, {
      is_active: !user.is_active,
    });

    if (response.error) {
      toast({
        title: 'Kunde inte uppdatera',
        description: response.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: user.is_active ? 'Administratör inaktiverad' : 'Administratör aktiverad',
        description: `${user.email} är nu ${user.is_active ? 'inaktiv' : 'aktiv'}.`,
      });
      fetchAdminUsers();
    }

    setTogglingUserId(null);
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    // Clear error on change
    if (formErrors.email) {
      setFormErrors({ ...formErrors, email: undefined });
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!editingUser && (
        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            E-postadress
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="kollega@salong.se"
            className={cn(
              "touch-target",
              formErrors.email && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!formErrors.email}
            aria-describedby={formErrors.email ? "email-error" : undefined}
          />
          {formErrors.email && (
            <p id="email-error" className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formErrors.email}
            </p>
          )}
        </div>
      )}

      {editingUser && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            E-postadress
          </Label>
          <p className="text-sm text-foreground bg-muted px-3 py-2 rounded-md">
            {editingUser.email}
          </p>
        </div>
      )}

      {!editingUser && (
        <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
          Ägare skapas via onboarding och kan inte bjudas in här.
        </p>
      )}

      {editingUser && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="is_active" className="cursor-pointer">Status</Label>
            <p className="text-xs text-muted-foreground">
              {formData.is_active ? 'Användaren kan logga in' : 'Användaren kan inte logga in'}
            </p>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
        </div>
      )}
    </form>
  );

  return (
    <AppLayout>
      <PageContainer hasStickyMobileCTA>
        <PageHeader 
          title="Inloggningar"
          description="Här hanterar du vilka som får logga in. Personal och arbetstider hanteras under Personal."
          stickyMobileCTA
          showBackButton
        >
          <Button onClick={openNewForm} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Bjud in personal
          </Button>
        </PageHeader>

        <div className="mt-6">
          {isLoading ? (
            <LoadingState variant="list" rows={4} />
          ) : error ? (
            <ErrorState 
              title="Kunde inte ladda administratörer" 
              message={error} 
              onRetry={fetchAdminUsers} 
            />
          ) : adminUsers.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="Inga administratörer ännu"
              description="Bjud in kollegor för att ge dem tillgång till admin-panelen."
              action={
                <Button onClick={openNewForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Bjud in personal
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3" role="list" aria-label="Lista över administratörer">
              {adminUsers.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                const isToggling = togglingUserId === user.id;
                
                return (
                  <li key={user.id}>
                    <Card className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          {/* Avatar with role indicator */}
                          <div className={cn(
                            "relative w-11 h-11 rounded-full flex items-center justify-center font-semibold shrink-0",
                            user.is_active 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {user.email.charAt(0).toUpperCase()}
                            <div className={cn(
                              "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center",
                              user.role === 'owner' 
                                ? "bg-warning text-warning-foreground" 
                                : "bg-accent text-accent-foreground"
                            )}>
                              <RoleIcon className="w-3 h-3" />
                            </div>
                          </div>
                          
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className={cn(
                                "font-medium truncate max-w-[200px] sm:max-w-none",
                                user.is_active ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {user.email}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                                user.role === 'owner' 
                                  ? "bg-warning/10 text-warning" 
                                  : "bg-accent text-accent-foreground"
                              )}>
                                <RoleIcon className="w-3 h-3" />
                                {getRoleLabel(user.role)}
                              </span>
                              <StatusBadge variant={user.is_active ? 'active' : 'inactive'}>
                                {user.is_active ? 'Aktiv' : 'Inaktiv'}
                              </StatusBadge>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="shrink-0 touch-target"
                              disabled={isToggling}
                              aria-label={`Åtgärder för ${user.email}`}
                            >
                              <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => openEditForm(user)} 
                              className="py-3"
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Redigera
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleToggleActive(user)}
                              className={cn(
                                "py-3",
                                user.is_active 
                                  ? "text-destructive focus:text-destructive" 
                                  : "text-success focus:text-success"
                              )}
                              disabled={isToggling}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Inaktivera
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Aktivera
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Mobile Sheet */}
        {isMobile ? (
          <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
            <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {editingUser ? (
                    <>
                      <Pencil className="w-5 h-5 text-muted-foreground" />
                      Redigera administratör
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      Bjud in personal
                    </>
                  )}
                </SheetTitle>
                <SheetDescription>
                  {editingUser 
                    ? 'Uppdatera roll och status.' 
                    : 'Skicka en inbjudan via e-post.'}
                </SheetDescription>
              </SheetHeader>
              <div className="py-4">
                {FormContent}
              </div>
              <SheetFooter className="gap-2 sm:gap-0 pb-safe">
                <Button variant="outline" onClick={closeForm} disabled={isSaving} className="touch-target">
                  Avbryt
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving} className="touch-target">
                  {isSaving ? 'Sparar...' : editingUser ? 'Spara ändringar' : 'Skicka inbjudan'}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {editingUser ? (
                    <>
                      <Pencil className="w-5 h-5 text-muted-foreground" />
                      Redigera administratör
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      Bjud in personal
                    </>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? 'Uppdatera roll och status.' 
                    : 'Skicka en inbjudan via e-post.'}
                </DialogDescription>
              </DialogHeader>
              {FormContent}
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={closeForm} disabled={isSaving}>
                  Avbryt
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving}>
                  {isSaving ? 'Sparar...' : editingUser ? 'Spara ändringar' : 'Skicka inbjudan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </PageContainer>
    </AppLayout>
  );
}
