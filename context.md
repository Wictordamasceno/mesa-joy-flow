# ComandaPro — Contexto Técnico Completo

## 1. Visão Geral

**ComandaPro** é um sistema de gerenciamento de mesas e comandas para restaurantes, desenvolvido como aplicação mobile-first pela **Damatech Soluções**. O app permite que atendentes gerenciem mesas, comandas, pedidos e reservas em tempo real.

- **App ID:** `com.damatech.comanda`
- **Nome:** ComandaPro
- **Plataformas:** Web (PWA-ready), Android (Capacitor 8.x), iOS (Capacitor 8.x)
- **URL publicada:** https://mesa-joy-flow.lovable.app

---

## 2. Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | React 18.3 + TypeScript 5.8 |
| **Build** | Vite 5.4 |
| **Estilização** | Tailwind CSS 3.4 + shadcn/ui (Radix primitives) |
| **Fonte** | Plus Jakarta Sans (Google Fonts) |
| **Roteamento** | React Router DOM 6.30 |
| **Estado servidor** | TanStack React Query 5.83 |
| **Formulários** | React Hook Form 7.61 + Zod 3.25 |
| **Toasts** | Sonner 1.7 + Radix Toast |
| **Datas** | date-fns 3.6 |
| **Ícones** | Lucide React 0.462 |
| **Mobile nativo** | Capacitor 8.x (Android + iOS) |
| **Backend** | Lovable Cloud (Supabase) — ainda não implementado |

---

## 3. Estrutura de Arquivos

```
src/
├── App.tsx                    # Rotas, splash screen, auth simulada
├── main.tsx                   # Entry point
├── index.css                  # Design tokens (CSS variables) + utilities
├── pages/
│   ├── Index.tsx              # Página principal — toda lógica de negócio
│   ├── Login.tsx              # Tela de login (nome do atendente)
│   └── NotFound.tsx           # 404
├── types/
│   └── restaurant.ts          # Todas as interfaces/types
├── data/
│   ├── menuData.ts            # Cardápio mock (categorias + itens)
│   └── tablesData.ts          # 12 mesas iniciais
├── components/
│   ├── Header.tsx             # Header sticky com filtros por status
│   ├── TablesGrid.tsx         # Grid de cards de mesas
│   ├── TableCard.tsx          # Card individual de mesa
│   ├── TableActionsModal.tsx  # Bottom sheet de ações da mesa
│   ├── ComandaSelector.tsx    # Seletor de comandas da mesa
│   ├── ComandaDetailModal.tsx # Detalhe da comanda (itens, total, billing)
│   ├── CreateComandaModal.tsx # Criar nova comanda
│   ├── TransferComandasModal.tsx # Transferir comandas entre mesas
│   ├── MenuSearchModal.tsx    # Busca e seleção de itens do cardápio
│   ├── ExtrasModal.tsx        # Seleção de extras/observações do item
│   ├── OrderPanel.tsx         # Painel de pedido (legacy, não usado no fluxo principal)
│   ├── OrderItemRow.tsx       # Linha de item no pedido
│   ├── CategoryTabs.tsx       # Tabs de categorias do cardápio
│   ├── MenuItemCard.tsx       # Card de item do cardápio
│   ├── ReserveTableModal.tsx  # Criar reserva
│   ├── ReservationsModal.tsx  # Listar/gerenciar reservas
│   ├── SplashScreen.tsx       # Splash screen animada
│   └── NavLink.tsx            # Link de navegação
├── components/ui/             # shadcn/ui components (40+ componentes)
├── hooks/
│   ├── use-toast.ts           # Hook de toast
│   └── use-mobile.tsx         # Detecção mobile
├── integrations/supabase/     # Client e types (auto-gerados)
├── assets/
│   ├── comandapro-icon.png    # Ícone do app
│   ├── damatech-logo.png      # Logo Damatech
│   └── damatech-logo.svg      # Logo SVG
└── lib/
    └── utils.ts               # cn() utility
```

---

