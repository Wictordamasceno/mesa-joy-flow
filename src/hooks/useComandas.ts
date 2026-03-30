import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { comandasApi, type CreateComandaRequest, type FecharComandaRequest } from "@/services/api";
import { apiComandaToComanda, apiItemToOrderItem } from "@/types/api";
import { pedidosApi } from "@/services/api";
import type { Comanda } from "@/types/restaurant";

export function useComandas(cdpedido: number | null, tableId: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["comandas", cdpedido],
    queryFn: async () => {
      if (!cdpedido) return [];
      const apiComandas = await comandasApi.list(cdpedido);
      const comandas: Comanda[] = await Promise.all(
        apiComandas.map(async (ac) => {
          let items: ReturnType<typeof apiItemToOrderItem>[] = [];
          if (ac.status === "A") {
            try {
              const apiItems = await pedidosApi.getItems(cdpedido, ac.numcomanda);
              items = apiItems.map(apiItemToOrderItem);
            } catch {
              // Items might not be available
            }
          }
          return apiComandaToComanda(ac, tableId, items);
        })
      );
      return comandas;
    },
    enabled: !!cdpedido,
    staleTime: 5000,
  });

  const createComanda = useMutation({
    mutationFn: (data: CreateComandaRequest) => {
      if (!cdpedido) throw new Error("Pedido não encontrado");
      return comandasApi.create(cdpedido, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comandas", cdpedido] });
    },
  });

  const fecharComanda = useMutation({
    mutationFn: (data: FecharComandaRequest) => {
      if (!cdpedido) throw new Error("Pedido não encontrado");
      return comandasApi.fechar(cdpedido, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comandas", cdpedido] });
      queryClient.invalidateQueries({ queryKey: ["mesas"] });
    },
  });

  return {
    comandas: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createComanda,
    fecharComanda,
  };
}
