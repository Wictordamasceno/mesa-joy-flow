import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mesasApi, type AbrirMesaRequest } from "@/services/api";
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
    refetchInterval: 30000, // Polling every 30s as per doc
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

  return {
    tables: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    abrirMesa,
    fecharMesa,
    liberarMesa,
  };
}