## 4. Modelos de Dados (TypeScript)

```typescript
type TableStatus = 'available' | 'occupied' | 'billing' | 'reserved';

interface Table {
  id: number;
  number: number;
  seats: number;
  status: TableStatus;
  comandas: Comanda[];
  openedAt?: Date;
  reservations: Reservation[];
}

interface Comanda {
  id: string;
  tableId: number;
  number: number;           // Sequencial dentro da mesa
  customerName?: string;
  items: OrderItem[];
  status: 'open' | 'sent' | 'billing' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  total: number;
}

interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  selectedExtras?: Extra[];
  selectedObservations?: string[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  extras?: Extra[];
  observations?: string[];
}

interface Extra {
  id: string;
  name: string;
  price: number;
}

interface Reservation {
  id: string;
  customerName: string;
  date: Date;
  time: string;
  notes?: string;
  createdAt: Date;
}

interface Category {
  id: string;
  name: string;
  icon: string;   // Emoji
}
```

---

## 5. Lógica de Negócio (centralizada em `src/pages/Index.tsx`)

### 5.1 Ciclo de Vida das Mesas

```
available → [Abrir Mesa] → occupied → [Solicitar Conta] → billing → [Fechar] → available
available → [Reservar] → reserved → [Abrir Mesa] → occupied (remove reserva do dia)
```

### 5.2 Ciclo de Vida das Comandas

```
Criar comanda → open → (adicionar itens) → sent → [Solicitar Conta] → billing → [Fechar Comanda] → closed
```

- **Quando TODAS as comandas de uma mesa são `billing` ou `closed`**, a mesa muda para `billing`.
- **Quando TODAS as comandas são `closed`**, a mesa é liberada (`available`) e as comandas são limpas.

### 5.3 Transferência de Comandas

- Comandas selecionadas são movidas da mesa origem para a mesa destino.
- **Renumeração automática** na mesa destino: `maxNumberInTarget + index + 1`
- **Renumeração das remanescentes** na mesa origem: `index + 1`
- Se a mesa origem fica sem comandas → volta para `available`.
- A mesa destino se torna `occupied` se ainda não era.

### 5.4 Cálculo de Billing (Conta)

Exibido no `ComandaDetailModal` quando `comanda.status === 'billing'`:

```
Consumo (subtotal dos itens + extras)
+ Couvert Artístico (valor fixo, configurável — atualmente R$12,00)
+ Taxa de Serviço (10% sobre o CONSUMO apenas, não sobre couvert)
─────────────────────────────
= Total com Taxa de Serviço
```

Também exibe o total SEM taxa de serviço para transparência.

> **Nota:** Os valores de couvert e taxa de serviço são hardcoded com TODOs para backend.

### 5.5 Cálculo de Total da Comanda

```typescript
total = items.reduce((sum, item) => {
  const extrasSum = item.selectedExtras?.reduce((s, e) => s + e.price, 0) || 0;
  return sum + (item.menuItem.price + extrasSum) * item.quantity;
}, 0);
```

### 5.6 Status de Exibição da Mesa (display vs. real)

O `getDisplayStatus` no `Index.tsx` e `getTableDisplayStatus` no `TableCard.tsx` determinam o status visual:
- Se tem comanda em `billing` → mostra `billing`
- Se `occupied` → mostra `occupied`
- Se tem reserva para hoje (`isToday`) → mostra `reserved`
- Caso contrário → `available`

### 5.7 Reservas

- Armazenadas por mesa em `table.reservations[]`.
- Ao abrir uma mesa com reserva do dia, a reserva é removida automaticamente.
- O `ReservationsModal` lista todas as reservas de todas as mesas.
- Podem ser canceladas ou convertidas em abertura de mesa.

---

## 6. Design System

### 6.1 Paleta de Cores (HSL — apenas dark mode)

