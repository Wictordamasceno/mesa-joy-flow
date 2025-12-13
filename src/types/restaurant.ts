export type TableStatus = 'available' | 'occupied' | 'billing' | 'reserved';

export interface Table {
  id: number;
  number: number;
  seats: number;
  status: TableStatus;
  comandas: Comanda[];
  openedAt?: Date;
  reservedAt?: Date;
  reservedFor?: string;
}

export interface Comanda {
  id: string;
  tableId: number;
  number: number;
  customerName?: string;
  items: OrderItem[];
  status: 'open' | 'sent' | 'billing' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  total: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  extras?: Extra[];
  observations?: string[];
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  selectedExtras?: Extra[];
  selectedObservations?: string[];
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
