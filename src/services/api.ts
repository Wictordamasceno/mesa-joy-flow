const getBaseUrl = (): string => {
  const hostUrl = localStorage.getItem("hostUrl");
  if (!hostUrl) throw new Error("Servidor não configurado. Acesse as configurações.");
  return hostUrl.replace(/\/$/, "");
};

const getToken = (): string | null => {
  return localStorage.getItem("authToken");
};

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, params } = options;
  const baseUrl = getBaseUrl();

  let url = `${baseUrl}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    let errorData: unknown = null;
    try {
      errorData = await res.json();
    } catch {
      errorData = null;
    }

    const message =
      (errorData as any)?.detail ||
      (errorData as any)?.message ||
      "Sessão expirada. Faça login novamente.";

    if (path !== "/api/auth/login") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("attendantName");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    throw new ApiError(401, message, errorData);
  }

  if (res.status === 429) {
    throw new ApiError(429, "Muitas requisições. Aguarde um momento.");
  }

  if (!res.ok) {
    let errorData: unknown;
    try {
      errorData = await res.json();
    } catch {
      errorData = null;
    }
    const message = (errorData as any)?.detail || (errorData as any)?.message || `Erro ${res.status}`;
    throw new ApiError(res.status, message, errorData);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ============ Auth ============

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: {
    cdvend: number;
    nome: string;
    perfil: "garcom" | "admin";
  };
}

export interface AuthUser {
  sub: string;
  nome: string;
  perfil: "garcom" | "admin";
  cdvend: number;
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>("/api/auth/login", { method: "POST", body: data }),
  me: () => request<AuthUser>("/api/auth/me"),
};

// ============ Health & License ============

export interface HealthResponse {
  status: "ok" | "degraded" | "not_configured";
  database: string;
}

export interface LicenseResponse {
  permitido: boolean;
  motivo: string | null;
  expiracao: string;
  dispositivos: { ativo: number; limite: number };
  cache: boolean;
}

export const healthApi = {
  check: () => request<HealthResponse>("/health"),
};

export const licenseApi = {
  check: () => request<LicenseResponse>("/api/licenca/check"),
};

// ============ Capabilities ============

export interface Capabilities {
  modo_comanda: "mesa" | "comanda";
  features: {
    usar_comandas: boolean;
    abrir_comanda: boolean;
    fechar_comanda_individual: boolean;
    transferir_comanda: boolean;
    fechar_mesa_direto: boolean;
  };
}

export const configApi = {
  capabilities: () => request<Capabilities>("/api/config/capabilities"),
};

// ============ Mesas ============

export interface ApiMesa {
  codigo: number;
  nome: string;
  pedido: number | null;
  cdvend: number | null;
  satatus: "A" | "O" | "F";
  pessoas: number | null;
  obs: string | null;
  dt_abertura: string | null;
}

export interface AbrirMesaRequest {
  cdvend: number;
  pessoas?: number;
  obs?: string;
}

export interface AbrirMesaResponse {
  message: string;
  cdpedido: number;
}

export interface TransferirMesaRequest {
  mesa_destino: number;
  comandas?: number[];
}

export interface TransferirMesaResponse {
  message: string;
  mesa_origem_liberada?: boolean;
}

export const mesasApi = {
  list: () => request<ApiMesa[]>("/api/mesas/"),
  get: (codigo: number) => request<ApiMesa>(`/api/mesas/${codigo}`),
  abrir: (codigo: number, data: AbrirMesaRequest) =>
    request<AbrirMesaResponse>(`/api/mesas/${codigo}/abrir`, { method: "POST", body: data }),
  fechar: (codigo: number, data: { cdvend: number }) =>
    request<{ message: string }>(`/api/mesas/${codigo}/fechar`, { method: "POST", body: data }),
  liberar: (codigo: number) =>
    request<{ message: string }>(`/api/mesas/${codigo}/liberar`, { method: "POST" }),
  transferir: (codigo: number, data: TransferirMesaRequest) =>
    request<TransferirMesaResponse>(`/api/mesas/${codigo}/transferir`, { method: "POST", body: data }),
};

// ============ Pedidos ============

export interface ApiItemPedido {
  id: number;
  cdpedido: number;
  cdprod: number;
  descricao: string;
  qtdeped: number;
  unitario: number;
  vl_opcional: number;
  obs: string | null;
  obs_opcional: string | null;
  numcomanda: number;
  ordem: number;
  stproducao: "P" | "E" | "R" | "T";
}

export interface ApiPedido {
  cdpedido: number;
  mesa: number;
  total: number;
  status: string;
  cdvend: number;
  dataped: string;
  itens: ApiItemPedido[];
}

export interface ApiPedidoTotal {
  subtotal: number;
  total_opcionais: number;
  total: number;
}

export interface AddItemRequest {
  cdprod: number;
  qtdeped: number;
  obs?: string;
  cdopc?: number;
  obs_opcional?: string;
  vl_opcional?: number;
  numcomanda?: number;
}

export interface UpdateItemRequest {
  qtdeped?: number;
  obs?: string;
}

export const pedidosApi = {
  getByMesa: (mesaCodigo: number) =>
    request<ApiPedido>(`/api/pedidos/mesa/${mesaCodigo}`),
  addItem: (cdpedido: number, data: AddItemRequest) =>
    request<ApiItemPedido>(`/api/pedidos/${cdpedido}/itens`, { method: "POST", body: data }),
  updateItem: (cdpedido: number, itemId: number, data: UpdateItemRequest) =>
    request<ApiItemPedido>(`/api/pedidos/${cdpedido}/itens/${itemId}`, { method: "PATCH", body: data }),
  removeItem: (cdpedido: number, itemId: number) =>
    request<void>(`/api/pedidos/${cdpedido}/itens/${itemId}`, { method: "DELETE" }),
  getTotal: (cdpedido: number, numcomanda?: number) =>
    request<ApiPedidoTotal>(`/api/pedidos/${cdpedido}/total`, {
      params: numcomanda !== undefined ? { numcomanda } : undefined,
    }),
  getItems: (cdpedido: number, numcomanda?: number) =>
    request<ApiItemPedido[]>(`/api/pedidos/${cdpedido}/itens`, {
      params: numcomanda !== undefined ? { numcomanda } : undefined,
    }),
};

// ============ Comandas ============

export interface ApiComanda {
  numcomanda: number;
  nome: string | null;
  pessoas: number | null;
  status: "A" | "F";
  total: number;
}

export interface CreateComandaRequest {
  nome?: string;
  pessoas?: number;
}

export interface CreateComandaResponse {
  numcomanda: number;
}

export interface FecharComandaRequest {
  numcomanda: number;
}

export interface FecharComandaResponse {
  message: string;
  mesa_liberada: boolean;
  comandas_abertas_restantes?: number;
}

export const comandasApi = {
  list: (cdpedido: number) =>
    request<ApiComanda[]>(`/api/pedidos/${cdpedido}/comandas`),
  create: (cdpedido: number, data: CreateComandaRequest) =>
    request<CreateComandaResponse>(`/api/pedidos/${cdpedido}/comandas`, { method: "POST", body: data }),
  fechar: (cdpedido: number, data: FecharComandaRequest) =>
    request<FecharComandaResponse>(`/api/pedidos/${cdpedido}/fechar-comanda`, { method: "POST", body: data }),
};

// ============ Produtos ============

export interface ApiOpcional {
  cdopc: number;
  descricao: string;
  valor: number;
  obs_opcional: string | null;
}

export interface ApiProduto {
  cdproduto: number;
  descricao: string;
  base: number;
  cdcat: number;
  categoria: string;
  unvenda: number;
  obs: string | null;
  opcionais: ApiOpcional[];
}

export interface ApiCategoria {
  cdcat: number;
  descricao: string;
  ativo: string;
}

export const produtosApi = {
  list: (params?: { cdcat?: number; busca?: string }) =>
    request<ApiProduto[]>("/api/produtos/", { params: params as Record<string, string | number | undefined> }),
  categorias: () => request<ApiCategoria[]>("/api/produtos/categorias"),
  get: (cdproduto: number) => request<ApiProduto>(`/api/produtos/${cdproduto}`),
};

// ============ Reservas ============

export interface ApiReserva {
  id: number;
  nome_cliente: string;
  data_reserva: string;
  pessoas: number;
  mesa_codigo: number | null;
  obs: string | null;
  cdvend: number;
  status?: string;
}

export interface CreateReservaRequest {
  nome_cliente: string;
  data_reserva: string;
  pessoas: number;
  mesa_codigo?: number;
  obs?: string;
  cdvend: number;
}

export interface ConvertReservaResponse {
  message: string;
  mesa_codigo: number;
  nome_cliente: string;
  pessoas: number;
}

export const reservasApi = {
  list: (params?: { data?: string; mesa_codigo?: number }) =>
    request<ApiReserva[]>("/api/reservas/", { params: params as Record<string, string | number | undefined> }),
  create: (data: CreateReservaRequest) =>
    request<ApiReserva>("/api/reservas/", { method: "POST", body: data }),
  cancel: (id: number) =>
    request<void>(`/api/reservas/${id}`, { method: "DELETE" }),
  convert: (id: number) =>
    request<ConvertReservaResponse>(`/api/reservas/${id}/converter`, { method: "POST" }),
  vincularMesa: (id: number, mesaCodigo: number) =>
    request<ApiReserva>(`/api/reservas/${id}/vincular-mesa`, {
      method: "PATCH",
      params: { mesa_codigo: mesaCodigo },
    }),
};
