import { useState } from 'react';
import { Table, Comanda, MenuItem, Extra, OrderItem } from '@/types/restaurant';
import { Button } from './ui/button';
import { OrderItemRow } from './OrderItemRow';
import { X, Plus, Send, Receipt, CheckCircle, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComandaDetailModalProps {
  table: Table;
  comanda: Comanda;
  onClose: () => void;
  onUpdateComanda: (comanda: Comanda) => void;
  onRequestBill: (comanda: Comanda) => void;
  onCloseComanda: (comanda: Comanda) => void;
  onOpenMenu: () => void;
}

export function ComandaDetailModal({
  table,
  comanda,
  onClose,
  onUpdateComanda,
  onRequestBill,
  onCloseComanda,
  onOpenMenu,
}: ComandaDetailModalProps) {
  const updateQuantity = (itemId: string, delta: number) => {
    const updatedItems = comanda.items.map((item) =>
      item.id === itemId
        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
        : item
    );
    
    const total = calculateTotal(updatedItems);
    onUpdateComanda({ ...comanda, items: updatedItems, total, updatedAt: new Date() });
  };

  const removeItem = (itemId: string) => {
    const updatedItems = comanda.items.filter((item) => item.id !== itemId);
    const total = calculateTotal(updatedItems);
    onUpdateComanda({ ...comanda, items: updatedItems, total, updatedAt: new Date() });
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item) => {
      const extrasSum = item.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0;
      return sum + (item.menuItem.price + extrasSum) * item.quantity;
    }, 0);
  };

  const sendToKitchen = () => {
    const updatedItems = comanda.items.map((item) =>
      item.status === 'pending' ? { ...item, status: 'preparing' as const } : item
    );
    onUpdateComanda({ ...comanda, items: updatedItems, status: 'sent', updatedAt: new Date() });
  };

  const pendingItems = comanda.items.filter((item) => item.status === 'pending');
  const hasPendingItems = pendingItems.length > 0;
  const itemCount = comanda.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 bg-background animate-slide-up flex flex-col h-dvh">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card safe-top">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary text-foreground touch-manipulation active-scale"
        >
          <X size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">
            Mesa {table.number} - Comanda #{comanda.number}
          </h1>
          {comanda.customerName && (
            <span className="text-sm text-muted-foreground">{comanda.customerName}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-semibold',
            comanda.status === 'open' && 'bg-table-available/20 text-table-available',
            comanda.status === 'sent' && 'bg-table-occupied/20 text-table-occupied',
            comanda.status === 'billing' && 'bg-table-billing/20 text-table-billing',
          )}>
            {comanda.status === 'open' ? 'Aberta' : comanda.status === 'sent' ? 'Enviada' : 'Conta'}
          </span>
        </div>
      </header>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {comanda.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
            <ShoppingBag size={64} className="mb-4 opacity-30" />
            <p className="text-lg">Comanda vazia</p>
            <p className="text-sm mt-1">Adicione itens do cardápio</p>
            <Button
              variant="default"
              size="touch"
              onClick={onOpenMenu}
              className="mt-6 gap-2"
            >
              <Plus size={20} />
              Adicionar Itens
            </Button>
          </div>
        ) : (
          <>
            {comanda.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <OrderItemRow
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
                {/* Show extras and observations */}
                {(item.selectedExtras?.length > 0 || item.selectedObservations?.length > 0) && (
                  <div className="ml-4 pl-3 border-l-2 border-primary/30 text-sm text-muted-foreground space-y-1">
                    {item.selectedExtras?.map((extra) => (
                      <p key={extra.id}>+ {extra.name} (R$ {extra.price.toFixed(2)})</p>
                    ))}
                    {item.selectedObservations?.map((obs, i) => (
                      <p key={i} className="italic">📝 {obs}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-border bg-card space-y-3 safe-bottom">
        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-lg text-muted-foreground">Total</span>
          <span className="text-3xl font-bold text-primary">
            R$ {comanda.total.toFixed(2)}
          </span>
        </div>

        {/* Add items button */}
        {comanda.status !== 'billing' && comanda.items.length > 0 && (
          <Button
            variant="secondary"
            size="touch"
            onClick={onOpenMenu}
            className="w-full gap-2"
          >
            <Plus size={20} />
            Adicionar Itens
          </Button>
        )}

        {/* Send to kitchen */}
        {hasPendingItems && (
          <Button
            variant="default"
            size="touch"
            onClick={sendToKitchen}
            className="w-full gap-2"
          >
            <Send size={20} />
            Enviar para Cozinha ({pendingItems.length})
          </Button>
        )}

        {/* Request bill */}
        {comanda.items.length > 0 && comanda.status !== 'billing' && (
          <Button
            variant="warning"
            size="touch"
            onClick={() => onRequestBill(comanda)}
            className="w-full gap-2"
          >
            <Receipt size={20} />
            Solicitar Conta
          </Button>
        )}

        {/* Close comanda */}
        {comanda.status === 'billing' && (
          <Button
            variant="success"
            size="touch"
            onClick={() => onCloseComanda(comanda)}
            className="w-full gap-2"
          >
            <CheckCircle size={20} />
            Fechar Comanda
          </Button>
        )}
      </div>
    </div>
  );
}
