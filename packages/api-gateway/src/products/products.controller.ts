import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  findAll(@Query() query: Record<string, any>) {
    return this.proxyService.forwardToApi('/products', 'GET', undefined, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.proxyService.forwardToApi(`/products/${id}`, 'GET', undefined, query);
  }
}
