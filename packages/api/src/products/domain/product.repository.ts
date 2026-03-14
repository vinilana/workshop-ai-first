import { Product } from './product.entity';

export interface ProductFilters {
  name?: string;
  active?: boolean;
  priceType?: string;
}

export abstract class ProductRepository {
  abstract findAll(): Product[];
  abstract findById(id: string): Product | null;
  abstract findByFilters(filters: ProductFilters): Product[];
}
