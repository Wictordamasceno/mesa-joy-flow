import { Table, Comanda } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, Plus, FileText, Receipt, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComandaSelectorProps {
  table: Table;
  onClose: () => void;
  onSelectComanda: (comanda: Comanda) => void;
  onCreateComanda: () => void;
  onRequestBill: (comanda: Comanda) => void;
  onCloseComanda: (comanda: Comanda) => void;
}

const statusLabels: Record<string, string> = {
  open: 'Aberta',
  sent: 'Enviada',
  billing: 'Conta',
  closed: 'Fechada',
};

const statusColors: Record<string, string> = {
  open: 'bg-table-available/20 text-table-available',
  sent: 'bg-table-occupied/20 text-table-occupied',
  billing: 'bg-table-billing/20 text-table-billing',
  closed: 'bg-muted text-muted-foreground',
};

export function ComandaSelector({
  table,
  onClose,
  onSelectComanda,
  onCreateComanda,
  onRequestBill,
  onCloseComanda,
}: ComandaSelectorProps) {
  const activeComandas = table.comandas.filter(c => c.status !== 'closed');
  const closedComandas = table.comandas.filter(c => c.status === 'closed');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Mesa {table.number}</h2>
            <p className="text-sm text-muted-foreground">
              {activeComandas.length} comanda{activeComandas.length !== 1 ? 's' : ''} ativa{activeComandas.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation active-scale"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
          <Button
            variant="default"
            size="touch"
            onClick={onCreateComanda}
            className="w-full justify-start gap-3"
          >
            <Plus size={22} />
            Nova Comanda
          </Button>

          {activeComandas.map((comanda) => (
            <div
              key={comanda.id}
              className="bg-secondary/50 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      Comanda #{comanda.number}
                    </p>
                    {comanda.customerName && (
                      <p className="text-xs text-muted-foreground">{comanda.customerName}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-semibold',
                    statusColors[comanda.status] || statusColors.open
                  )}>
                    {statusLabels[comanda.status] || 'Aberta'}
                  </span>
                  <p className="text-sm font-bold text-primary mt-1">
                    R$ {comanda.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectComanda(comanda)}
                  className="flex-1 gap-2"
                >
                  <ArrowRight size={16} />
                  Acessar
                </Button>
                {comanda.items.length > 0 && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onRequestBill(comanda)}
                    className="gap-2"
                  >
                    <Receipt size={16} />
                    Fechar
                  </Button>
                )}
              </div>
            </div>
          ))}

          {closedComandas.length > 0 && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
                Comandas fechadas
              </p>
              {closedComandas.map((comanda) => (
                <div
                  key={comanda.id}
                  className="flex items-center justify-between py-2 opacity-60"
                >
                  <span className="text-sm text-muted-foreground">
                    Comanda #{comanda.number}
                    {comanda.customerName && ` - ${comanda.customerName}`}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    R$ {comanda.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
