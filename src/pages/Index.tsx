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
import { useComandas } from '@/hooks/useComandas';
import { useCapabilities } from '@/contexts/CapabilitiesContext';
import { isToday, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { ApiError } from '@/services/api';

interface IndexProps {
  attendantName?: string;
  onLogout?: () => void;
}

const Index = ({ attendantName, onLogout }: IndexProps) => {
  const { tables, isLoading: mesasLoading, abrirMesa, fecharMesa, liberarMesa, transferirMesa, refetch: refetchMesas } = useMesas();
  const { reservations, createReserva, cancelReserva, convertReserva } = useReservas(format(new Date(), 'yyyy-MM-dd'));
  const { isModoComanda, isModoMesa, features } = useCapabilities();

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

  // Get comandas from API (only in comanda mode)
  const { comandas: apiComandas, createComanda, fecharComanda, refetch: refetchComandas } = useComandas(
    isModoComanda ? pedido?.cdpedido ?? null : null,
    selectedTable?.id ?? 0
  );

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

  // Build table with comandas
  const selectedTableWithComandas = useMemo(() => {
    if (!selectedTable) return null;
    const table = tablesWithReservations.find(t => t.id === selectedTable.id);
    if (!table) return selectedTable;

    if (isModoComanda && apiComandas.length > 0) {
      return { ...table, comandas: apiComandas };
    }

    if (isModoMesa && pedido) {
      // In mesa mode, create a virtual single "comanda" from all items
      const items = pedidoItems;
      const total = items.reduce((sum, i) => {
        const extrasSum = i.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0;
        return sum + (i.menuItem.price + extrasSum) * i.quantity;
      }, 0);
      const virtualComanda: Comanda = {
        id: 'pedido-direto',
        tableId: table.id,
        number: 0,
        items,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        total,
      };
      return { ...table, comandas: items.length > 0 ? [virtualComanda] : [] };
    }

    // Fallback: build from grouped items
    if (!pedido) return { ...table, comandas: [] };
    const comandaNumbers = Object.keys(comandaItems).map(Number);
    if (comandaNumbers.length === 0) return { ...table, comandas: [] };

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
  }, [selectedTable, tablesWithReservations, pedido, comandaItems, pedidoItems, apiComandas, isModoComanda, isModoMesa]);

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
      const { data: refreshedTables } = await refetchMesas();
      const updatedTable = refreshedTables?.find(t => t.id === selectedTable.id);
      if (updatedTable) {
        setSelectedTable(updatedTable);
      } else {
        // Fallback: update status locally
        setSelectedTable({ ...selectedTable, status: 'occupied' });
      }
      setShowActions(false);
      toast({ title: 'Mesa aberta!', description: `Mesa ${selectedTable.number}` });

      if (isModoComanda) {
        setShowCreateComanda(true);
      } else {
        // Modo mesa: go directly to add items — defer to let state update
        setTimeout(() => handleViewPedido(), 100);
      }
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' });
    }
  };

  const handleViewPedido = () => {
    // Modo mesa: open menu directly to add items
    setShowActions(false);
    if (isModoMesa) {
      // Create a virtual comanda for mesa mode
      const virtualComanda: Comanda = {
        id: 'pedido-direto',
        tableId: selectedTable?.id ?? 0,
        number: 0,
        items: pedidoItems,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
        total: pedidoItems.reduce((sum, i) => {
          const extrasSum = i.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0;
          return sum + (i.menuItem.price + extrasSum) * i.quantity;
        }, 0),
      };
      setActiveComanda(virtualComanda);
      setShowComandaDetail(true);
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

  const handleConfirmCreateComanda = async (customerName?: string) => {
    if (!selectedTableWithComandas || !pedido) return;
    try {
      const result = await createComanda.mutateAsync({
        nome: customerName,
      });
      await refetchComandas();
      const newComanda: Comanda = {
        id: `comanda-${result.numcomanda}`,
        tableId: selectedTableWithComandas.id,
        number: result.numcomanda,
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
      toast({ title: 'Comanda criada!', description: `Comanda #${result.numcomanda}` });
    } catch (e: any) {
      toast({ title: 'Erro ao criar comanda', description: e.message, variant: 'destructive' });
    }
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
    if (!selectedTable || !pedido) return;

    if (isModoComanda) {
      // Fechar comanda individual via API
      try {
        const result = await fecharComanda.mutateAsync({ numcomanda: comanda.number });
        await refetchComandas();
        await refetchMesas();

        if (result.mesa_liberada) {
          toast({ title: 'Mesa liberada!', description: `Última comanda fechada. Mesa ${selectedTable.number} liberada.` });
          setShowComandas(false);
          setShowComandaDetail(false);
          setSelectedTable(null);
        } else {
          toast({
            title: 'Comanda fechada!',
            description: `Comanda #${comanda.number}. ${result.comandas_abertas_restantes ?? 0} comanda(s) restante(s).`,
          });
        }
      } catch (e: any) {
        toast({ title: 'Erro', description: e.message, variant: 'destructive' });
      }
    } else {
      // Modo mesa: fechar mesa direto
      try {
        await fecharMesa.mutateAsync({ codigo: selectedTable.number, cdvend: authUser?.cdvend });
        await refetchMesas();
        toast({ title: 'Conta solicitada', description: `Mesa ${selectedTable.number}` });
      } catch (e: any) {
        toast({ title: 'Erro', description: e.message, variant: 'destructive' });
      }
    }
  };

  const handleCloseComanda = async (comanda: Comanda) => {
    if (!selectedTable) return;

    if (isModoMesa) {
      // Modo mesa: liberar mesa
      try {
        await liberarMesa.mutateAsync(selectedTable.number);
        await refetchMesas();
        setShowComandaDetail(false);
        toast({ title: 'Mesa liberada!', description: `Mesa ${selectedTable.number}` });
      } catch (e: any) {
        toast({ title: 'Erro', description: e.message, variant: 'destructive' });
      }
    } else {
      // Modo comanda: fechar comanda individual
      await handleRequestBill(comanda);
    }
  };

  const handleTransferComandas = () => {
    setShowActions(false);
    setShowTransfer(true);
  };

  const handleConfirmTransfer = async (numcomandas: number[], targetTableNumber: number) => {
    if (!selectedTable) return;
    try {
      const data: { mesa_destino: number; comandas?: number[] } = {
        mesa_destino: targetTableNumber,
      };
      // In comanda mode, send the array of comandas; in mesa mode, omit it to transfer everything
      if (isModoComanda && numcomandas.length > 0) {
        data.comandas = numcomandas;
      }
      await transferirMesa.mutateAsync({
        codigo: selectedTable.number,
        data,
      });
      if (isModoComanda) await refetchComandas();
      await refetchMesas();
      setShowTransfer(false);
      const desc = isModoComanda
        ? `${numcomandas.length} comanda(s) transferida(s) para Mesa ${targetTableNumber}`
        : `Pedido transferido para Mesa ${targetTableNumber}`;
      toast({ title: 'Transferência concluída!', description: desc });
    } catch (e: any) {
      toast({ title: 'Erro na transferência', description: e.message, variant: 'destructive' });
    }
  };

  const handleCloseTable = async () => {
    if (!selectedTable || !authUser) return;

    if (isModoMesa && features?.fechar_mesa_direto) {
      try {
        await fecharMesa.mutateAsync({ codigo: selectedTable.number, cdvend: authUser.cdvend });
        await refetchMesas();
        setShowActions(false);
        toast({ title: 'Mesa fechada!', description: `Mesa ${selectedTable.number}` });
      } catch (e: any) {
        toast({ title: 'Erro', description: e.message, variant: 'destructive' });
      }
    } else {
      // Should not happen in comanda mode — mesa is auto-released
      try {
        await liberarMesa.mutateAsync(selectedTable.number);
        await refetchMesas();
        setShowActions(false);
        toast({ title: 'Mesa liberada!', description: `Mesa ${selectedTable.number}` });
      } catch (e: any) {
        toast({ title: 'Erro', description: e.message, variant: 'destructive' });
      }
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
        numcomanda: isModoComanda ? activeComanda.number : undefined,
      });
      await refetchPedido();
      if (isModoComanda) await refetchComandas();
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
        if (authUser) {
          await abrirMesa.mutateAsync({
            codigo: table.number,
            data: { cdvend: authUser.cdvend },
          });
          await refetchMesas();
          if (isModoComanda) {
            setShowCreateComanda(true);
          }
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
          onViewPedido={handleViewPedido}
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
        <CreateComandaModal
          table={currentTable}
          nextNumber={(currentTable.comandas?.filter(c => c.status !== 'closed').length || 0) + 1}
          onClose={() => setShowCreateComanda(false)}
          onConfirm={handleConfirmCreateComanda}
          isLoading={createComanda.isPending}
        />
      )}

      {showComandas && currentTable && (
        <ComandaSelector
          table={currentTable}
          onClose={() => setShowComandas(false)}
          onSelectComanda={handleSelectComanda}
          onCreateComanda={() => { setShowComandas(false); setShowCreateComanda(true); }}
          onRequestBill={handleRequestBill}
          onCloseComanda={handleCloseComanda}
        />
      )}

      {showTransfer && currentTable && (
        <TransferComandasModal
          sourceTable={currentTable}
          allTables={tablesWithReservations}
          onClose={() => setShowTransfer(false)}
          onTransfer={handleConfirmTransfer}
          isLoading={transferirMesa.isPending}
        />
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
