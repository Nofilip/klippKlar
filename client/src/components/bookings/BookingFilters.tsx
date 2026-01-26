import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { CalendarDays, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface BookingFiltersProps {
  fromDate: string;
  toDate: string;
  statusFilter: string;
  onFromDateChange: (date: string) => void;
  onToDateChange: (date: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
}

export function BookingFilters({
  fromDate,
  toDate,
  statusFilter,
  onFromDateChange,
  onToDateChange,
  onStatusChange,
  onClearFilters,
}: BookingFiltersProps) {
  const hasActiveFilters = statusFilter !== 'all';

  return (
    <div className="space-y-5">
      {/* Date range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          Datumintervall
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Från</Label>
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="touch-target"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Till</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="touch-target"
            />
          </div>
        </div>
      </div>

      {/* Status filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="touch-target">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla bokningar</SelectItem>
            <SelectItem value="booked">Endast bokade</SelectItem>
            <SelectItem value="cancelled">Endast avbokade</SelectItem>
            <SelectItem value="completed">Endast slutförda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="w-full text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-2" />
          Rensa filter
        </Button>
      )}
    </div>
  );
}
