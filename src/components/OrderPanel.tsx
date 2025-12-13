import { useState } from 'react';
import { Table, Order, MenuItem, OrderItem } from '@/types/restaurant';
import { categories, menuItems } from '@/data/menuData';
import { CategoryTabs } from './CategoryTabs';
import { MenuItemCard } from './MenuItemCard';
import { OrderItemRow } from './OrderItemRow';
import { Button } from './ui/button';
import { ArrowLeft, Send, Receipt, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface OrderPanelProps {
  table: Table;
  order: Order | undefined;
  onClose: () => void;
  onUpdateOrder: (tableId: number, order: Order) => void;
  onUpdateTable: (table: Table) => void;
}

export function OrderPanel({ table, order, onClose, onUpdateOrder, onUpdateTable }: OrderPanelProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0].id);
  const { toast } = useToast();

  const filteredItems = menuItems.filter((item) => item.category === activeCategory);

  const currentOrder: Order = order || {
    id: `order-${table.id}-${Date.now()}`,
    tableId: table.id,
    items: [],
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
    total: 0,
  };

  const addItem = (menuItem: MenuItem) => {
    const existingItem = currentOrder.items.find((item) => item.menuItem.id === menuItem.id);
    
    let updatedItems: OrderItem[];
    if (existingItem) {
      updatedItems = currentOrder.items.map((item) =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}`,
        menuItem,
        quantity: 1,
        status: 'pending',
      };
      updatedItems = [...currentOrder.items, newItem];
    }

    const total = updatedItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
    
    const updatedOrder: Order = {
      ...currentOrder,
      items: updatedItems,
      updatedAt: new Date(),
      total,
    };

    onUpdateOrder(table.id, updatedOrder);

    if (table.status === 'available') {
      onUpdateTable({ ...table, status: 'occupied', openedAt: new Date() });
    }

    toast({
      title: 'Item adicionado',
      description: `${menuItem.name} adicionado ao pedido`,
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const updatedItems = currentOrder.items.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );

    const total = updatedItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

    onUpdateOrder(table.id, {
      ...currentOrder,
      items: updatedItems,
      updatedAt: new Date(),
      total,
    });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = currentOrder.items.filter((item) => item.id !== itemId);
    const total = updatedItems.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

    onUpdateOrder(table.id, {
      ...currentOrder,
      items: updatedItems,
      updatedAt: new Date(),
      total,
    });
  };

  const sendToKitchen = () => {
    const updatedItems = currentOrder.items.map((item) =>
      item.status === 'pending' ? { ...item, status: 'preparing' as const } : item
    );

    onUpdateOrder(table.id, {
      ...currentOrder,
      items: updatedItems,
      status: 'sent',
      updatedAt: new Date(),
    });

    toast({
      title: 'Pedido enviado!',
      description: 'O pedido foi enviado para a cozinha',
    });
  };

  const requestBill = () => {
    onUpdateOrder(table.id, {
      ...currentOrder,
      status: 'billing',
      updatedAt: new Date(),
    });

    onUpdateTable({ ...table, status: 'billing' });

    toast({
      title: 'Conta solicitada',
      description: `Mesa ${table.number} - Total: R$ ${currentOrder.total.toFixed(2)}`,
    });
  };

  const closeTable = () => {
    onUpdateOrder(table.id, {
      ...currentOrder,
      status: 'closed',
      updatedAt: new Date(),
    });

    onUpdateTable({ ...table, status: 'available', openedAt: undefined });

    toast({
      title: 'Mesa fechada',
      description: `Mesa ${table.number} está disponível`,
    });

    onClose();
  };

  const pendingItems = currentOrder.items.filter((item) => item.status === 'pending');
  const hasPendingItems = pendingItems.length > 0;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col lg:flex-row animate-slide-in">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 p-4 border-b border-border bg-card">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft size={24} />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Mesa {table.number}</h1>
            <span className="text-sm text-muted-foreground">{table.seats} lugares</span>
          </div>
        </header>

        {/* Categories */}
        <div className="p-4 border-b border-border bg-card/50">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAdd={addItem} />
            ))}
          </div>
        </div>
      </div>

      {/* Order Section */}
      <div className="w-full lg:w-[400px] flex flex-col bg-card border-t lg:border-t-0 border-border">
        <header className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Pedido Atual</h2>
          <span className="text-sm text-muted-foreground">
            {currentOrder.items.length} {currentOrder.items.length === 1 ? 'item' : 'itens'}
          </span>
        </header>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentOrder.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Receipt size={48} className="mb-2 opacity-50" />
              <p>Nenhum item no pedido</p>
            </div>
          ) : (
            currentOrder.items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        {/* Order Footer */}
        <div className="p-4 border-t border-border space-y-4">
          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-muted-foreground">Total</span>
            <span className="text-2xl font-bold text-primary">
              R$ {currentOrder.total.toFixed(2)}
            </span>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            {hasPendingItems && (
              <Button
                variant="default"
                size="touch"
                onClick={sendToKitchen}
                className="col-span-2"
              >
                <Send size={18} />
                Enviar para Cozinha
              </Button>
            )}

            {currentOrder.items.length > 0 && currentOrder.status !== 'billing' && (
              <Button
                variant="warning"
                size="touch"
                onClick={requestBill}
                className={cn(hasPendingItems ? 'col-span-1' : 'col-span-2')}
              >
                <Receipt size={18} />
                Fechar Conta
              </Button>
            )}

            {currentOrder.status === 'billing' && (
              <Button
                variant="success"
                size="touch"
                onClick={closeTable}
                className="col-span-2"
              >
                <CheckCircle size={18} />
                Finalizar Mesa
              </Button>
            )}

            {!hasPendingItems && currentOrder.items.length > 0 && currentOrder.status !== 'billing' && (
              <Button variant="outline" size="touch" onClick={onClose}>
                <X size={18} />
                Voltar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
