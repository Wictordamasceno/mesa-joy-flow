import { Table } from '@/types/restaurant';
import { cn } from '@/lib/utils';
import { Clock, FileText, CalendarCheck, Receipt } from 'lucide-react';
import { format, isToday } from 'date-fns';

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

function getTodayReservation(table: Table) {
  return table.reservations.find(r => isToday(new Date(r.date)));
}

function getTableDisplayStatus(table: Table): 'available' | 'occupied' | 'billing' | 'reserved' {
  // Check if any comanda is requesting the bill
  const hasBillingComanda = table.comandas.some(c => c.status === 'billing');
  if (hasBillingComanda) return 'billing';
  if (table.status === 'occupied') return 'occupied';
  const todayReservation = getTodayReservation(table);
  if (todayReservation) return 'reserved';
  return 'available';
}

export function TableCard({ table, onClick }: TableCardProps) {
  const displayStatus = getTableDisplayStatus(table);
  const config = statusConfig[displayStatus];
  const openComandas = table.comandas.filter(c => c.status !== 'closed').length;
  const tableTotal = getTableTotal(table);
  const todayReservation = getTodayReservation(table);

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
      {displayStatus === 'billing' ? (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-table-billing/20 px-2 py-1 rounded-full animate-pulse-soft">
          <Receipt size={14} className="text-table-billing" />
          <span className="text-xs font-semibold text-table-billing">Conta</span>
        </div>
      ) : (
        <div className={cn(
          'absolute top-3 right-3 w-3 h-3 rounded-full',
          config.dotClass
        )} />
      )}

      {/* Table number */}
      <span className="text-4xl font-bold text-foreground mb-2">
        {table.number}
      </span>
      
      {/* Comandas count for occupied/billing tables */}
      {(displayStatus === 'occupied' || displayStatus === 'billing') && openComandas > 0 && (
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
      {(displayStatus === 'occupied' || displayStatus === 'billing') && table.openedAt && (
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

      {/* Reserved info - show today's reservation */}
      {displayStatus === 'reserved' && todayReservation && (
        <div className="flex flex-col items-center mt-1">
          <span className="text-xs text-muted-foreground truncate max-w-full px-2">
            {todayReservation.customerName}
          </span>
          <span className="text-xs text-table-reserved font-medium">
            {todayReservation.time}
          </span>
        </div>
      )}
    </button>
  );
}
