import { useState } from 'react';
import { format, isToday, isTomorrow, isFuture, isPast, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, Reservation } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, CalendarCheck, Trash2, Calendar, Clock, User, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReservationsModalProps {
  tables: Table[];
  onClose: () => void;
  onAddReservation: (tableId: number) => void;
  onCancelReservation: (tableId: number, reservationId: string) => void;
  onOpenReservation: (tableId: number, reservationId: string) => void;
}

type FilterType = 'today' | 'tomorrow' | 'upcoming' | 'all';

export function ReservationsModal({
  tables,
  onClose,
  onAddReservation,
  onCancelReservation,
  onOpenReservation,
}: ReservationsModalProps) {
  const [filter, setFilter] = useState<FilterType>('today');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const allReservations = tables.flatMap(table =>
    table.reservations.map(r => ({ ...r, tableId: table.id, tableNumber: table.number }))
  );

  const filteredReservations = allReservations.filter(r => {
    const reservationDate = startOfDay(new Date(r.date));
    const today = startOfDay(new Date());
    
    switch (filter) {
      case 'today':
        return isToday(reservationDate);
      case 'tomorrow':
        return isTomorrow(reservationDate);
      case 'upcoming':
        return isFuture(reservationDate) && !isToday(reservationDate);
      case 'all':
      default:
        return !isPast(reservationDate) || isToday(reservationDate);
    }
  }).sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });

  const groupedByDate = filteredReservations.reduce((acc, r) => {
    const dateKey = format(new Date(r.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(r);
    return acc;
  }, {} as Record<string, typeof filteredReservations>);

  const availableTables = tables.filter(t => t.status === 'available');

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Reservas</h2>
            <p className="text-sm text-muted-foreground">Gerencie as reservas das mesas</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation active-scale"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
          {[
            { key: 'today', label: 'Hoje' },
            { key: 'tomorrow', label: 'Amanhã' },
            { key: 'upcoming', label: 'Próximos' },
            { key: 'all', label: 'Todos' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterType)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-manipulation",
                filter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Lista de reservas */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {Object.keys(groupedByDate).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarCheck size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhuma reserva encontrada</p>
            </div>
          ) : (
            Object.entries(groupedByDate).map(([dateKey, reservations]) => (
              <div key={dateKey}>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2 capitalize">
                  {formatDateLabel(dateKey)}
                </h3>
                <div className="space-y-2">
                  {reservations.map((r) => (
                    <div
                      key={r.id}
                      className="bg-secondary rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">Mesa {r.tableNumber}</span>
                          <span className="text-sm text-primary font-medium">{r.time}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User size={14} />
                          <span>{r.customerName}</span>
                        </div>
                        {r.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{r.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {isToday(new Date(r.date)) && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onOpenReservation(r.tableId, r.id)}
                            className="gap-1"
                          >
                            Abrir
                            <ChevronRight size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancelReservation(r.tableId, r.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Nova reserva */}
        <div className="pt-4 border-t border-border mt-4">
          {selectedTable === null ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Nova reserva - selecione a mesa:</p>
              <div className="flex gap-2 flex-wrap">
                {availableTables.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma mesa disponível</p>
                ) : (
                  availableTables.map(table => (
                    <button
                      key={table.id}
                      onClick={() => setSelectedTable(table.id)}
                      className="w-12 h-12 rounded-xl bg-secondary text-foreground font-bold hover:bg-primary hover:text-primary-foreground transition-all touch-manipulation active-scale"
                    >
                      {table.number}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-foreground">
                Mesa {tables.find(t => t.id === selectedTable)?.number} selecionada
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedTable(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    onAddReservation(selectedTable);
                    setSelectedTable(null);
                  }}
                  className="gap-1"
                >
                  <Plus size={16} />
                  Reservar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
