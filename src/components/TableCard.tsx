import { Table } from '@/types/restaurant';
import { cn } from '@/lib/utils';
import { Clock, FileText } from 'lucide-react';

interface TableCardProps {
  table: Table;
  onClick: (table: Table) => void;
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
  reserved: {
    label: 'Reservada',
    bgClass: 'border-table-reserved/60 bg-table-reserved/10',
    dotClass: 'bg-table-reserved',
    textClass: 'text-table-reserved',
  },
};

function formatDuration(openedAt?: Date): string {
  if (!openedAt) return '';
  const minutes = Math.floor((Date.now() - new Date(openedAt).getTime()) / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h${mins}m`;
  }
  return `${mins}min`;
}

function getTableTotal(table: Table): number {
  return table.comandas.reduce((sum, comanda) => sum + comanda.total, 0);
}

export function TableCard({ table, onClick }: TableCardProps) {
  const config = statusConfig[table.status];
  const openComandas = table.comandas.filter(c => c.status !== 'closed').length;
  const tableTotal = getTableTotal(table);

  return (
    <button
      onClick={() => onClick(table)}
      className={cn(
        'relative flex flex-col items-center justify-center',
        'p-4 rounded-2xl border-2',
        'transition-all duration-150 touch-manipulation active-scale',
        'h-[140px] w-full',
        config.bgClass
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        'absolute top-3 right-3 w-3 h-3 rounded-full',
        config.dotClass
      )} />

      {/* Table number */}
      <span className="text-4xl font-bold text-foreground mb-2">
        {table.number}
      </span>
      
      {/* Comandas count for occupied/billing tables */}
      {(table.status === 'occupied' || table.status === 'billing') && openComandas > 0 && (
        <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
          <FileText size={14} />
          <span className="text-sm">{openComandas} comanda{openComandas > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Status label */}
      <span className={cn('text-xs font-semibold uppercase', config.textClass)}>
        {config.label}
      </span>

      {/* Duration and total for non-available */}
      {(table.status === 'occupied' || table.status === 'billing') && table.openedAt && (
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={10} />
            <span>{formatDuration(table.openedAt)}</span>
          </div>
          {tableTotal > 0 && (
            <span className="text-sm font-bold text-primary">
              R$ {tableTotal.toFixed(2)}
            </span>
          )}
        </div>
      )}

      {/* Reserved info */}
      {table.status === 'reserved' && table.reservedFor && (
        <span className="text-xs text-muted-foreground mt-1 truncate max-w-full px-2">
          {table.reservedFor}
        </span>
      )}
    </button>
  );
}
