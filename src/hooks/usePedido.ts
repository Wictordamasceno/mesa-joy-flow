import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { pedidosApi, type AddItemRequest, type UpdateItemRequest, type ApiPedido } from "@/services/api";
import { apiItemToOrderItem } from "@/types/api";
import type { OrderItem } from "@/types/restaurant";

export function usePedido(mesaCodigo: number | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pedido", mesaCodigo],
    queryFn: () => pedidosApi.getByMesa(mesaCodigo!),
    enabled: !!mesaCodigo,
    staleTime: 5000,
  });

  const pedido = query.data;
  const items: OrderItem[] = pedido?.itens?.map(apiItemToOrderItem) || [];

  // Group items by numcomanda
  const comandaItems = pedido?.itens?.reduce((acc, item) => {
    const num = item.numcomanda || 1;
    if (!acc[num]) acc[num] = [];
    acc[num].push(apiItemToOrderItem(item));
    return acc;
  }, {} as Record<number, OrderItem[]>) || {};

  const addItem = useMutation({
    mutationFn: (data: AddItemRequest) => {
      if (!pedido) throw new Error("Pedido não encontrado");
      return pedidosApi.addItem(pedido.cdpedido, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedido", mesaCodigo] });
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: UpdateItemRequest }) => {
      if (!pedido) throw new Error("Pedido não encontrado");
      return pedidosApi.updateItem(pedido.cdpedido, itemId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedido", mesaCodigo] });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: number) => {
      if (!pedido) throw new Error("Pedido não encontrado");
      return pedidosApi.removeItem(pedido.cdpedido, itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedido", mesaCodigo] });
    },
  });

  const getTotal = useQuery({
    queryKey: ["pedido-total", pedido?.cdpedido],
    queryFn: () => pedidosApi.getTotal(pedido!.cdpedido),
    enabled: !!pedido?.cdpedido,
  });

  return {
    pedido,
    items,
    comandaItems,
    total: getTotal.data,
    isLoading: query.isLoading,
    error: query.error,
    addItem,
    updateItem,
    removeItem,
    refetch: query.refetch,
  };
}
