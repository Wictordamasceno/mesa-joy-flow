import { useState } from 'react';
import { Table } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, Plus } from 'lucide-react';

interface CreateComandaModalProps {
  table: Table;
  nextNumber: number;
  onClose: () => void;
  onConfirm: (customerName?: string) => void;
}

export function CreateComandaModal({ table, nextNumber, onClose, onConfirm }: CreateComandaModalProps) {
  const [customerName, setCustomerName] = useState('');

  const handleConfirm = () => {
    onConfirm(customerName.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Nova Comanda</h2>
            <p className="text-sm text-muted-foreground">
              Mesa {table.number} - Comanda #{nextNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation active-scale"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Nome do cliente (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: João, Maria..."
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              autoFocus
            />
          </div>

          <Button
            variant="default"
            size="touch"
            onClick={handleConfirm}
            className="w-full gap-2"
          >
            <Plus size={20} />
            Criar Comanda #{nextNumber}
          </Button>
        </div>
      </div>
    </div>
  );
}
