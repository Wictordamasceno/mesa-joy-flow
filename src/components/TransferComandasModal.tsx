import { useState } from 'react';
import { Table, Comanda } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, ArrowRight, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCapabilities } from '@/contexts/CapabilitiesContext';

interface TransferComandasModalProps {
  sourceTable: Table;
  allTables: Table[];
  onClose: () => void;
  onTransfer: (numcomandas: number[], targetTableId: number) => Promise<void>;
  isLoading?: boolean;
}

export function TransferComandasModal({
  sourceTable,
  allTables,
  onClose,
  onTransfer,
  isLoading,
}: TransferComandasModalProps) {
  const { isModoMesa, isModoComanda } = useCapabilities();
  const [selectedComandas, setSelectedComandas] = useState<number[]>([]);
  const [selectedTargetTable, setSelectedTargetTable] = useState<number | null>(null);

  const activeComandas = sourceTable.comandas.filter(c => c.status !== 'closed');
  const availableTables = allTables.filter(
    t => t.id !== sourceTable.id && (t.status === 'available' || t.status === 'occupied')
  );

  const toggleComanda = (num: number) => {
    setSelectedComandas(prev =>
      prev.includes(num) ? prev.filter(c => c !== num) : [...prev, num]
    );
  };

  const canTransfer = isModoMesa
    ? !!selectedTargetTable
    : selectedComandas.length > 0 && !!selectedTargetTable;

  const handleTransfer = async () => {
    if (!canTransfer || !selectedTargetTable) return;
    await onTransfer(selectedComandas, selectedTargetTable);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up max-h-[85dvh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isModoMesa ? 'Transferir Mesa' : 'Transferir Comandas'}
            </h2>
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
          {/* In mesa mode, skip comanda selection — transfer whole pedido */}
          {isModoMesa && (
            <div className="p-3 rounded-xl bg-secondary/30 border border-border">
              <p className="text-sm text-muted-foreground">
                Todo o pedido da Mesa {sourceTable.number} será transferido para a mesa de destino.
              </p>
            </div>
          )}

          {/* In comanda mode, show comanda selection */}
          {isModoComanda && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">
                Selecione as comandas:
              </p>
              <div className="space-y-2">
                {activeComandas.map((comanda) => (
                  <button
                    key={comanda.id}
                    onClick={() => toggleComanda(comanda.number)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all touch-manipulation',
                      selectedComandas.includes(comanda.number)
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
                      selectedComandas.includes(comanda.number)
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    )}>
                      {selectedComandas.includes(comanda.number) && (
                        <Check size={14} className="text-primary-foreground" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Show target table selection */}
          {(isModoMesa || selectedComandas.length > 0) && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-2">
                Mesa de destino:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {availableTables.map((table) => (
                  <button
                    key={table.id}
                    onClick={() => setSelectedTargetTable(table.number)}
                    className={cn(
                      'aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all touch-manipulation',
                      selectedTargetTable === table.number
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

        {canTransfer && (
          <div className="pt-4 mt-4 border-t border-border">
            <Button
              variant="default"
              size="touch"
              onClick={handleTransfer}
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
              {isModoMesa
                ? `Transferir pedido para Mesa ${selectedTargetTable}`
                : `Transferir ${selectedComandas.length} comanda${selectedComandas.length > 1 ? 's' : ''} para Mesa ${selectedTargetTable}`
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}