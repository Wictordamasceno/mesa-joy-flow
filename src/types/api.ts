import type { Table, TableStatus, MenuItem, Extra, OrderItem, Category, Reservation } from "./restaurant";
import type {
  ApiMesa,
  ApiProduto,
  ApiOpcional,
  ApiItemPedido,
  ApiCategoria,
  ApiReserva,
} from "@/services/api";

// ============ Status Mappings ============

export function mapMesaStatus(status: "A" | "O" | "F"): TableStatus {
  switch (status) {
    case "A": return "available";
    case "O": return "occupied";
    case "F": return "billing";
    default: return "available";
  }
}

export function mapProductionStatus(st: "P" | "E" | "R"): OrderItem["status"] {
  switch (st) {
    case "P": return "pending";
    case "E": return "preparing";
    case "R": return "ready";
    default: return "pending";
  }
}

// ============ Converters ============

export function apiMesaToTable(mesa: ApiMesa, reservations: Reservation[] = []): Table {
  return {
    id: mesa.codigo,
    number: mesa.codigo,
    seats: mesa.pessoas || 0,
    status: mapMesaStatus(mesa.satatus),
    comandas: [], // Populated separately from pedido
    openedAt: mesa.dt_abertura ? new Date(mesa.dt_abertura) : undefined,
    reservations,
  };
}

export function apiProdutoToMenuItem(produto: ApiProduto): MenuItem {
  return {
    id: String(produto.cdproduto),
    name: produto.descricao,
    price: produto.base,
    category: String(produto.cdcat),
    description: produto.obs || undefined,
    extras: produto.opcionais?.map(apiOpcionalToExtra) || [],
  };
}

export function apiOpcionalToExtra(opc: ApiOpcional): Extra {
  return {
    id: String(opc.cdopc),
    name: opc.descricao,
    price: opc.valor,
  };
}

export function apiItemToOrderItem(item: ApiItemPedido): OrderItem {
  return {
    id: String(item.id),
    menuItem: {
      id: String(item.cdprod),
      name: item.descricao,
      price: item.unitario,
      category: "",
    },
    quantity: item.qtdeped,
    notes: item.obs || undefined,
    selectedExtras: item.vl_opcional > 0 && item.obs_opcional
      ? [{ id: "opc", name: item.obs_opcional, price: item.vl_opcional }]
      : [],
    selectedObservations: item.obs ? [item.obs] : [],
    status: mapProductionStatus(item.stproducao),
  };
}

export function apiCategoriaToCategory(cat: ApiCategoria): Category {
  return {
    id: String(cat.cdcat),
    name: cat.descricao,
    icon: "📋",
  };
}

export function apiReservaToReservation(reserva: ApiReserva): Reservation {
  const dt = new Date(reserva.data_reserva);
  return {
    id: String(reserva.id),
    customerName: reserva.nome_cliente,
    date: dt,
    time: dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    notes: reserva.obs || undefined,
    createdAt: dt,
  };
}
