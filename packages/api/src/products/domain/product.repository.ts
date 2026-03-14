import { Product } from './product.entity';

export abstract class ProductRepository {
  abstract findAll(): Product[];
  abstract findById(id: string): Product | null;
}
