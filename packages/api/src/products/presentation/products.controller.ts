import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetProductsUseCase } from '../application/get-products.use-case';
import { GetProductByIdUseCase } from '../application/get-product-by-id.use-case';
import { FilterProductsUseCase } from '../application/filter-products.use-case';
import { ProductResponseDto } from './product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
    private readonly filterProductsUseCase: FilterProductsUseCase,
  ) {}

  @Get()
  findAll(): ProductResponseDto[] {
    const products = this.getProductsUseCase.execute();
    return products.map((product) => product.toResponse());
  }

  @Get('search')
  search(
    @Query('name') name?: string,
    @Query('active') active?: string,
    @Query('price_type') priceType?: string,
  ): ProductResponseDto[] {
    const filters = {
      name,
      active: active !== undefined ? active === 'true' : undefined,
      priceType,
    };
    const products = this.filterProductsUseCase.execute(filters);
    return products.map((product) => product.toResponse());
  }

  @Get(':id')
  findById(@Param('id') id: string): ProductResponseDto {
    const product = this.getProductByIdUseCase.execute(id);
    return product.toResponse();
  }
}
