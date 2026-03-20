import { Table } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, DoorOpen, CalendarCheck, Users, ArrowRightLeft, Receipt, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isToday } from 'date-fns';
import { useCapabilities } from '@/contexts/CapabilitiesContext';

interface TableActionsModalProps {
  table: Table;
  onClose: () => void;
  onOpenTable: () => void;
  onReserveTable: () => void;
  onAddComanda: () => void;
  onManageComandas: () => void;
  onTransferComandas: () => void;
  onCloseTable: () => void;
  onViewPedido?: () => void;
  onCancelReservation?: () => void;
}

function getTodayReservation(table: Table) {
  return table.reservations.find(r => isToday(new Date(r.date)));
}

export function TableActionsModal({
  table,
  onClose,
  onOpenTable,
  onReserveTable,
  onAddComanda,
  onManageComandas,
  onTransferComandas,
  onCloseTable,
  onViewPedido,
  onCancelReservation,
}: TableActionsModalProps) {
  const { features, isModoComanda, isModoMesa } = useCapabilities();
  const todayReservation = getTodayReservation(table);
  const isReservedToday = !!todayReservation;
  const isOccupied = table.status === 'occupied' || table.status === 'billing';
  const isAvailable = !isOccupied && !isReservedToday;
  const hasComandas = table.comandas.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mesa {table.number}</h2>
            <p className="text-sm text-muted-foreground">
              {isAvailable && 'Disponível para uso'}
              {isReservedToday && `Reservada - ${todayReservation.customerName} às ${todayReservation.time}`}
              {isOccupied && isModoComanda && `${table.comandas.filter(c => c.status !== 'closed').length} comanda(s) ativa(s)`}
              {isOccupied && isModoMesa && 'Mesa em atendimento'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation active-scale"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Mesa disponível */}
          {isAvailable && (
            <>
              <Button
                variant="default"
                size="touch"
                onClick={onOpenTable}
                className="w-full justify-start gap-3"
              >
                <DoorOpen size={22} />
                Abrir Mesa
              </Button>
              <Button
                variant="secondary"
                size="touch"
                onClick={onReserveTable}
                className="w-full justify-start gap-3"
              >
                <CalendarCheck size={22} />
                Reservar Mesa
              </Button>
            </>
          )}

          {/* Mesa reservada hoje */}
          {isReservedToday && !isOccupied && (
            <>
              <Button
                variant="default"
                size="touch"
                onClick={onOpenTable}
                className="w-full justify-start gap-3"
              >
                <DoorOpen size={22} />
                Abrir Mesa (Usar Reserva)
              </Button>
              <Button
                variant="outline"
                size="touch"
                onClick={onCancelReservation}
                className="w-full justify-start gap-3"
              >
                <X size={22} />
                Cancelar Reserva
              </Button>
            </>
          )}

          {/* Mesa ocupada — Modo Mesa */}
          {isOccupied && isModoMesa && (
            <>
              <Button
                variant="default"
                size="touch"
                onClick={onViewPedido}
                className="w-full justify-start gap-3"
              >
                <ShoppingBag size={22} />
                Ver Pedido / Adicionar Itens
              </Button>
              {features?.fechar_mesa_direto && (
                <Button
                  variant="warning"
                  size="touch"
                  onClick={onCloseTable}
                  className="w-full justify-start gap-3"
                >
                  <Receipt size={22} />
                  Fechar Mesa
                </Button>
              )}
            </>
          )}

          {/* Mesa ocupada — Modo Comanda */}
          {isOccupied && isModoComanda && (
            <>
              {features?.abrir_comanda && (
                <Button
                  variant="default"
                  size="touch"
                  onClick={onAddComanda}
                  className="w-full justify-start gap-3"
                >
                  <Users size={22} />
                  Nova Comanda
                </Button>
              )}
              {hasComandas && (
                <>
                  <Button
                    variant="secondary"
                    size="touch"
                    onClick={onManageComandas}
                    className="w-full justify-start gap-3"
                  >
                    <Receipt size={22} />
                    Gerenciar Comandas
                  </Button>
                  {features?.transferir_comanda && (
                    <Button
                      variant="outline"
                      size="touch"
                      onClick={onTransferComandas}
                      className="w-full justify-start gap-3"
                    >
                      <ArrowRightLeft size={22} />
                      Transferir Comandas
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
