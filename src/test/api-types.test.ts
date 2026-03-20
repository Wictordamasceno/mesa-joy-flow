import { describe, it, expect } from "vitest";
import {
  mapMesaStatus,
  mapProductionStatus,
  mapComandaStatus,
  apiItemToOrderItem,
  apiMesaToTable,
  apiComandaToComanda,
} from "@/types/api";

describe("mapMesaStatus", () => {
  it("maps A to available", () => {
    expect(mapMesaStatus("A")).toBe("available");
  });
  it("maps O to occupied", () => {
    expect(mapMesaStatus("O")).toBe("occupied");
  });
  it("maps F to billing", () => {
    expect(mapMesaStatus("F")).toBe("billing");
  });
  it("returns available for unknown status", () => {
    expect(mapMesaStatus("X" as any)).toBe("available");
  });
});

describe("mapProductionStatus", () => {
  it("maps P to pending", () => {
    expect(mapProductionStatus("P")).toBe("pending");
  });
  it("maps E to preparing", () => {
    expect(mapProductionStatus("E")).toBe("preparing");
  });
  it("maps R to ready", () => {
    expect(mapProductionStatus("R")).toBe("ready");
  });
  it("maps T to delivered", () => {
    expect(mapProductionStatus("T")).toBe("delivered");
  });
  it("returns pending for unknown", () => {
    expect(mapProductionStatus("Z" as any)).toBe("pending");
  });
});

describe("mapComandaStatus", () => {
  it("maps A to open", () => {
    expect(mapComandaStatus("A")).toBe("open");
  });
  it("maps F to closed", () => {
    expect(mapComandaStatus("F")).toBe("closed");
  });
});

describe("apiMesaToTable", () => {
  it("converts ApiMesa to Table correctly", () => {
    const mesa = {
      codigo: 5,
      nome: "Mesa 5",
      pedido: 123,
      cdvend: 1,
      satatus: "O" as const,
      pessoas: 4,
      obs: null,
      dt_abertura: "2024-01-01T10:00:00",
    };
    const table = apiMesaToTable(mesa);
    expect(table.id).toBe(5);
    expect(table.number).toBe(5);
    expect(table.seats).toBe(4);
    expect(table.status).toBe("occupied");
    expect(table.comandas).toEqual([]);
    expect(table.openedAt).toBeInstanceOf(Date);
  });

  it("handles null pessoas as 0 seats", () => {
    const mesa = {
      codigo: 1,
      nome: "Mesa 1",
      pedido: null,
      cdvend: null,
      satatus: "A" as const,
      pessoas: null,
      obs: null,
      dt_abertura: null,
    };
    const table = apiMesaToTable(mesa);
    expect(table.seats).toBe(0);
    expect(table.openedAt).toBeUndefined();
  });
});

describe("apiItemToOrderItem", () => {
  it("converts item with extras", () => {
    const item = {
      id: 10,
      cdpedido: 1,
      cdprod: 100,
      descricao: "Hambúrguer",
      qtdeped: 2,
      unitario: 25.0,
      vl_opcional: 5.0,
      obs: "Sem cebola",
      obs_opcional: "Bacon Extra",
      numcomanda: 1,
      ordem: 1,
      stproducao: "E" as const,
    };
    const orderItem = apiItemToOrderItem(item);
    expect(orderItem.id).toBe("10");
    expect(orderItem.menuItem.name).toBe("Hambúrguer");
    expect(orderItem.quantity).toBe(2);
    expect(orderItem.status).toBe("preparing");
    expect(orderItem.selectedExtras).toHaveLength(1);
    expect(orderItem.selectedExtras![0].name).toBe("Bacon Extra");
    expect(orderItem.selectedExtras![0].price).toBe(5.0);
    expect(orderItem.selectedObservations).toEqual(["Sem cebola"]);
  });

  it("converts item without extras", () => {
    const item = {
      id: 11,
      cdpedido: 1,
      cdprod: 101,
      descricao: "Água",
      qtdeped: 1,
      unitario: 5.0,
      vl_opcional: 0,
      obs: null,
      obs_opcional: null,
      numcomanda: 1,
      ordem: 2,
      stproducao: "T" as const,
    };
    const orderItem = apiItemToOrderItem(item);
    expect(orderItem.selectedExtras).toEqual([]);
    expect(orderItem.selectedObservations).toEqual([]);
    expect(orderItem.status).toBe("delivered");
  });
});

describe("apiComandaToComanda", () => {
  it("converts open comanda", () => {
    const apiComanda = {
      numcomanda: 2,
      nome: "Carlos",
      pessoas: 3,
      status: "A" as const,
      total: 150.5,
    };
    const comanda = apiComandaToComanda(apiComanda, 5);
    expect(comanda.id).toBe("comanda-2");
    expect(comanda.tableId).toBe(5);
    expect(comanda.number).toBe(2);
    expect(comanda.customerName).toBe("Carlos");
    expect(comanda.status).toBe("open");
    expect(comanda.total).toBe(150.5);
  });

  it("converts closed comanda", () => {
    const apiComanda = {
      numcomanda: 1,
      nome: null,
      pessoas: null,
      status: "F" as const,
      total: 80.0,
    };
    const comanda = apiComandaToComanda(apiComanda, 3);
    expect(comanda.status).toBe("closed");
    expect(comanda.customerName).toBeUndefined();
  });
});
