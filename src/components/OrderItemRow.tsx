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

export function OrderItemRow({ item, onUpdateQuantity, onRemove }: OrderItemRowProps) {
  const subtotal = item.menuItem.price * item.quantity;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 animate-fade-in">
      {/* Item info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-foreground truncate">{item.menuItem.name}</h4>
          <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', statusColors[item.status])}>
            {item.status === 'pending' ? 'Pendente' : 
             item.status === 'preparing' ? 'Preparando' :
             item.status === 'ready' ? 'Pronto' : 'Entregue'}
          </span>
        </div>
        <span className="text-sm text-muted-foreground">
          R$ {item.menuItem.price.toFixed(2)} cada
        </span>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => item.quantity > 1 ? onUpdateQuantity(item.id, -1) : onRemove(item.id)}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
        </button>
        <span className="w-8 text-center font-semibold text-foreground">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, 1)}
          className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Subtotal */}
      <span className="w-24 text-right font-semibold text-foreground">
        R$ {subtotal.toFixed(2)}
      </span>
    </div>
  );
}
