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
    bgClass: 'border-table-available/60 bg-table-available/10',
    dotClass: 'bg-table-available',
    textClass: 'text-table-available',
  },
  occupied: {
    label: 'Ocupada',
    bgClass: 'border-table-occupied/60 bg-table-occupied/10',
    dotClass: 'bg-table-occupied animate-pulse-soft',
    textClass: 'text-table-occupied',
  },
  billing: {
    label: 'Conta',
    bgClass: 'border-table-billing/60 bg-table-billing/10',
    dotClass: 'bg-table-billing animate-pulse-soft',
    textClass: 'text-table-billing',
  },
};

function formatDuration(openedAt?: Date): string {
  if (!openedAt) return '';
  const minutes = Math.floor((Date.now() - openedAt.getTime()) / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h${mins}m`;
  }
  return `${mins}min`;
}

export function TableCard({ table, onClick, orderTotal }: TableCardProps) {
  const config = statusConfig[table.status];

  return (
    <button
      onClick={() => onClick(table)}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'p-4 rounded-2xl border-2',
        'transition-all duration-150 touch-manipulation active-scale',
        'min-h-[120px] w-full',
        config.bgClass
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        'absolute top-3 right-3 w-3 h-3 rounded-full',
        config.dotClass
      )} />

      {/* Table number - large and prominent */}
      <span className="text-4xl font-bold text-foreground mb-1">
        {table.number}
      </span>
      
      {/* Seats info */}
      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
        <Users size={14} />
        <span className="text-sm">{table.seats} lugares</span>
      </div>

      {/* Status and time for non-available */}
      {table.status !== 'available' ? (
        <div className="flex flex-col items-center gap-1">
          <span className={cn('text-xs font-semibold uppercase', config.textClass)}>
            {config.label}
          </span>
          {table.openedAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={10} />
              <span>{formatDuration(table.openedAt)}</span>
            </div>
          )}
          {orderTotal !== undefined && orderTotal > 0 && (
            <span className="text-sm font-bold text-primary mt-1">
              R$ {orderTotal.toFixed(2)}
            </span>
          )}
        </div>
      ) : (
        <span className={cn('text-xs font-semibold uppercase', config.textClass)}>
          {config.label}
        </span>
      )}
    </button>
  );
}
