export interface LineItemResponseDto {
  price_id: string;
  quantity: number;
  product_id?: string;
  product_name?: string;
  unit_amount?: number;
  currency?: string;
  total_amount: number;
}

export interface CheckoutSessionResponseDto {
  id: string;
  status: string;
  currency: string;
  line_items: LineItemResponseDto[];
  total_amount: number;
  success_url: string | null;
  cancel_url: string | null;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
}
