export type TableStatus = 'available' | 'occupied' | 'billing';

export interface Table {
  id: number;
  number: number;
  seats: number;
  status: TableStatus;
  currentOrderId?: string;
  openedAt?: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  status: 'open' | 'sent' | 'billing' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  total: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
