import { Category, MenuItem } from '@/types/restaurant';

export const categories: Category[] = [
  { id: 'entradas', name: 'Entradas', icon: '🥗' },
  { id: 'pratos', name: 'Pratos', icon: '🍽️' },
  { id: 'bebidas', name: 'Bebidas', icon: '🍺' },
  { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
];

export const menuItems: MenuItem[] = [
  // Entradas
  { 
    id: '1', 
    name: 'Bruschetta', 
    price: 28.90, 
    category: 'entradas', 
    description: 'Pão italiano com tomate e manjericão',
    extras: [
      { id: 'e1', name: 'Queijo parmesão', price: 5.00 },
      { id: 'e2', name: 'Presunto parma', price: 8.00 },
    ],
    observations: ['Sem alho', 'Bem tostado', 'Pouco azeite']
  },
  { 
    id: '2', 
    name: 'Carpaccio', 
    price: 42.90, 
    category: 'entradas', 
    description: 'Fatias finas de carne com rúcula',
    extras: [
      { id: 'e3', name: 'Alcaparras extra', price: 4.00 },
      { id: 'e4', name: 'Lascas de parmesão', price: 6.00 },
    ],
    observations: ['Sem mostarda', 'Mais rúcula', 'Menos azeite']
  },
  { id: '3', name: 'Camarão Empanado', price: 54.90, category: 'entradas', description: '8 unidades com molho tártaro' },
  { id: '4', name: 'Bolinho de Bacalhau', price: 36.90, category: 'entradas', description: '6 unidades' },
  
  // Pratos
  { 
    id: '5', 
    name: 'Filé Mignon', 
    price: 89.90, 
    category: 'pratos', 
    description: 'Com arroz, fritas e salada',
    extras: [
      { id: 'e5', name: 'Molho madeira', price: 8.00 },
      { id: 'e6', name: 'Bacon extra', price: 10.00 },
      { id: 'e7', name: 'Ovo frito', price: 5.00 },
    ],
    observations: ['Mal passado', 'Ao ponto', 'Bem passado', 'Sem salada', 'Arroz à parte']
  },
  { 
    id: '6', 
    name: 'Salmão Grelhado', 
    price: 78.90, 
    category: 'pratos', 
    description: 'Com legumes e purê',
    observations: ['Sem pele', 'Bem passado', 'Menos sal']
  },
  { id: '7', name: 'Risoto de Funghi', price: 62.90, category: 'pratos', description: 'Arroz arbóreo com cogumelos' },
  { 
    id: '8', 
    name: 'Picanha', 
    price: 94.90, 
    category: 'pratos', 
    description: '400g com acompanhamentos',
    extras: [
      { id: 'e8', name: 'Farofa especial', price: 8.00 },
      { id: 'e9', name: 'Vinagrete', price: 5.00 },
    ],
    observations: ['Mal passada', 'Ao ponto', 'Bem passada', 'Com gordura', 'Sem gordura']
  },
  { id: '9', name: 'Frango Parmegiana', price: 58.90, category: 'pratos', description: 'Com arroz e fritas' },
  
  // Bebidas
  { 
    id: '10', 
    name: 'Refrigerante', 
    price: 8.90, 
    category: 'bebidas', 
    description: 'Lata 350ml',
    observations: ['Com gelo', 'Sem gelo', 'Copo extra']
  },
  { 
    id: '11', 
    name: 'Suco Natural', 
    price: 12.90, 
    category: 'bebidas', 
    description: 'Laranja, limão ou maracujá',
    observations: ['Sem açúcar', 'Pouco açúcar', 'Com gelo', 'Sem gelo']
  },
  { id: '12', name: 'Água Mineral', price: 6.90, category: 'bebidas', description: '500ml' },
  { id: '13', name: 'Cerveja', price: 14.90, category: 'bebidas', description: 'Long neck 355ml' },
  { 
    id: '14', 
    name: 'Caipirinha', 
    price: 24.90, 
    category: 'bebidas', 
    description: 'Limão, morango ou maracujá',
    extras: [
      { id: 'e10', name: 'Dose extra', price: 12.00 },
    ],
    observations: ['Menos açúcar', 'Mais limão', 'Com vodka']
  },
  
  // Sobremesas
  { 
    id: '15', 
    name: 'Petit Gateau', 
    price: 32.90, 
    category: 'sobremesas', 
    description: 'Com sorvete de creme',
    extras: [
      { id: 'e11', name: 'Bola de sorvete extra', price: 8.00 },
      { id: 'e12', name: 'Calda de chocolate', price: 5.00 },
    ],
    observations: ['Sem sorvete', 'Sorvete de chocolate']
  },
  { id: '16', name: 'Cheesecake', price: 28.90, category: 'sobremesas', description: 'Com calda de frutas vermelhas' },
  { id: '17', name: 'Pudim', price: 18.90, category: 'sobremesas', description: 'Tradicional de leite' },
  { id: '18', name: 'Sorvete', price: 16.90, category: 'sobremesas', description: '2 bolas - diversos sabores' },
];
