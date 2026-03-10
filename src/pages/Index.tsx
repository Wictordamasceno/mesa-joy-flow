import { useState, useMemo, useCallback } from 'react';
import { Table, Comanda, TableStatus, MenuItem, Extra, Reservation, OrderItem } from '@/types/restaurant';
import { Header } from '@/components/Header';
import { TablesGrid } from '@/components/TablesGrid';
import { TableActionsModal } from '@/components/TableActionsModal';
import { ComandaSelector } from '@/components/ComandaSelector';
import { ComandaDetailModal } from '@/components/ComandaDetailModal';
import { ReserveTableModal } from '@/components/ReserveTableModal';
import { ReservationsModal } from '@/components/ReservationsModal';
import { CreateComandaModal } from '@/components/CreateComandaModal';
import { TransferComandasModal } from '@/components/TransferComandasModal';
import { MenuSearchModal } from '@/components/MenuSearchModal';
import { useToast } from '@/hooks/use-toast';
import { useMesas } from '@/hooks/useMesas';
import { usePedido } from '@/hooks/usePedido';
import { useReservas } from '@/hooks/useReservas';
import { isToday, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/services/api';

interface IndexProps {
  attendantName?: string;
  onLogout?: () => void;
}

const Index = ({ attendantName, onLogout }: IndexProps) => {
  const { tables, isLoading: mesasLoading, abrirMesa, fecharMesa, liberarMesa, refetch: refetchMesas } = useMesas();
  const { reservations, createReserva, cancelReserva, convertReserva } = useReservas(format(new Date(), 'yyyy-MM-dd'));
  
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeFilter, setActiveFilter] = useState<TableStatus | 'all'>('all');
  const [showActions, setShowActions] = useState(false);
  const [showComandas, setShowComandas] = useState(false);
  const [showReserve, setShowReserve] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [showCreateComanda, setShowCreateComanda] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showComandaDetail, setShowComandaDetail] = useState(false);
  const [activeComanda, setActiveComanda] = useState<Comanda | null>(null);
  const { toast } = useToast();

  // Get auth user info
  const authUser = useMemo(() => {
    const userJson = localStorage.getItem("authUser");
    return userJson ? JSON.parse(userJson) : null;
  }, []);

  // Get pedido for selected table
  const selectedMesaCodigo = selectedTable?.status === 'occupied' || selectedTable?.status === 'billing'
    ? selectedTable.number : null;
  const { pedido, items: pedidoItems, comandaItems, addItem: addPedidoItem, removeItem: removePedidoItem, updateItem: updatePedidoItem, refetch: refetchPedido } = usePedido(selectedMesaCodigo);

  // Merge reservations into tables
  const tablesWithReservations = useMemo(() => {
    return tables.map(table => {
      const tableReservations = reservations
        .filter((r: any) => r.mesaCodigo === table.number)
        .map((r: any) => ({
          id: r.id,
          customerName: r.customerName,
          date: r.date,
          time: r.time,
          notes: r.notes,
          createdAt: r.createdAt,
        }));
      return { ...table, reservations: tableReservations };
    });
  }, [tables, reservations]);

  // Build comandas from pedido items
  const selectedTableWithComandas = useMemo(() => {
    if (!selectedTable) return null;
    const table = tablesWithReservations.find(t => t.id === selectedTable.id);
    if (!table) return selectedTable;

    if (!pedido) return { ...table, comandas: [] };

    // Group items by numcomanda
    const comandaNumbers = Object.keys(comandaItems).map(Number);
    if (comandaNumbers.length === 0) {
      // Create a single empty comanda
      return { ...table, comandas: [] };
    }

    const comandas: Comanda[] = comandaNumbers.map(num => {
      const items = comandaItems[num] || [];
      const total = items.reduce((sum, i) => {
        const extrasSum = i.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0;
        return sum + (i.menuItem.price + extrasSum) * i.quantity;
      }, 0);
      return {
        id: `comanda-${num}`,
        tableId: table.id,
        number: num,
        items,
        status: 'open' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        total,
      };
    });

    return { ...table, comandas };
  }, [selectedTable, tablesWithReservations, pedido, comandaItems]);

  // Calculate display status considering today's reservations
  const getDisplayStatus = useCallback((table: Table): TableStatus => {
    if (table.status === 'occupied' || table.status === 'billing') return table.status;
    const hasReservationToday = table.reservations.some(r => isToday(new Date(r.date)));
    if (hasReservationToday) return 'reserved';
    return 'available';
  }, []);

  const tableCounts = useMemo(() => {
    return tablesWithReservations.reduce(
      (acc, table) => {
        const displayStatus = getDisplayStatus(table);
        acc[displayStatus]++;
        return acc;
      },
      { available: 0, occupied: 0, billing: 0, reserved: 0 } as Record<TableStatus, number>
    );
  }, [tablesWithReservations, getDisplayStatus]);

  const filteredTables = useMemo(() => {
    if (activeFilter === 'all') return tablesWithReservations;
    return tablesWithReservations.filter((table) => getDisplayStatus(table) === activeFilter);
  }, [tablesWithReservations, activeFilter, getDisplayStatus]);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setShowActions(true);
  };

  const handleOpenTable = async () => {
    if (!selectedTable || !authUser) return;
    try {
      await abrirMesa.mutateAsync({
        codigo: selectedTable.number,
        data: { cdvend: authUser.cdvend },
      });
      await refetchMesas();
      setShowActions(false);
      toast({ title: 'Mesa aberta!', description: `Mesa ${selectedTable.number}` });
      // After opening, the comanda detail can be shown via pedido
      setShowCreateComanda(true);
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleReserveTable = () => {
    setShowActions(false);
    setShowReserve(true);
  };

  const handleConfirmReserve = async (reservation: Omit<Reservation, 'id' | 'createdAt'>) => {
    if (!selectedTable || !authUser) return;
    try {
      await createReserva.mutateAsync({
        nome_cliente: reservation.customerName,
        data_reserva: new Date(reservation.date).toISOString().replace('Z', ''),
        pessoas: selectedTable.seats,
        mesa_codigo: selectedTable.number,
        obs: reservation.notes || '',
        cdvend: authUser.cdvend,
      });
      setShowReserve(false);
      toast({ title: 'Reserva criada!', description: `${reservation.customerName} - ${reservation.time}` });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleCancelTodayReservation = async () => {
    if (!selectedTable) return;
    const todayReservation = reservations.find(
      (r: any) => r.mesaCodigo === selectedTable.number && isToday(new Date(r.date))
    );
    if (todayReservation) {
      try {
        await cancelReserva.mutateAsync(Number(todayReservation.id));
        setShowActions(false);
        toast({ title: 'Reserva cancelada!', description: `Mesa ${selectedTable.number}` });
      } catch (e: any) {
        toast({ title: 'Erro', description: e.message, variant: 'destructive' });
      }
    }
  };

  const handleAddComanda = () => {
    setShowActions(false);
    setShowCreateComanda(true);
  };

  const handleConfirmCreateComanda = (customerName?: string) => {
    if (!selectedTableWithComandas) return;
    const nextNumber = (selectedTableWithComandas.comandas?.length || 0) + 1;
    const newComanda: Comanda = {
      id: `comanda-${nextNumber}`,
      tableId: selectedTableWithComandas.id,
      number: nextNumber,
      customerName,
      items: [],
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      total: 0,
    };
    setActiveComanda(newComanda);
    setShowCreateComanda(false);
    setShowComandaDetail(true);
    toast({ title: 'Comanda criada!', description: `Comanda #${nextNumber}` });
  };

  const handleManageComandas = () => {
    setShowActions(false);
    setShowComandas(true);
  };

  const handleSelectComanda = (comanda: Comanda) => {
    setActiveComanda(comanda);
    setShowComandas(false);
    setShowComandaDetail(true);
  };

  const handleUpdateComanda = (updatedComanda: Comanda) => {
    setActiveComanda(updatedComanda);
  };

  const handleOpenMenuFromDetail = () => {
    setShowComandaDetail(false);
    setShowMenu(true);
  };

  const handleRequestBill = async (comanda: Comanda) => {
    if (!selectedTable || !authUser) return;
    try {
      await fecharMesa.mutateAsync({ codigo: selectedTable.number, cdvend: authUser.cdvend });
      await refetchMesas();
      toast({ title: 'Conta solicitada', description: `Mesa ${selectedTable.number}` });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleCloseComanda = async (comanda: Comanda) => {
    if (!selectedTable) return;
    try {
      await liberarMesa.mutateAsync(selectedTable.number);
      await refetchMesas();
      setShowComandas(false);
      setShowComandaDetail(false);
      toast({ title: 'Mesa liberada!', description: `Mesa ${selectedTable.number}` });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleTransferComandas = () => {
    setShowActions(false);
    setShowTransfer(true);
  };

  const handleConfirmTransfer = (comandaIds: string[], targetTableId: number) => {
    // Transfer logic remains local as API doesn't support it
    setShowTransfer(false);
    toast({ title: 'Transferência', description: 'Funcionalidade não disponível na API do ERP.' });
  };

  const handleCloseTable = async () => {
    if (!selectedTable) return;
    try {
      await liberarMesa.mutateAsync(selectedTable.number);
      await refetchMesas();
      setShowActions(false);
      toast({ title: 'Mesa liberada!', description: `Mesa ${selectedTable.number}` });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleAddItemToComanda = async (item: MenuItem, extras: Extra[], observations: string, quantity: number) => {
    if (!selectedTable || !activeComanda) return;

    try {
      const extra = extras[0]; // API supports one optional per item
      await addPedidoItem.mutateAsync({
        cdprod: Number(item.id),
        qtdeped: quantity,
        obs: observations || undefined,
        cdopc: extra ? Number(extra.id) : undefined,
        obs_opcional: extra ? extra.name : undefined,
        vl_opcional: extra ? extra.price : undefined,
        numcomanda: activeComanda.number,
      });
      await refetchPedido();
      const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
      toast({ title: `+${quantity} ${item.name}`, description: `R$ ${((item.price + extrasTotal) * quantity).toFixed(2)}` });
    } catch (e: any) {
      toast({ title: 'Erro ao adicionar item', description: e.message, variant: 'destructive' });
    }
  };

  // Reservation management handlers
  const handleAddReservationFromModal = (tableId: number) => {
    const table = tablesWithReservations.find(t => t.id === tableId);
    if (table) {
      setSelectedTable(table);
      setShowReservations(false);
      setShowReserve(true);
    }
  };

  const handleCancelReservationFromModal = async (tableId: number, reservationId: string) => {
    try {
      await cancelReserva.mutateAsync(Number(reservationId));
      toast({ title: 'Reserva cancelada!' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleOpenReservationFromModal = async (tableId: number, reservationId: string) => {
    try {
      await convertReserva.mutateAsync(Number(reservationId));
      const table = tablesWithReservations.find(t => t.id === tableId);
      if (table) {
        setSelectedTable(table);
        setShowReservations(false);
        // After converting, open the table
        if (authUser) {
          await abrirMesa.mutateAsync({
            codigo: table.number,
            data: { cdvend: authUser.cdvend },
          });
          await refetchMesas();
          setShowCreateComanda(true);
        }
      }
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  if (mesasLoading) {
    return (
      <div className="min-h-dvh bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando mesas...</p>
        </div>
      </div>
    );
  }

  const currentTable = selectedTableWithComandas || selectedTable;

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

      {showActions && currentTable && (
        <TableActionsModal
          table={currentTable}
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

      {showReserve && currentTable && (
        <ReserveTableModal 
          table={currentTable} 
          onClose={() => setShowReserve(false)} 
          onConfirm={handleConfirmReserve}
          existingReservations={currentTable.reservations}
        />
      )}

      {showReservations && (
        <ReservationsModal
          tables={tablesWithReservations}
          onClose={() => setShowReservations(false)}
          onAddReservation={handleAddReservationFromModal}
          onCancelReservation={handleCancelReservationFromModal}
          onOpenReservation={handleOpenReservationFromModal}
        />
      )}

      {showCreateComanda && currentTable && (
        <CreateComandaModal table={currentTable} nextNumber={(currentTable.comandas?.length || 0) + 1} onClose={() => setShowCreateComanda(false)} onConfirm={handleConfirmCreateComanda} />
      )}

      {showComandas && currentTable && (
        <ComandaSelector table={currentTable} onClose={() => setShowComandas(false)} onSelectComanda={handleSelectComanda} onCreateComanda={() => { setShowComandas(false); setShowCreateComanda(true); }} onRequestBill={handleRequestBill} onCloseComanda={handleCloseComanda} />
      )}

      {showTransfer && currentTable && (
        <TransferComandasModal sourceTable={currentTable} allTables={tablesWithReservations} onClose={() => setShowTransfer(false)} onTransfer={handleConfirmTransfer} />
      )}

      {showComandaDetail && currentTable && activeComanda && (
        <ComandaDetailModal
          table={currentTable}
          comanda={activeComanda}
          onClose={() => { setShowComandaDetail(false); setActiveComanda(null); }}
          onUpdateComanda={handleUpdateComanda}
          onRequestBill={(c) => { handleRequestBill(c); setShowComandaDetail(false); }}
          onCloseComanda={(c) => { handleCloseComanda(c); setShowComandaDetail(false); }}
          onOpenMenu={handleOpenMenuFromDetail}
        />
      )}

      {showMenu && currentTable && activeComanda && (
        <MenuSearchModal 
          onClose={() => { setShowMenu(false); setShowComandaDetail(true); }} 
          onAddItem={handleAddItemToComanda} 
        />
      )}
    </div>
  );
};

export default Index;
