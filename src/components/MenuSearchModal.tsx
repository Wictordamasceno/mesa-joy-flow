import { useState, useMemo } from 'react';
import { MenuItem, Extra } from '@/types/restaurant';
import { useProdutos } from '@/hooks/useProdutos';
import { CategoryTabs } from './CategoryTabs';
import { MenuItemCard } from './MenuItemCard';
import { ExtrasModal } from './ExtrasModal';
import { X, Search, Loader2 } from 'lucide-react';

interface MenuSearchModalProps {
  onClose: () => void;
  onAddItem: (item: MenuItem, extras: Extra[], observations: string, quantity: number) => void;
}

export function MenuSearchModal({ onClose, onAddItem }: MenuSearchModalProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const cdcat = activeCategory !== 'all' ? Number(activeCategory) : undefined;
  const { categories, products, isLoadingCategories, isLoadingProducts } = useProdutos(cdcat, searchQuery || undefined);

  const allCategories = useMemo(() => {
    return [{ id: 'all', name: 'Todos', icon: '📋' }, ...categories];
  }, [categories]);

  const filteredItems = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const handleItemClick = (item: MenuItem) => {
    if (item.extras?.length) {
      setSelectedItem(item);
    } else {
      onAddItem(item, [], '', 1);
    }
  };

  const handleExtrasConfirm = (extras: Extra[], observations: string, quantity: number) => {
    if (selectedItem) {
      onAddItem(selectedItem, extras, observations, quantity);
      setSelectedItem(null);
    }
  };

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
          <h1 className="text-xl font-bold text-foreground">Cardápio</h1>
          <span className="text-sm text-muted-foreground">Consulta de produtos</span>
        </div>
      </header>

      {/* Search */}
      <div className="px-4 py-3 bg-card border-b border-border">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-border bg-card/50">
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CategoryTabs
            categories={allCategories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search size={48} className="opacity-30 mb-4" />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <MenuItemCard 
                item={item} 
                onAdd={() => handleItemClick(item)}
                showExtrasIndicator
              />
            </div>
          ))
        )}
      </div>

      {/* Extras Modal */}
      {selectedItem && (
        <ExtrasModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onConfirm={handleExtrasConfirm}
        />
      )}
    </div>
  );
}
