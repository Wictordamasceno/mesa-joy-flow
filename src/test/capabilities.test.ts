import { describe, it, expect } from "vitest";
import type { Capabilities } from "@/services/api";

describe("Capabilities feature flags", () => {
  const mesaMode: Capabilities = {
    modo_comanda: "mesa",
    features: {
      usar_comandas: false,
      abrir_comanda: false,
      fechar_comanda_individual: false,
      transferir_comanda: false,
      fechar_mesa_direto: true,
    },
  };

  const comandaMode: Capabilities = {
    modo_comanda: "comanda",
    features: {
      usar_comandas: true,
      abrir_comanda: true,
      fechar_comanda_individual: true,
      transferir_comanda: true,
      fechar_mesa_direto: false,
    },
  };

  it("mesa mode disables all comanda features", () => {
    expect(mesaMode.features.usar_comandas).toBe(false);
    expect(mesaMode.features.abrir_comanda).toBe(false);
    expect(mesaMode.features.fechar_comanda_individual).toBe(false);
    expect(mesaMode.features.transferir_comanda).toBe(false);
  });

  it("mesa mode enables fechar_mesa_direto", () => {
    expect(mesaMode.features.fechar_mesa_direto).toBe(true);
  });

  it("comanda mode enables all comanda features", () => {
    expect(comandaMode.features.usar_comandas).toBe(true);
    expect(comandaMode.features.abrir_comanda).toBe(true);
    expect(comandaMode.features.fechar_comanda_individual).toBe(true);
    expect(comandaMode.features.transferir_comanda).toBe(true);
  });

  it("comanda mode disables fechar_mesa_direto", () => {
    expect(comandaMode.features.fechar_mesa_direto).toBe(false);
  });

  it("modo_comanda value determines the mode", () => {
    expect(mesaMode.modo_comanda === "mesa").toBe(true);
    expect(comandaMode.modo_comanda === "comanda").toBe(true);
  });
});
