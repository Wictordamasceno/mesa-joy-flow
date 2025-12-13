import { MenuItem } from '@/types/restaurant';
import { Plus, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
  showExtrasIndicator?: boolean;
}

export function MenuItemCard({ item, onAdd, showExtrasIndicator }: MenuItemCardProps) {
  const hasExtrasOrObs = item.extras?.length || item.observations?.length;

  return (
    <button
      onClick={() => onAdd(item)}
      className={cn(
        'flex items-center justify-between p-4 rounded-2xl w-full',
        'bg-card border border-border',
        'transition-all duration-150 touch-manipulation active-scale',
        'text-left touch-target'
      )}
    >
      <div className="flex-1 min-w-0 mr-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground text-base leading-tight">
            {item.name}
          </h3>
          {showExtrasIndicator && hasExtrasOrObs && (
            <Settings2 size={14} className="text-primary flex-shrink-0" />
          )}
        </div>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
        <span className="text-primary font-bold text-lg mt-2 block">
          R$ {item.price.toFixed(2)}
        </span>
      </div>
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
        <Plus size={24} strokeWidth={2.5} />
      </div>
    </button>
  );
}
