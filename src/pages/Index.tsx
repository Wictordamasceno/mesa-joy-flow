import { useState, useMemo } from 'react';
import { Table, Comanda, TableStatus, MenuItem, Extra, Reservation } from '@/types/restaurant';
import { initialTables } from '@/data/tablesData';
import { Header } from '@/components/Header';
import { TablesGrid } from '@/components/TablesGrid';
import { TableActionsModal } from '@/components/TableActionsModal';
import { ComandaSelector } from '@/components/ComandaSelector';
import { ReserveTableModal } from '@/components/ReserveTableModal';
import { ReservationsModal } from '@/components/ReservationsModal';
import { CreateComandaModal } from '@/components/CreateComandaModal';
import { TransferComandasModal } from '@/components/TransferComandasModal';
import { MenuSearchModal } from '@/components/MenuSearchModal';
import { useToast } from '@/hooks/use-toast';
import { isToday } from 'date-fns';

interface IndexProps {
  attendantName?: string;
  onLogout?: () => void;
}

const Index = ({ attendantName, onLogout }: IndexProps) => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeFilter, setActiveFilter] = useState<TableStatus | 'all'>('all');
  const [showActions, setShowActions] = useState(false);
  const [showComandas, setShowComandas] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [showCreateComanda, setShowCreateComanda] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeComanda, setActiveComanda] = useState<Comanda | null>(null);
  const { toast } = useToast();

  // Calculate display status considering today's reservations
  const getDisplayStatus = (table: Table): TableStatus => {
    if (table.status === 'occupied' || table.status === 'billing') return table.status;
    const hasReservationToday = table.reservations.some(r => isToday(new Date(r.date)));
    if (hasReservationToday) return 'reserved';
    return 'available';
  };

  const tableCounts = useMemo(() => {
    return tables.reduce(
      (acc, table) => {
        const displayStatus = getDisplayStatus(table);
        acc[displayStatus]++;
        return acc;
      },
      { available: 0, occupied: 0, billing: 0, reserved: 0 } as Record<TableStatus, number>
    );
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (activeFilter === 'all') return tables;
    return tables.filter((table) => getDisplayStatus(table) === activeFilter);
  }, [tables, activeFilter]);

  const updateTable = (updatedTable: Table) => {
    setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    setSelectedTable(updatedTable);
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setShowActions(true);
  };

  const handleOpenTable = () => {
    if (!selectedTable) return;
    // Remove today's reservation if exists
    const updatedReservations = selectedTable.reservations.filter(r => !isToday(new Date(r.date)));
    updateTable({
      ...selectedTable,
      status: 'occupied',
      openedAt: new Date(),
      comandas: [],
      reservations: updatedReservations,
    });
    setShowActions(false);
    setShowCreateComanda(true);
  };

  const handleReserveTable = () => {
    setShowActions(false);
    setShowReserve(true);
  };

  const handleConfirmReserve = (reservation: Omit<Reservation, 'id' | 'createdAt'>) => {
    if (!selectedTable) return;
    const newReservation: Reservation = {
      ...reservation,
      id: `reservation-${Date.now()}`,
      createdAt: new Date(),
    };
    updateTable({
      ...selectedTable,
      reservations: [...selectedTable.reservations, newReservation],
    });
    setShowReserve(false);
    toast({ title: 'Reserva criada!', description: `${reservation.customerName} - ${reservation.time}` });
  };

  const handleCancelTodayReservation = () => {
    if (!selectedTable) return;
    const updatedReservations = selectedTable.reservations.filter(r => !isToday(new Date(r.date)));
    updateTable({ ...selectedTable, reservations: updatedReservations });
    setShowActions(false);
    toast({ title: 'Reserva cancelada!', description: `Mesa ${selectedTable.number}` });
  };

  const handleAddComanda = () => {
    setShowActions(false);
    setShowCreateComanda(true);
  };

  const handleConfirmCreateComanda = (customerName?: string) => {
    if (!selectedTable) return;
    const nextNumber = selectedTable.comandas.length + 1;
    const newComanda: Comanda = {
      id: `comanda-${Date.now()}`,
      tableId: selectedTable.id,
      number: nextNumber,
      customerName,
      items: [],
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      total: 0,
    };
    updateTable({ ...selectedTable, comandas: [...selectedTable.comandas, newComanda] });
    setActiveComanda(newComanda);
    setShowCreateComanda(false);
    setShowMenu(true);
    toast({ title: 'Comanda criada!', description: `Comanda #${nextNumber}` });
  };

  const handleManageComandas = () => {
    setShowActions(false);
    setShowComandas(true);
  };

  const handleSelectComanda = (comanda: Comanda) => {
    setActiveComanda(comanda);
    setShowComandas(false);
    setShowMenu(true);
  };

  const handleRequestBill = (comanda: Comanda) => {
    if (!selectedTable) return;
    const updatedComandas = selectedTable.comandas.map(c => 
      c.id === comanda.id ? { ...c, status: 'billing' as const } : c
    );
    const allBilling = updatedComandas.every(c => c.status === 'billing' || c.status === 'closed');
    updateTable({ ...selectedTable, comandas: updatedComandas, status: allBilling ? 'billing' : 'occupied' });
    toast({ title: 'Conta solicitada', description: `Comanda #${comanda.number}` });
  };

  const handleCloseComanda = (comanda: Comanda) => {
    if (!selectedTable) return;
    const updatedComandas = selectedTable.comandas.map(c => 
      c.id === comanda.id ? { ...c, status: 'closed' as const } : c
    );
    const allClosed = updatedComandas.every(c => c.status === 'closed');
    if (allClosed) {
      updateTable({ ...selectedTable, comandas: [], status: 'available', openedAt: undefined });
      setShowComandas(false);
      toast({ title: 'Mesa liberada!', description: `Mesa ${selectedTable.number}` });
    } else {
      updateTable({ ...selectedTable, comandas: updatedComandas });
      toast({ title: 'Comanda fechada', description: `Comanda #${comanda.number}` });
    }
  };

  const handleTransferComandas = () => {
    setShowActions(false);
    setShowTransfer(true);
  };

  const handleConfirmTransfer = (comandaIds: string[], targetTableId: number) => {
    if (!selectedTable) return;
    const targetTable = tables.find(t => t.id === targetTableId);
    if (!targetTable) return;

    const comandasToTransfer = selectedTable.comandas.filter(c => comandaIds.includes(c.id));
    const remainingComandas = selectedTable.comandas.filter(c => !comandaIds.includes(c.id));

    const updatedTargetComandas = [
      ...targetTable.comandas,
      ...comandasToTransfer.map(c => ({ ...c, tableId: targetTableId }))
    ];

    setTables(prev => prev.map(t => {
      if (t.id === selectedTable.id) {
        return { ...t, comandas: remainingComandas, status: remainingComandas.length === 0 ? 'available' : t.status, openedAt: remainingComandas.length === 0 ? undefined : t.openedAt };
      }
      if (t.id === targetTableId) {
        return { ...t, comandas: updatedTargetComandas, status: 'occupied', openedAt: t.openedAt || new Date() };
      }
      return t;
    }));

    setShowTransfer(false);
    toast({ title: 'Transferência realizada!', description: `${comandaIds.length} comanda(s) para mesa ${targetTable.number}` });
  };

  const handleCloseTable = () => {
    if (!selectedTable) return;
    updateTable({ ...selectedTable, status: 'available', comandas: [], openedAt: undefined });
    setShowActions(false);
    toast({ title: 'Mesa liberada!', description: `Mesa ${selectedTable.number}` });
  };

  const handleAddItemToComanda = (item: MenuItem, extras: Extra[], observations: string, quantity: number) => {
    if (!selectedTable || !activeComanda) return;

    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
    const newItem = {
      id: `item-${Date.now()}`,
      menuItem: item,
      quantity,
      selectedExtras: extras,
      selectedObservations: observations ? [observations] : [],
      status: 'pending' as const,
    };

    const updatedComandas = selectedTable.comandas.map(c => {
      if (c.id === activeComanda.id) {
        const updatedItems = [...c.items, newItem];
        const total = updatedItems.reduce((sum, i) => {
          const extrasSum = i.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0;
          return sum + (i.menuItem.price + extrasSum) * i.quantity;
        }, 0);
        return { ...c, items: updatedItems, total, updatedAt: new Date() };
      }
      return c;
    });

    updateTable({ ...selectedTable, comandas: updatedComandas });
    toast({ title: `+${quantity} ${item.name}`, description: `R$ ${((item.price + extrasTotal) * quantity).toFixed(2)}` });
  };

  // Reservation management handlers
  const handleAddReservationFromModal = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      setSelectedTable(table);
      setShowReservations(false);
      setShowReserve(true);
    }
  };

  const handleCancelReservationFromModal = (tableId: number, reservationId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return { ...t, reservations: t.reservations.filter(r => r.id !== reservationId) };
      }
      return t;
    }));
    toast({ title: 'Reserva cancelada!' });
  };

  const handleOpenReservationFromModal = (tableId: number, reservationId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (table) {
      const updatedReservations = table.reservations.filter(r => r.id !== reservationId);
      setTables(prev => prev.map(t => {
        if (t.id === tableId) {
          return { ...t, status: 'occupied', openedAt: new Date(), comandas: [], reservations: updatedReservations };
        }
        return t;
      }));
      setSelectedTable({ ...table, status: 'occupied', openedAt: new Date(), comandas: [], reservations: updatedReservations });
      setShowReservations(false);
      setShowCreateComanda(true);
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Header 
        tableCounts={tableCounts} 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        onOpenReservations={() => setShowReservations(true)}
        onLogout={onLogout}
      />
      <main className="pb-20">
        <TablesGrid tables={filteredTables} onTableClick={handleTableClick} />
      </main>

      {showActions && selectedTable && (
        <TableActionsModal
          table={selectedTable}
          onClose={() => setShowActions(false)}
          onOpenTable={handleOpenTable}
          onReserveTable={handleReserveTable}
          onAddComanda={handleAddComanda}
          onManageComandas={handleManageComandas}
          onTransferComandas={handleTransferComandas}
          onCloseTable={handleCloseTable}
          onCancelReservation={handleCancelTodayReservation}
        />
      )}

      {showReserve && selectedTable && (
        <ReserveTableModal 
          table={selectedTable} 
          onClose={() => setShowReserve(false)} 
          onConfirm={handleConfirmReserve}
          existingReservations={selectedTable.reservations}
        />
      )}

      {showReservations && (
        <ReservationsModal
          tables={tables}
          onClose={() => setShowReservations(false)}
          onAddReservation={handleAddReservationFromModal}
          onCancelReservation={handleCancelReservationFromModal}
          onOpenReservation={handleOpenReservationFromModal}
        />
      )}

      {showCreateComanda && selectedTable && (
        <CreateComandaModal table={selectedTable} nextNumber={selectedTable.comandas.length + 1} onClose={() => setShowCreateComanda(false)} onConfirm={handleConfirmCreateComanda} />
      )}

      {showComandas && selectedTable && (
        <ComandaSelector table={selectedTable} onClose={() => setShowComandas(false)} onSelectComanda={handleSelectComanda} onCreateComanda={() => { setShowComandas(false); setShowCreateComanda(true); }} onRequestBill={handleRequestBill} onCloseComanda={handleCloseComanda} />
      )}

      {showTransfer && selectedTable && (
        <TransferComandasModal sourceTable={selectedTable} allTables={tables} onClose={() => setShowTransfer(false)} onTransfer={handleConfirmTransfer} />
      )}

      {showMenu && selectedTable && (
        <MenuSearchModal onClose={() => { setShowMenu(false); setActiveComanda(null); }} onAddItem={handleAddItemToComanda} />
      )}
    </div>
  );
};

export default Index;
