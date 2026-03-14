import { Controller, Get, Param } from '@nestjs/common';
import { GetProductsUseCase } from '../application/get-products.use-case';
import { GetProductByIdUseCase } from '../application/get-product-by-id.use-case';
import { ProductResponseDto } from './product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  findAll(): ProductResponseDto[] {
    const products = this.getProductsUseCase.execute();
    return products.map((product) => product.toResponse());
  }

  @Get(':id')
  findById(@Param('id') id: string): ProductResponseDto {
    const product = this.getProductByIdUseCase.execute(id);
    return product.toResponse();
  }
}