| Token | HSL | Uso |
|-------|-----|-----|
| `--background` | `165 35% 8%` | Fundo principal (dark teal) |
| `--foreground` | `40 30% 92%` | Texto principal (cream) |
| `--card` | `165 30% 12%` | Cards e superfícies |
| `--primary` | `168 70% 50%` | Turquesa/Teal — ações principais |
| `--secondary` | `165 25% 18%` | Superfícies secundárias |
| `--muted` | `165 20% 16%` | Fundos sutis |
| `--muted-foreground` | `165 15% 50%` | Texto secundário |
| `--accent` | `40 45% 90%` | Cream/Beige — destaques |
| `--destructive` | `0 72% 51%` | Vermelho — ações destrutivas |
| `--success` | `160 65% 40%` | Verde — sucesso |
| `--warning` | `45 93% 47%` | Amarelo — alertas |
| `--border` | `165 20% 20%` | Bordas |

### 6.2 Cores de Status das Mesas

| Token | HSL | Status |
|-------|-----|--------|
| `--table-available` | `160 65% 40%` | Verde — Disponível |
| `--table-occupied` | `168 70% 50%` | Turquesa — Ocupada |
| `--table-billing` | `45 93% 55%` | Amarelo — Conta |
| `--table-reserved` | `200 60% 50%` | Azul — Reservada |

### 6.3 Tipografia

- **Família:** Plus Jakarta Sans
- Importada via Google Fonts no `index.css`
- Configurada no `tailwind.config.ts` como `fontFamily.sans`

### 6.4 Utilities Customizadas (index.css)

| Classe | Função |
|--------|--------|
| `.glass` | `bg-card/80 backdrop-blur-xl` |
| `.glow-primary` | Shadow turquesa |
| `.glow-success` | Shadow verde |
| `.active-scale` | `active:scale-95` feedback visual |
| `.touch-target` | `min-h-[44px] min-w-[44px]` |
| `.touch-target-lg` | `min-h-[56px] min-w-[56px]` |
| `.safe-top` | Padding safe area top |
| `.safe-bottom` | Padding safe area bottom |
| `.scrollbar-hide` | Esconde scrollbar mantendo funcionalidade |
| `.animate-slide-up` | Animação bottom sheet |
| `.animate-fade-in` | Fade in com scale |
| `.animate-bounce-in` | Bounce entrance |
| `.animate-pulse-soft` | Pulse suave (status dots) |

### 6.5 Raio de Borda

`--radius: 1rem` — todos os componentes usam `rounded-2xl` ou derivados.

---

## 7. Fluxo de Navegação

```
[Splash Screen (2.5s)]
       ↓
[Login — Nome do Atendente]
       ↓ (localStorage: attendantName)
[Tela Principal — Grid de Mesas]
       ↓ (toque em mesa)
[TableActionsModal — Bottom Sheet]
   ├─ Abrir Mesa → CreateComandaModal → ComandaDetailModal → MenuSearchModal
   ├─ Reservar → ReserveTableModal
   ├─ Cancelar Reserva
   ├─ Adicionar Comanda → CreateComandaModal
   ├─ Gerenciar Comandas → ComandaSelector → ComandaDetailModal
   ├─ Transferir Comandas → TransferComandasModal
   └─ Fechar Mesa
```

### Modais como Fullscreen (Mobile-first)
Todos os modais usam `fixed inset-0 z-50 bg-background` — comportam-se como telas fullscreen no mobile, com `animate-slide-up`.

---

## 8. Autenticação (Atual — Simulada)

- Login por nome do atendente → salvo em `localStorage("attendantName")`
- Verificação no `App.tsx` via `IndexWithLogout` wrapper
- Campo opcional de URL do servidor ERP em `Login.tsx` → `localStorage("hostUrl")`
- **Sem autenticação real** — sem Supabase Auth implementado
- Logout limpa o `localStorage` e redireciona para `/login`

---

## 9. Dados Mock

### 9.1 Mesas (12 mesas)

| IDs | Lugares |
|-----|---------|
| 1, 4, 7, 9, 11 | 4 lugares |
| 2, 6, 10 | 2 lugares |
| 3, 8 | 6 lugares |
| 5, 12 | 8 lugares |

