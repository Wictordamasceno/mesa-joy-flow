import { Table } from '@/types/restaurant';

export const initialTables: Table[] = [
  { id: 1, number: 1, seats: 2, status: 'available' },
  { id: 2, number: 2, seats: 2, status: 'occupied', openedAt: new Date(Date.now() - 45 * 60000) },
  { id: 3, number: 3, seats: 4, status: 'available' },
  { id: 4, number: 4, seats: 4, status: 'billing', openedAt: new Date(Date.now() - 90 * 60000) },
  { id: 5, number: 5, seats: 6, status: 'occupied', openedAt: new Date(Date.now() - 30 * 60000) },
  { id: 6, number: 6, seats: 6, status: 'available' },
  { id: 7, number: 7, seats: 4, status: 'available' },
  { id: 8, number: 8, seats: 8, status: 'occupied', openedAt: new Date(Date.now() - 60 * 60000) },
  { id: 9, number: 9, seats: 2, status: 'available' },
  { id: 10, number: 10, seats: 4, status: 'available' },
  { id: 11, number: 11, seats: 6, status: 'available' },
  { id: 12, number: 12, seats: 8, status: 'available' },
];
