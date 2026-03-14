import { apiRequest } from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface ApiProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  prices: Array<{
    id: string;
    unit_amount: number;
    currency: string;
    active: boolean;
  }>;
}

function mapProduct(p: ApiProduct): Product {
  const activePrice = p.prices.find(pr => pr.active) || p.prices[0];
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: activePrice?.unit_amount ?? 0,
  };
}

export async function getProducts(): Promise<Product[]> {
  const apiProducts = await apiRequest<ApiProduct[]>('/products');
  return apiProducts.map(mapProduct);
}

export async function getProduct(id: string): Promise<Product> {
  const apiProduct = await apiRequest<ApiProduct>(`/products/${id}`);
  return mapProduct(apiProduct);
}
