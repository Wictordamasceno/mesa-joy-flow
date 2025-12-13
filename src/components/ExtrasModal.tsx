import { useState } from 'react';
import { MenuItem, Extra } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, Check, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';

interface ExtrasModalProps {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (extras: Extra[], observations: string, quantity: number) => void;
}

export function ExtrasModal({ item, onClose, onConfirm }: ExtrasModalProps) {
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [observations, setObservations] = useState('');
  const [quantity, setQuantity] = useState(1);

  const toggleExtra = (extra: Extra) => {
    setSelectedExtras(prev =>
      prev.find(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    );
  };


  const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const itemTotal = (item.price + extrasTotal) * quantity;

  const handleConfirm = () => {
    onConfirm(selectedExtras, observations, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{item.name}</h2>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation active-scale"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
          {/* Quantidade */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Quantidade</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center touch-manipulation active-scale"
              >
                <Minus size={20} />
              </button>
              <span className="text-3xl font-bold text-foreground w-16 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center touch-manipulation active-scale"
              >
                <Plus size={20} className="text-primary-foreground" />
              </button>
            </div>
          </div>

          {/* Extras */}
          {item.extras && item.extras.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Extras</p>
              <div className="space-y-2">
                {item.extras.map((extra) => (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all touch-manipulation',
                      selectedExtras.find(e => e.id === extra.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/30'
                    )}
                  >
                    <span className="font-medium text-foreground">{extra.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-primary font-semibold">
                        + R$ {extra.price.toFixed(2)}
                      </span>
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                        selectedExtras.find(e => e.id === extra.id)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      )}>
                        {selectedExtras.find(e => e.id === extra.id) && (
                          <Check size={14} className="text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Observações</p>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Ex: Sem cebola, bem passado, etc."
              className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">
              R$ {itemTotal.toFixed(2)}
            </span>
          </div>
          <Button
            variant="default"
            size="touch"
            onClick={handleConfirm}
            className="w-full"
          >
            <Plus size={20} />
            Adicionar ao Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
