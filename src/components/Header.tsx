import { TableStatus } from '@/types/restaurant';
import { cn } from '@/lib/utils';

interface HeaderProps {
  tableCounts: Record<TableStatus, number>;
  activeFilter: TableStatus | 'all';
  onFilterChange: (filter: TableStatus | 'all') => void;
}

const filterConfig = {
  all: { label: 'Todas', color: 'bg-secondary' },
  available: { label: 'Disponíveis', color: 'bg-table-available' },
  occupied: { label: 'Ocupadas', color: 'bg-table-occupied' },
  billing: { label: 'Conta', color: 'bg-table-billing' },
};

export function Header({ tableCounts, activeFilter, onFilterChange }: HeaderProps) {
  const total = tableCounts.available + tableCounts.occupied + tableCounts.billing;

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border">
      <div className="container py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mesas</h1>
            <p className="text-sm text-muted-foreground">
              Gerenciamento de comandas
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">ERP:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-success font-medium">Conectado</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(filterConfig) as Array<TableStatus | 'all'>).map((key) => {
            const config = filterConfig[key];
            const count = key === 'all' ? total : tableCounts[key];
            
            return (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap',
                  'transition-all duration-200 touch-action-manipulation text-sm font-medium',
                  activeFilter === key
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                <span className={cn('w-2 h-2 rounded-full', config.color)} />
                <span>{config.label}</span>
                <span className="ml-1 px-1.5 py-0.5 rounded bg-background/20 text-xs">
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
