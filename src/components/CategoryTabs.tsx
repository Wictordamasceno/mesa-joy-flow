import { Category } from '@/types/restaurant';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 py-1 scroll-smooth touch-pan-x" style={{ WebkitOverflowScrolling: 'touch' }}>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 rounded-full whitespace-nowrap',
            'transition-all duration-150 touch-manipulation active-scale',
            'text-xs font-semibold min-h-[40px]',
            activeCategory === category.id
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          <span className="text-base">{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
