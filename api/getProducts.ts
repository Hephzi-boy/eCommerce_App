// src/api/getProducts.ts
import { supabase } from '../lib/supabase';

export type FetchParams = {
  page: number;     // 1-based
  perPage: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  sortBy?: 'price' | 'name' | 'created_at';
  ascending?: boolean;
};

export async function fetchProducts(params: FetchParams) {
  const { page, perPage, category, minPrice, maxPrice, query, sortBy, ascending } = params;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let builder = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (category) builder = builder.eq('category', category);
  if (typeof minPrice === 'number') builder = builder.gte('price', minPrice);
  if (typeof maxPrice === 'number') builder = builder.lte('price', maxPrice);

  if (query) {
    const q = `%${query}%`;
    // note: .or() uses PostgreSQL-style filters for Supabase
    builder = builder.or(`name.ilike.${q},description.ilike.${q}`);
  }

  if (sortBy) {
    builder = builder.order(sortBy, { ascending: !!ascending });
  } else {
    builder = builder.order('created_at', { ascending: false });
  }

  const { data, error, count } = await builder;
  if (error) throw error;
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil((count ?? 0) / perPage)),
  };
}
