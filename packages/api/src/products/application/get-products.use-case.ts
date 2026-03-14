import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../domain/product.repository';
import { Product } from '../domain/product.entity';

@Injectable()
export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(): Product[] {
    return this.productRepository.findAll();
  }
}
