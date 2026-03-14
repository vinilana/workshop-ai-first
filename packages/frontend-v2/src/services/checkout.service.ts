import { apiRequest } from './api';

export interface CheckoutItem {
  productId: string;
  quantity: number;
}

export interface CreateCheckoutData {
  items: CheckoutItem[];
}

export interface CheckoutLineItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutSession {
  id: string;
  items: CheckoutLineItem[];
  total: number;
  status: string;
}

interface ApiCheckoutSession {
  id: string;
  status: string;
  total_amount: number;
  line_items: Array<{
    product_id: string;
    product_name: string;
    unit_amount: number;
    quantity: number;
    total_amount: number;
  }>;
}

function mapSession(s: ApiCheckoutSession): CheckoutSession {
  return {
    id: s.id,
    status: s.status,
    total: s.total_amount,
    items: s.line_items.map(li => ({
      productId: li.product_id,
      name: li.product_name,
      price: li.unit_amount,
      quantity: li.quantity,
    })),
  };
}

export async function createCheckoutSession(
  data: CreateCheckoutData
): Promise<CheckoutSession> {
  const body = {
    line_items: data.items.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  };
  const result = await apiRequest<ApiCheckoutSession>('/checkout/sessions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return mapSession(result);
}

export async function getCheckoutSession(
  id: string
): Promise<CheckoutSession> {
  const result = await apiRequest<ApiCheckoutSession>(`/checkout/sessions/${id}`);
  return mapSession(result);
}
