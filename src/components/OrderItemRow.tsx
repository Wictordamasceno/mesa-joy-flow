import { OrderItem } from '@/types/restaurant';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItemRowProps {
  item: OrderItem;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemove: (itemId: string) => void;
}

const statusColors = {
  pending: 'bg-muted text-muted-foreground',
  preparing: 'bg-warning/20 text-warning',
  ready: 'bg-success/20 text-success',
  delivered: 'bg-primary/20 text-primary',
};

const statusLabels = {
  pending: 'Pendente',
  preparing: 'Preparando',
  ready: 'Pronto',
  delivered: 'Entregue',
};

export function OrderItemRow({ item, onUpdateQuantity, onRemove }: OrderItemRowProps) {
  const subtotal = item.menuItem.price * item.quantity;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 animate-fade-in">
      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-foreground">{item.menuItem.name}</h4>
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full uppercase font-bold',
            statusColors[item.status]
          )}>
            {statusLabels[item.status]}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-muted-foreground">
            R$ {item.menuItem.price.toFixed(2)} × {item.quantity}
          </span>
          <span className="font-bold text-primary">
            R$ {subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => item.quantity > 1 ? onUpdateQuantity(item.id, -1) : onRemove(item.id)}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'touch-manipulation active-scale touch-target',
            'bg-secondary text-muted-foreground',
            'transition-colors',
            item.quantity === 1 && 'bg-destructive/20 text-destructive'
          )}
        >
          {item.quantity === 1 ? <Trash2 size={18} /> : <Minus size={18} />}
        </button>
        <span className="w-8 text-center font-bold text-lg text-foreground">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(item.id, 1)}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'touch-manipulation active-scale touch-target',
            'bg-primary text-primary-foreground',
            'transition-colors'
          )}
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
