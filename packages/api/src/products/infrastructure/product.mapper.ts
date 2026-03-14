import { Product } from '../domain/product.entity';
import { Price } from '../domain/price.entity';

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface PriceRow {
  id: string;
  product_id: string;
  unit_amount: number;
  currency: string;
  type: string;
  recurring_interval: string | null;
  recurring_interval_count: number | null;
  active: number;
  created_at: string;
}

export class ProductMapper {
  static toDomain(row: ProductRow, priceRows: PriceRow[] = []): Product {
    const prices = priceRows.map(ProductMapper.priceToDomain);
    return new Product(
      row.id,
      row.name,
      row.description,
      row.active === 1,
      row.created_at,
      row.updated_at,
      prices,
    );
  }

  static priceToDomain(row: PriceRow): Price {
    return new Price(
      row.id,
      row.product_id,
      row.unit_amount,
      row.currency,
      row.type,
      row.recurring_interval,
      row.recurring_interval_count,
      row.active === 1,
      row.created_at,
    );
  }
}
