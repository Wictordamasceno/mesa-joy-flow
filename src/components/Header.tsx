import { TableStatus } from '@/types/restaurant';
import { cn } from '@/lib/utils';
import { Wifi, CalendarCheck } from 'lucide-react';

interface HeaderProps {
  tableCounts: Record<TableStatus, number>;
  activeFilter: TableStatus | 'all';
  onFilterChange: (filter: TableStatus | 'all') => void;
  onOpenReservations?: () => void;
}

const filterConfig = {
  all: { label: 'Todas', color: 'bg-secondary' },
  available: { label: 'Livres', color: 'bg-table-available' },
  occupied: { label: 'Ocupadas', color: 'bg-table-occupied' },
  billing: { label: 'Conta', color: 'bg-table-billing' },
  reserved: { label: 'Reservadas', color: 'bg-table-reserved' },
};

export function Header({ tableCounts, activeFilter, onFilterChange, onOpenReservations }: HeaderProps) {
  const total = tableCounts.available + tableCounts.occupied + tableCounts.billing + tableCounts.reserved;

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="px-4 pt-2 pb-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Mesas</h1>
            <p className="text-xs text-muted-foreground">
              Toque para gerenciar
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenReservations && (
              <button
                onClick={onOpenReservations}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-table-reserved/20 text-table-reserved touch-manipulation active-scale"
              >
                <CalendarCheck size={14} />
                <span className="text-xs font-medium">Reservas</span>
              </button>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success">
              <Wifi size={14} className="animate-pulse-soft" />
              <span className="text-xs font-medium">ERP Online</span>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1 scroll-smooth touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
          {(Object.keys(filterConfig) as Array<TableStatus | 'all'>).map((key) => {
            const config = filterConfig[key];
            const count = key === 'all' ? total : tableCounts[key];
            
            return (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap',
                  'transition-all duration-200 touch-manipulation active-scale',
                  'text-xs font-semibold min-h-[36px]',
                  activeFilter === key
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary/80 text-secondary-foreground'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', config.color)} />
                <span>{config.label}</span>
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center',
                  activeFilter === key ? 'bg-primary-foreground/20' : 'bg-background/50'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
