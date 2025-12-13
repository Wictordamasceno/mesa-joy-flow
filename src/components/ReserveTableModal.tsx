import { useState } from 'react';
import { Table } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, CalendarCheck } from 'lucide-react';

interface ReserveTableModalProps {
  table: Table;
  onClose: () => void;
  onConfirm: (customerName: string) => void;
}

export function ReserveTableModal({ table, onClose, onConfirm }: ReserveTableModalProps) {
  const [customerName, setCustomerName] = useState('');

  const handleConfirm = () => {
    if (customerName.trim()) {
      onConfirm(customerName.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Reservar Mesa {table.number}</h2>
            <p className="text-sm text-muted-foreground">Informe o nome da reserva</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation active-scale"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome do cliente"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
            autoFocus
          />

          <Button
            variant="default"
            size="touch"
            onClick={handleConfirm}
            disabled={!customerName.trim()}
            className="w-full gap-2"
          >
            <CalendarCheck size={20} />
            Confirmar Reserva
          </Button>
        </div>
      </div>
    </div>
  );
}
