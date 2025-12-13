import { useState, useMemo } from 'react';
import { Table, Order, TableStatus } from '@/types/restaurant';
import { initialTables } from '@/data/tablesData';
import { Header } from '@/components/Header';
import { TablesGrid } from '@/components/TablesGrid';
import { OrderPanel } from '@/components/OrderPanel';

const Index = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [orders, setOrders] = useState<Map<number, Order>>(new Map());
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeFilter, setActiveFilter] = useState<TableStatus | 'all'>('all');

  const tableCounts = useMemo(() => {
    return tables.reduce(
      (acc, table) => {
        acc[table.status]++;
        return acc;
      },
      { available: 0, occupied: 0, billing: 0 } as Record<TableStatus, number>
    );
  }, [tables]);

  const filteredTables = useMemo(() => {
    if (activeFilter === 'all') return tables;
    return tables.filter((table) => table.status === activeFilter);
  }, [tables, activeFilter]);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleClosePanel = () => {
    setSelectedTable(null);
  };

  const handleUpdateOrder = (tableId: number, order: Order) => {
    setOrders((prev) => {
      const next = new Map(prev);
      next.set(tableId, order);
      return next;
    });
  };

  const handleUpdateTable = (updatedTable: Table) => {
    setTables((prev) =>
      prev.map((table) => (table.id === updatedTable.id ? updatedTable : table))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        tableCounts={tableCounts}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <main>
        <TablesGrid
          tables={filteredTables}
          orders={orders}
          onTableClick={handleTableClick}
        />
      </main>

      {selectedTable && (
        <OrderPanel
          table={selectedTable}
          order={orders.get(selectedTable.id)}
          onClose={handleClosePanel}
          onUpdateOrder={handleUpdateOrder}
          onUpdateTable={handleUpdateTable}
        />
      )}
    </div>
  );
};

export default Index;
