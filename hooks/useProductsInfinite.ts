// src/hooks/useProductsInfinite.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { FetchParams, fetchProducts } from '../api/getProducts';

export function useProductsInfinite(filters: Omit<FetchParams, 'page' | 'perPage'> & { perPage?: number }) {
  const perPage = filters.perPage ?? 12;
  return useInfiniteQuery(
    ['products', { ...filters, perPage }],
    ({ pageParam = 1 }) => fetchProducts({ ...filters as any, page: pageParam, perPage }),
    {
      getNextPageParam: (last) => (last.page < last.totalPages ? last.page + 1 : undefined),
      keepPreviousData: true,
      staleTime: 1000 * 60 * 1,
    }
  );
}
