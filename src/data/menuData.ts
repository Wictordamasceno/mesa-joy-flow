import { Category, MenuItem } from '@/types/restaurant';

export const categories: Category[] = [
  { id: 'entradas', name: 'Entradas', icon: '🥗' },
  { id: 'pratos', name: 'Pratos', icon: '🍽️' },
  { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
  { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
];

export const menuItems: MenuItem[] = [
  // Entradas
  { id: '1', name: 'Bruschetta', price: 28.90, category: 'entradas', description: 'Pão italiano com tomate e manjericão' },
  { id: '2', name: 'Carpaccio', price: 42.90, category: 'entradas', description: 'Fatias finas de carne com rúcula' },
  { id: '3', name: 'Camarão Empanado', price: 54.90, category: 'entradas', description: '8 unidades com molho tártaro' },
  { id: '4', name: 'Bolinho de Bacalhau', price: 36.90, category: 'entradas', description: '6 unidades' },
  
  // Pratos
  { id: '5', name: 'Filé Mignon', price: 89.90, category: 'pratos', description: 'Com arroz, fritas e salada' },
  { id: '6', name: 'Salmão Grelhado', price: 78.90, category: 'pratos', description: 'Com legumes e purê' },
  { id: '7', name: 'Risoto de Funghi', price: 62.90, category: 'pratos', description: 'Arroz arbóreo com cogumelos' },
  { id: '8', name: 'Picanha', price: 94.90, category: 'pratos', description: '400g com acompanhamentos' },
  { id: '9', name: 'Frango Parmegiana', price: 58.90, category: 'pratos', description: 'Com arroz e fritas' },
  
  // Bebidas
  { id: '10', name: 'Refrigerante', price: 8.90, category: 'bebidas', description: 'Lata 350ml' },
  { id: '11', name: 'Suco Natural', price: 12.90, category: 'bebidas', description: 'Laranja, limão ou maracujá' },
  { id: '12', name: 'Água Mineral', price: 6.90, category: 'bebidas', description: '500ml' },
  { id: '13', name: 'Cerveja', price: 14.90, category: 'bebidas', description: 'Long neck 355ml' },
  { id: '14', name: 'Caipirinha', price: 24.90, category: 'bebidas', description: 'Limão, morango ou maracujá' },
  
  // Sobremesas
  { id: '15', name: 'Petit Gateau', price: 32.90, category: 'sobremesas', description: 'Com sorvete de creme' },
  { id: '16', name: 'Cheesecake', price: 28.90, category: 'sobremesas', description: 'Com calda de frutas vermelhas' },
  { id: '17', name: 'Pudim', price: 18.90, category: 'sobremesas', description: 'Tradicional de leite' },
  { id: '18', name: 'Sorvete', price: 16.90, category: 'sobremesas', description: '2 bolas - diversos sabores' },
];
