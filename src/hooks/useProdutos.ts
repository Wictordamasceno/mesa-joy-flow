import { useQuery } from "@tanstack/react-query";
import { produtosApi } from "@/services/api";
import { apiProdutoToMenuItem, apiCategoriaToCategory } from "@/types/api";
import type { MenuItem, Category } from "@/types/restaurant";

export function useProdutos(cdcat?: number, busca?: string) {
  const categoriasQuery = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const cats = await produtosApi.categorias();
      return cats.map(apiCategoriaToCategory);
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const produtosQuery = useQuery({
    queryKey: ["produtos", cdcat, busca],
    queryFn: async () => {
      const prods = await produtosApi.list({
        cdcat: cdcat || undefined,
        busca: busca || undefined,
      });
      return prods.map(apiProdutoToMenuItem);
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    categories: categoriasQuery.data || [],
    products: produtosQuery.data || [],
    isLoadingCategories: categoriasQuery.isLoading,
    isLoadingProducts: produtosQuery.isLoading,
    error: categoriasQuery.error || produtosQuery.error,
  };
}
