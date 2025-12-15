import { useState } from 'react';
import { Table, Comanda } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransferComandasModalProps {
  sourceTable: Table;
  allTables: Table[];
  onClose: () => void;
  onTransfer: (comandaIds: string[], targetTableId: number) => void;
}

export function TransferComandasModal({
  sourceTable,
  allTables,
  onClose,
  onTransfer,
}: TransferComandasModalProps) {
  const [selectedComandas, setSelectedComandas] = useState<string[]>([]);
  const [selectedTargetTable, setSelectedTargetTable] = useState<number | null>(null);

  const activeComandas = sourceTable.comandas.filter(c => c.status !== 'closed');
  const availableTables = allTables.filter(
    t => t.id !== sourceTable.id && (t.status === 'available' || t.status === 'occupied')
  );

  const toggleComanda = (id: string) => {
    setSelectedComandas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleTransfer = () => {
    if (selectedComandas.length > 0 && selectedTargetTable) {
      onTransfer(selectedComandas, selectedTargetTable);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up max-h-[85dvh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Transferir Comandas</h2>
            <p className="text-sm text-muted-foreground">
              Mesa {sourceTable.number}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation active-scale"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
          {/* Seleção de comandas */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">
              Selecione as comandas:
            </p>
            <div className="space-y-2">
              {activeComandas.map((comanda) => (
                <button
                  key={comanda.id}
                  onClick={() => toggleComanda(comanda.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all touch-manipulation',
                    selectedComandas.includes(comanda.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-secondary/30'
                  )}
                >
                  <div className="text-left">
                    <p className="font-semibold text-foreground">
                      Comanda #{comanda.number}
                    </p>
                    {comanda.customerName && (
                      <p className="text-xs text-muted-foreground">{comanda.customerName}</p>
                    )}
                    <p className="text-sm text-primary font-medium">
                      R$ {comanda.total.toFixed(2)}
                    </p>
                  </div>
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    selectedComandas.includes(comanda.id)
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground'
                  )}>
                    {selectedComandas.includes(comanda.id) && (
                      <Check size={14} className="text-primary-foreground" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de mesa destino */}
          {selectedComandas.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">
                Mesa de destino:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTargetTable(table.id)}
                    className={cn(
                      'aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all touch-manipulation',
                      selectedTargetTable === table.id
                        ? 'border-primary bg-primary/20'
                        : 'border-border bg-secondary/30'
                    )}
                  >
                    <span className="text-2xl font-bold text-foreground">{table.number}</span>
                    <span className="text-xs text-muted-foreground">
                      {table.status === 'available' ? 'Livre' : `${table.comandas.length}c`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botão de transferir */}
        {selectedComandas.length > 0 && selectedTargetTable && (
          <div className="pt-4 mt-4 border-t border-border">
            <Button
              variant="default"
              size="touch"
              onClick={handleTransfer}
              className="w-full gap-2"
            >
              <ArrowRight size={20} />
              Transferir {selectedComandas.length} comanda{selectedComandas.length > 1 ? 's' : ''} para Mesa {allTables.find(t => t.id === selectedTargetTable)?.number}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
