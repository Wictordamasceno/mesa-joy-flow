

# Integração do ComandaPro com API REST do ERP

## Resumo

Substituir toda a lógica local (dados mockados, estado em memória) pela comunicação com a API REST rodando no servidor ERP local. O app passará a ser um cliente real do backend.

## Mapeamento API ↔ App Atual

```text
┌─────────────────────┬──────────────────────────────────┐
│ Funcionalidade      │ Endpoint da API                  │
├─────────────────────┼──────────────────────────────────┤
│ Login               │ POST /api/auth/login             │
│ Dados do operador   │ GET  /api/auth/me                │
│ Listar mesas        │ GET  /api/mesas/                 │
│ Abrir mesa          │ POST /api/mesas/{cod}/abrir      │
│ Fechar mesa (conta) │ POST /api/mesas/{cod}/fechar     │
│ Liberar mesa        │ POST /api/mesas/{cod}/liberar    │
│ Pedido da mesa      │ GET  /api/pedidos/mesa/{cod}     │
│ Adicionar item      │ POST /api/pedidos/{id}/itens     │
│ Editar item         │ PATCH /api/pedidos/{id}/itens/{i}│
│ Remover item        │ DELETE /api/pedidos/{id}/itens/{i│
│ Total do pedido     │ GET  /api/pedidos/{id}/total     │
│ Cardápio            │ GET  /api/produtos/              │
│ Categorias          │ GET  /api/produtos/categorias    │
│ Listar reservas     │ GET  /api/reservas/              │
│ Criar reserva       │ POST /api/reservas/              │
│ Cancelar reserva    │ DELETE /api/reservas/{id}        │
│ Converter reserva   │ POST /api/reservas/{id}/converter│
│ Verificar licença   │ GET  /api/licenca/check          │
│ Health check        │ GET  /health                     │
└─────────────────────┴──────────────────────────────────┘
```

## Mudanças principais

### 1. Camada de serviço da API (`src/services/api.ts`)
- Cliente HTTP com base URL configurável (já salva no `localStorage` como `hostUrl`)
- Interceptor para injetar Bearer Token em todas as requisições
- Tratamento de erros (401 → redireciona login, 429 → mensagem rate limit)
- Tipagens para os modelos da API (mesa, pedido, produto, reserva)

### 2. Tipos adaptados (`src/types/api.ts`)
- Novos tipos mapeando os campos da API (ex: `codigo`, `cdprod`, `stproducao`)
- Funções de conversão API → tipos do app (ex: status `"A"/"O"/"F"` → `"available"/"occupied"/"billing"`)

### 3. Login real (`src/pages/Login.tsx`)
- Adicionar campo de senha
- Chamar `POST /api/auth/login` com nome + senha
- Armazenar JWT token e dados do operador (`cdvend`, `nome`, `perfil`)
- Validar servidor com `/health` antes do login

### 4. React Query hooks (`src/hooks/`)
- `useAuth` — login, logout, token refresh, dados do operador
- `useMesas` — listar mesas com polling (atualização periódica)
- `usePedido` — buscar/manipular pedido da mesa
- `useProdutos` — cardápio e categorias (cache longo)
- `useReservas` — CRUD de reservas

### 5. Index.tsx refatorado
- Substituir `useState<Table[]>(initialTables)` por `useMesas()`
- Ações de mesa (abrir, fechar, liberar) chamam API em vez de state local
- Adição de itens chama `POST /api/pedidos/{cdpedido}/itens`
- Conceito de "comanda" mapeado para `numcomanda` nos itens do pedido

### 6. Cardápio dinâmico
- Remover `src/data/menuData.ts` (dados mockados)
- Carregar categorias de `GET /api/produtos/categorias`
- Carregar produtos de `GET /api/produtos/?cdcat=X`
- Opcionais vêm do campo `opcionais[]` de cada produto

### 7. Mapeamento de conceitos

| App atual | API ERP |
|-----------|---------|
| `Table.status: 'available'` | `satatus: "A"` |
| `Table.status: 'occupied'` | `satatus: "O"` |
| `Table.status: 'billing'` | `satatus: "F"` |
| `Comanda.number` | `numcomanda` (campo nos itens) |
| `MenuItem.id` | `cdproduto` |
| `MenuItem.extras` | `opcionais[]` |
| `OrderItem.status: 'pending'` | `stproducao: "P"` |
| `OrderItem.status: 'preparing'` | `stproducao: "E"` |
| `OrderItem.status: 'ready'` | `stproducao: "R"` |

### 8. Licença
- Verificar `GET /api/licenca/check` no startup
- Bloquear uso se `permitido: false`

## Arquivos a criar/modificar

| Ação | Arquivo |
|------|---------|
| Criar | `src/services/api.ts` — cliente HTTP + interceptors |
| Criar | `src/types/api.ts` — tipos da API + conversores |
| Criar | `src/hooks/useAuth.ts` |
| Criar | `src/hooks/useMesas.ts` |
| Criar | `src/hooks/usePedido.ts` |
| Criar | `src/hooks/useProdutos.ts` |
| Criar | `src/hooks/useReservas.ts` |
| Modificar | `src/pages/Login.tsx` — campo senha + chamada API |
| Modificar | `src/pages/Index.tsx` — usar hooks em vez de state local |
| Modificar | `src/components/MenuSearchModal.tsx` — cardápio dinâmico |
| Modificar | `src/App.tsx` — auth com token + check licença |
| Remover dados | `src/data/menuData.ts` — substituído pela API |
| Remover dados | `src/data/tablesData.ts` — substituído pela API |

## Observação importante

A API não tem endpoint de transferência de comandas entre mesas. Essa funcionalidade precisará ser mantida como lógica local ou discutida para inclusão futura na API.

