import { Table } from '@/types/restaurant';
import { cn } from '@/lib/utils';
import { Users, Clock } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
  orderTotal?: number;
}

const statusConfig = {
  available: {
    label: 'Disponível',
    bgClass: 'border-table-available/50 hover:border-table-available',
    dotClass: 'bg-table-available',
  },
  occupied: {
    label: 'Ocupada',
    bgClass: 'border-table-occupied/50 hover:border-table-occupied',
    dotClass: 'bg-table-occupied animate-pulse-soft',
  },
  billing: {
    label: 'Conta',
    bgClass: 'border-table-billing/50 hover:border-table-billing',
    dotClass: 'bg-table-billing animate-pulse-soft',
  },
};

function formatDuration(openedAt?: Date): string {
  if (!openedAt) return '';
  const minutes = Math.floor((Date.now() - openedAt.getTime()) / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function TableCard({ table, onClick, orderTotal }: TableCardProps) {
  const config = statusConfig[table.status];

  return (
    <button
      onClick={() => onClick(table)}
      className={cn(
        'relative flex flex-col items-center justify-center p-4 rounded-xl',
        'bg-card border-2 transition-all duration-200',
        'hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]',
        'touch-action-manipulation min-h-[140px]',
        config.bgClass
      )}
    >
      {/* Status dot */}
      <div className={cn('absolute top-3 right-3 w-3 h-3 rounded-full', config.dotClass)} />

      {/* Table number */}
      <span className="text-3xl font-bold text-foreground mb-1">
        {table.number}
      </span>
      
      {/* Seats */}
      <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
        <Users size={14} />
        <span>{table.seats}</span>
      </div>

      {/* Status label */}
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {config.label}
      </span>

      {/* Duration and total for occupied tables */}
      {table.status !== 'available' && table.openedAt && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{formatDuration(table.openedAt)}</span>
        </div>
      )}

      {orderTotal !== undefined && orderTotal > 0 && (
        <span className="mt-1 text-sm font-semibold text-primary">
          R$ {orderTotal.toFixed(2)}
        </span>
      )}
    </button>
  );
}
