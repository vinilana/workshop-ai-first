import { useState, useEffect, useCallback } from 'react';
import { getProducts, searchProducts, Product, ProductFilters } from '@/services/products.service';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>({});

  const hasActiveFilters = Boolean(filters.name || filters.active || filters.priceType);

  const fetchProducts = useCallback(async (currentFilters: ProductFilters) => {
    let cancelled = false;

    try {
      setLoading(true);
      const hasFilters = Boolean(currentFilters.name || currentFilters.active || currentFilters.priceType);
      const data = hasFilters
        ? await searchProducts(currentFilters)
        : await getProducts();

      if (!cancelled) {
        setProducts(data);
        setError(null);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cleanup = fetchProducts(filters);
    return () => { cleanup.then(fn => fn?.()); };
  }, [filters, fetchProducts]);

  return { products, loading, error, filters, setFilters, hasActiveFilters };
}
