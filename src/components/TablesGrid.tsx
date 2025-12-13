import { Table, Order } from '@/types/restaurant';
import { TableCard } from './TableCard';

interface TablesGridProps {
  tables: Table[];
  orders: Map<number, Order>;
  onTableClick: (table: Table) => void;
}

export function TablesGrid({ tables, orders, onTableClick }: TablesGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 pb-8 safe-bottom">
      {tables.map((table, index) => (
        <div 
          key={table.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 30}ms` }}
        >
          <TableCard
            table={table}
            onClick={onTableClick}
            orderTotal={orders.get(table.id)?.total}
          />
        </div>
      ))}
    </div>
  );
}
