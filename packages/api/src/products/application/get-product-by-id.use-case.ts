import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../domain/product.repository';
import { Product } from '../domain/product.entity';

@Injectable()
export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  execute(id: string): Product {
    const product = this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }
}
