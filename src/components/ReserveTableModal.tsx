import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Table, Reservation } from '@/types/restaurant';
import { Button } from './ui/button';
import { X, CalendarCheck, Calendar, Clock, User, FileText } from 'lucide-react';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';

interface ReserveTableModalProps {
  table: Table;
  onClose: () => void;
  onConfirm: (reservation: Omit<Reservation, 'id' | 'createdAt'>) => void;
  existingReservations?: Reservation[];
}

const timeSlots = [
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export function ReserveTableModal({ table, onClose, onConfirm, existingReservations = [] }: ReserveTableModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');

  const isDateReserved = (date: Date) => {
    return existingReservations.some(r => 
      format(new Date(r.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const isTimeReserved = (time: string) => {
    if (!selectedDate) return false;
    return existingReservations.some(r => 
      format(new Date(r.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && r.time === time
    );
  };

  const handleConfirm = () => {
    if (customerName.trim() && selectedDate && selectedTime) {
      onConfirm({
        customerName: customerName.trim(),
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim() || undefined,
      });
    }
  };

  const canConfirm = customerName.trim() && selectedDate && selectedTime;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl p-6 pb-safe animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Reservar Mesa {table.number}</h2>
            <p className="text-sm text-muted-foreground">Informe os dados da reserva</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center touch-manipulation active-scale"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nome do cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User size={16} />
              Nome do cliente
            </label>
            <input
              type="text"
              placeholder="Nome do cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              autoFocus
            />
          </div>

          {/* Data */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar size={16} />
              Data da reserva
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  size="touch"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Selecione a data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  modifiers={{
                    reserved: (date) => isDateReserved(date),
                  }}
                  modifiersClassNames={{
                    reserved: 'bg-table-reserved/30 text-table-reserved',
                  }}
                  className="p-3 pointer-events-auto"
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock size={16} />
              Horário
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const reserved = isTimeReserved(time);
                return (
                  <button
                    key={time}
                    onClick={() => !reserved && setSelectedTime(time)}
                    disabled={reserved}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-all touch-manipulation",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : reserved
                        ? "bg-table-reserved/20 text-table-reserved cursor-not-allowed"
                        : "bg-secondary text-foreground hover:bg-secondary/80 active-scale"
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText size={16} />
              Observações (opcional)
            </label>
            <textarea
              placeholder="Aniversário, preferência de mesa, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          <Button
            variant="default"
            size="touch"
            onClick={handleConfirm}
            disabled={!canConfirm}
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
