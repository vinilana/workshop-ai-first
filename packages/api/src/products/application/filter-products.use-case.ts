import { Injectable } from '@nestjs/common';
import { ProductRepository, ProductFilters } from '../domain/product.repository';
import { Product } from '../domain/product.entity';

@Injectable()
export class FilterProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(filters: ProductFilters): Product[] {
    return this.productRepository.findByFilters(filters);
  }
}
