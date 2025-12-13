import { useState } from 'react';
import { Table, Order, MenuItem, OrderItem } from '@/types/restaurant';
import { categories, menuItems } from '@/data/menuData';
import { CategoryTabs } from './CategoryTabs';
import { MenuItemCard } from './MenuItemCard';
import { OrderItemRow } from './OrderItemRow';
import { Button } from './ui/button';
import { ArrowLeft, Send, Receipt, CheckCircle, ShoppingBag } from 'lucide-react';
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
  const [showOrder, setShowOrder] = useState(false);
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
      title: `+1 ${menuItem.name}`,
      description: `R$ ${menuItem.price.toFixed(2)}`,
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
      title: 'Enviado para cozinha!',
      description: `${currentOrder.items.filter(i => i.status === 'pending').length} itens`,
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
      description: `R$ ${currentOrder.total.toFixed(2)}`,
    });
    setShowOrder(false);
  };

  const closeTable = () => {
    onUpdateOrder(table.id, {
      ...currentOrder,
      status: 'closed',
      updatedAt: new Date(),
    });

    onUpdateTable({ ...table, status: 'available', openedAt: undefined });

    toast({
      title: 'Mesa liberada!',
      description: `Mesa ${table.number} disponível`,
    });

    onClose();
  };

  const pendingItems = currentOrder.items.filter((item) => item.status === 'pending');
  const hasPendingItems = pendingItems.length > 0;
  const itemCount = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col animate-slide-up">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card safe-top">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary text-foreground touch-manipulation active-scale touch-target"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Mesa {table.number}</h1>
          <span className="text-sm text-muted-foreground">{table.seats} lugares</span>
        </div>
        {currentOrder.items.length > 0 && (
          <button
            onClick={() => setShowOrder(!showOrder)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2.5 rounded-full',
              'touch-manipulation active-scale touch-target font-semibold',
              showOrder ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
            )}
          >
            <ShoppingBag size={18} />
            <span className="text-sm">R$ {currentOrder.total.toFixed(2)}</span>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
              {itemCount}
            </span>
          </button>
        )}
      </header>

      {/* Content */}
      {showOrder ? (
        // Order view
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {currentOrder.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <Receipt size={64} className="mb-4 opacity-30" />
                <p className="text-lg">Pedido vazio</p>
                <p className="text-sm mt-1">Adicione itens do cardápio</p>
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

          {/* Order actions */}
          <div className="p-4 border-t border-border bg-card space-y-3 safe-bottom">
            <div className="flex items-center justify-between">
              <span className="text-lg text-muted-foreground">Total</span>
              <span className="text-3xl font-bold text-primary">
                R$ {currentOrder.total.toFixed(2)}
              </span>
            </div>

            {hasPendingItems && (
              <Button
                variant="default"
                size="touch"
                onClick={sendToKitchen}
                className="w-full"
              >
                <Send size={20} />
                Enviar para Cozinha ({pendingItems.length})
              </Button>
            )}

            {currentOrder.items.length > 0 && currentOrder.status !== 'billing' && (
              <Button
                variant="warning"
                size="touch"
                onClick={requestBill}
                className="w-full"
              >
                <Receipt size={20} />
                Fechar Conta
              </Button>
            )}

            {currentOrder.status === 'billing' && (
              <Button
                variant="success"
                size="touch"
                onClick={closeTable}
                className="w-full"
              >
                <CheckCircle size={20} />
                Finalizar e Liberar Mesa
              </Button>
            )}
          </div>
        </div>
      ) : (
        // Menu view
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Categories */}
          <div className="px-4 py-3 border-b border-border bg-card/50">
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MenuItemCard item={item} onAdd={addItem} />
              </div>
            ))}
          </div>

          {/* Quick order button when items exist */}
          {currentOrder.items.length > 0 && hasPendingItems && (
            <div className="p-4 border-t border-border bg-card safe-bottom">
              <Button
                variant="default"
                size="touch"
                onClick={sendToKitchen}
                className="w-full"
              >
                <Send size={20} />
                Enviar {pendingItems.length} {pendingItems.length === 1 ? 'item' : 'itens'} para Cozinha
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
