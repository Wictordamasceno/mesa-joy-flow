import { MenuItem } from '@/types/restaurant';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <button
      onClick={() => onAdd(item)}
      className={cn(
        'flex items-center justify-between p-4 rounded-xl',
        'bg-card border border-border',
        'hover:border-primary/50 hover:bg-secondary',
        'transition-all duration-200 touch-action-manipulation',
        'active:scale-[0.98] text-left w-full'
      )}
    >
      <div className="flex-1 min-w-0 mr-4">
        <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
        {item.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {item.description}
          </p>
        )}
        <span className="text-primary font-bold mt-1 block">
          R$ {item.price.toFixed(2)}
        </span>
      </div>
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <Plus size={20} />
      </div>
    </button>
  );
}
