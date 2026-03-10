import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservasApi, type CreateReservaRequest } from "@/services/api";
import { apiReservaToReservation } from "@/types/api";
import type { Reservation } from "@/types/restaurant";

export function useReservas(data?: string, mesaCodigo?: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["reservas", data, mesaCodigo],
    queryFn: async () => {
      const reservas = await reservasApi.list({
        data: data || undefined,
        mesa_codigo: mesaCodigo || undefined,
      });
      return reservas.map((r) => ({
        ...apiReservaToReservation(r),
        mesaCodigo: r.mesa_codigo,
        apiId: r.id,
      }));
    },
    staleTime: 30000,
  });

  const createReserva = useMutation({
    mutationFn: (data: CreateReservaRequest) => reservasApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservas"] }),
  });

  const cancelReserva = useMutation({
    mutationFn: (id: number) => reservasApi.cancel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reservas"] }),
  });

  const convertReserva = useMutation({
    mutationFn: (id: number) => reservasApi.convert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      queryClient.invalidateQueries({ queryKey: ["mesas"] });
    },
  });

  return {
    reservations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createReserva,
    cancelReserva,
    convertReserva,
    refetch: query.refetch,
  };
}
