export interface PriceResponseDto {
  id: string;
  product_id: string;
  unit_amount: number;
  currency: string;
  type: string;
  recurring_interval: string | null;
  recurring_count: number | null;
  active: boolean;
  formatted_amount: string;
  created_at: string;
}

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string;
  active: boolean;
  prices: PriceResponseDto[];
  created_at: string;
  updated_at: string;
}
