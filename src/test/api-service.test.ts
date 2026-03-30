import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Must import after mocking fetch
import {
  configApi,
  comandasApi,
  pedidosApi,
  ApiError,
} from "@/services/api";

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.setItem("hostUrl", "http://localhost:8000");
  localStorage.setItem("authToken", "test-token");
});

function mockResponse(data: any, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
}

function mockErrorResponse(data: any, status: number) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: () => Promise.resolve(data),
  });
}

describe("configApi.capabilities", () => {
  it("returns capabilities for mesa mode", async () => {
    const caps = {
      modo_comanda: "mesa",
      features: {
        usar_comandas: false,
        abrir_comanda: false,
        fechar_comanda_individual: false,
        transferir_comanda: false,
        fechar_mesa_direto: true,
      },
    };
    mockResponse(caps);
    const result = await configApi.capabilities();
    expect(result.modo_comanda).toBe("mesa");
    expect(result.features.fechar_mesa_direto).toBe(true);
    expect(result.features.usar_comandas).toBe(false);
  });

  it("returns capabilities for comanda mode", async () => {
    const caps = {
      modo_comanda: "comanda",
      features: {
        usar_comandas: true,
        abrir_comanda: true,
        fechar_comanda_individual: true,
        transferir_comanda: true,
        fechar_mesa_direto: false,
      },
    };
    mockResponse(caps);
    const result = await configApi.capabilities();
    expect(result.modo_comanda).toBe("comanda");
    expect(result.features.usar_comandas).toBe(true);
  });
});

describe("comandasApi", () => {
  it("creates a comanda", async () => {
    mockResponse({ numcomanda: 1 });
    const result = await comandasApi.create(100, { nome: "João" });
    expect(result.numcomanda).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/pedidos/100/comandas",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("lists comandas", async () => {
    mockResponse([
      { numcomanda: 1, nome: "João", pessoas: 2, status: "A", total: 50 },
      { numcomanda: 2, nome: "Maria", pessoas: 1, status: "F", total: 30 },
    ]);
    const result = await comandasApi.list(100);
    expect(result).toHaveLength(2);
    expect(result[0].status).toBe("A");
  });

  it("closes a comanda and returns mesa_liberada", async () => {
    mockResponse({ message: "ok", mesa_liberada: true });
    const result = await comandasApi.fechar(100, { numcomanda: 1 });
    expect(result.mesa_liberada).toBe(true);
  });

  it("transfers a comanda via mesasApi", async () => {
    // Import mesasApi
    const { mesasApi } = await import("@/services/api");
    mockResponse({ message: "ok", mesa_origem_liberada: false });
    const result = await mesasApi.transferir(5, { mesa_destino: 10, comandas: [1, 3] });
    expect(result.mesa_origem_liberada).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/mesas/5/transferir",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("transfers whole mesa (no comandas array)", async () => {
    const { mesasApi } = await import("@/services/api");
    mockResponse({ message: "ok", mesa_origem_liberada: true });
    const result = await mesasApi.transferir(5, { mesa_destino: 10 });
    expect(result.mesa_origem_liberada).toBe(true);
  });
});

describe("pedidosApi.getTotal with numcomanda", () => {
  it("sends numcomanda as query param", async () => {
    mockResponse({ subtotal: 50, total_opcionais: 5, total: 55 });
    await pedidosApi.getTotal(100, 2);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/pedidos/100/total?numcomanda=2",
      expect.any(Object)
    );
  });

  it("omits numcomanda when not provided", async () => {
    mockResponse({ subtotal: 100, total_opcionais: 10, total: 110 });
    await pedidosApi.getTotal(100);
    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/pedidos/100/total",
      expect.any(Object)
    );
  });
});

describe("ApiError handling", () => {
  it("throws ApiError with detail message on 400", async () => {
    mockErrorResponse({ detail: "Ha 2 comanda(s) abertas" }, 400);
    await expect(configApi.capabilities()).rejects.toThrow("Ha 2 comanda(s) abertas");
  });

  it("throws ApiError on 429", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve({}),
    });
    await expect(configApi.capabilities()).rejects.toThrow("Muitas requisições");
  });
});
