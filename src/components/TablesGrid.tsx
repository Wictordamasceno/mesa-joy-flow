import { Table, Order } from '@/types/restaurant';
import { TableCard } from './TableCard';

interface TablesGridProps {
  tables: Table[];
  orders: Map<number, Order>;
  onTableClick: (table: Table) => void;
}

export function TablesGrid({ tables, orders, onTableClick }: TablesGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={onTableClick}
          orderTotal={orders.get(table.id)?.total}
        />
      ))}
    </div>
  );
}
