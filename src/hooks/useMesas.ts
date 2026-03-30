import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mesasApi, type AbrirMesaRequest, type TransferirMesaRequest } from "@/services/api";
import { apiMesaToTable } from "@/types/api";
import type { Table } from "@/types/restaurant";

export function useMesas() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["mesas"],
    queryFn: async () => {
      const mesas = await mesasApi.list();
      return mesas.map((m) => apiMesaToTable(m));
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const abrirMesa = useMutation({
    mutationFn: ({ codigo, data }: { codigo: number; data: AbrirMesaRequest }) =>
      mesasApi.abrir(codigo, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mesas"] }),
  });

  const fecharMesa = useMutation({
    mutationFn: ({ codigo, cdvend }: { codigo: number; cdvend: number }) =>
      mesasApi.fechar(codigo, { cdvend }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mesas"] }),
  });

  const liberarMesa = useMutation({
    mutationFn: (codigo: number) => mesasApi.liberar(codigo),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mesas"] }),
  });

  const transferirMesa = useMutation({
    mutationFn: ({ codigo, data }: { codigo: number; data: TransferirMesaRequest }) =>
      mesasApi.transferir(codigo, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mesas"] });
      queryClient.invalidateQueries({ queryKey: ["comandas"] });
    },
  });

  return {
    tables: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    abrirMesa,
    fecharMesa,
    liberarMesa,
    transferirMesa,
  };
}
