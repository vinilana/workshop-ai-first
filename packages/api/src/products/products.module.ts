import { Module } from '@nestjs/common';
import { ProductRepository } from './domain/product.repository';
import { SqliteProductRepository } from './infrastructure/sqlite-product.repository';
import { GetProductsUseCase } from './application/get-products.use-case';
import { GetProductByIdUseCase } from './application/get-product-by-id.use-case';
import { ProductsController } from './presentation/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: ProductRepository,
      useClass: SqliteProductRepository,
    },
    GetProductsUseCase,
    GetProductByIdUseCase,
  ],
  exports: [ProductRepository],
})
export class ProductsModule {}
