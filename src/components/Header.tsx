import { TableStatus } from '@/types/restaurant';
import { cn } from '@/lib/utils';
import { Wifi } from 'lucide-react';

interface HeaderProps {
  tableCounts: Record<TableStatus, number>;
  activeFilter: TableStatus | 'all';
  onFilterChange: (filter: TableStatus | 'all') => void;
}

const filterConfig = {
  all: { label: 'Todas', color: 'bg-secondary' },
  available: { label: 'Livres', color: 'bg-table-available' },
  occupied: { label: 'Ocupadas', color: 'bg-table-occupied' },
  billing: { label: 'Conta', color: 'bg-table-billing' },
};

export function Header({ tableCounts, activeFilter, onFilterChange }: HeaderProps) {
  const total = tableCounts.available + tableCounts.occupied + tableCounts.billing;

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border safe-top">
      <div className="px-4 pt-2 pb-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Mesas</h1>
            <p className="text-xs text-muted-foreground">
              Toque para gerenciar
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success">
            <Wifi size={14} className="animate-pulse-soft" />
            <span className="text-xs font-medium">ERP Online</span>
          </div>
        </div>

        {/* Filter pills - horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {(Object.keys(filterConfig) as Array<TableStatus | 'all'>).map((key) => {
            const config = filterConfig[key];
            const count = key === 'all' ? total : tableCounts[key];
            
            return (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap',
                  'transition-all duration-200 touch-manipulation active-scale',
                  'text-sm font-semibold touch-target',
                  activeFilter === key
                    ? 'bg-primary text-primary-foreground shadow-lg glow-primary'
                    : 'bg-secondary text-secondary-foreground'
                )}
              >
                <span className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
                <span>{config.label}</span>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-bold',
                  activeFilter === key ? 'bg-primary-foreground/20' : 'bg-background/30'
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