Todas iniciam com `status: 'available'`, `comandas: []`, `reservations: []`.

### 9.2 Cardápio (18 itens, 4 categorias)

| Categoria | Emoji | Itens |
|-----------|-------|-------|
| Entradas | 🥗 | Bruschetta (R$28,90), Carpaccio (R$42,90), Camarão Empanado (R$54,90), Bolinho de Bacalhau (R$36,90) |
| Pratos | 🍽️ | Filé Mignon (R$89,90), Salmão Grelhado (R$78,90), Risoto de Funghi (R$62,90), Picanha (R$94,90), Frango Parmegiana (R$58,90) |
| Bebidas | 🍺 | Refrigerante (R$8,90), Suco Natural (R$12,90), Água Mineral (R$6,90), Cerveja (R$14,90), Caipirinha (R$24,90) |
| Sobremesas | 🍰 | Petit Gateau (R$32,90), Cheesecake (R$28,90), Pudim (R$18,90), Sorvete (R$16,90) |

Itens podem ter:
- **Extras** com preço adicional (ex: Queijo parmesão +R$5,00)
- **Observações** predefinidas (ex: "Mal passado", "Sem alho")

---

## 10. Capacitor Config

```typescript
const config: CapacitorConfig = {
  appId: 'com.damatech.comanda',
  appName: 'ComandaPro',
  webDir: 'dist'
};
```

- Android: `android/` com manifesto, ícones, splash screens
- iOS: `ios/` com Xcode project, assets, SPM

---

## 11. Componentes de UI Customizados (shadcn/ui)

O `Button` component tem variantes extras:
- `variant="warning"` — amarelo (billing)
- `variant="success"` — verde (confirmar)
- `size="touch"` — altura mínima 56px para mobile

---

## 12. Estado Atual e Pendências

### ✅ Implementado
- [x] Grid de mesas com filtros por status
- [x] Abrir/fechar mesas
- [x] CRUD de comandas (criar, adicionar itens, fechar)
- [x] Transferência de comandas entre mesas com renumeração
- [x] Sistema de reservas (criar, cancelar, listar, converter em abertura)
- [x] Cardápio com busca, extras e observações
- [x] Cálculo de billing (consumo + couvert + taxa serviço)
- [x] Login simulado por nome
- [x] Splash screen animada
- [x] Design system dark mode completo
- [x] Safe areas para mobile nativo
- [x] Capacitor configurado (Android + iOS)

### ❌ Pendente
- [ ] **Persistência de dados** no banco (Lovable Cloud/Supabase)
- [ ] **Autenticação real** com email/senha
- [ ] **Tela da cozinha** (visualizar pedidos pendentes em tempo real)
- [ ] **Cardápio dinâmico** (CRUD de itens/categorias pelo admin)
- [ ] **Relatórios** (vendas, mesas mais usadas, horários de pico)
- [ ] **Impressão de comanda/conta**
- [ ] **Múltiplos garçons** com controle de quem atendeu
- [ ] **Configurações** (couvert, taxa de serviço, número de mesas)
- [ ] **Notificações push** quando pedido fica pronto
- [ ] **Modo offline** com sincronização

---

## 13. Regras de Desenvolvimento

1. **Mobile-first:** Todas as interfaces devem funcionar em telas ≥320px.
2. **Touch targets:** Mínimo 44x44px para botões interativos.
3. **Bottom sheets:** Modais usam pattern fullscreen com `animate-slide-up`.
4. **Tokens semânticos:** NUNCA usar cores diretas — sempre usar variáveis CSS via Tailwind.
5. **Sem light mode:** O app é exclusivamente dark mode.
6. **IDs temporários:** Gerados com `Date.now()` (ex: `comanda-${Date.now()}`).
7. **Estado local:** Tudo em `useState` no `Index.tsx` — sem estado global.
8. **Imutabilidade:** Updates via `map()` e spread — nunca mutação direta.
