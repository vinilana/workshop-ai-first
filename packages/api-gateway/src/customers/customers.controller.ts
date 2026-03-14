import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.proxyService.forwardToApiCore(`/customers/${id}`, 'GET', undefined, query);
  }

  @Post()
  create(@Body() body: any, @Query() query: Record<string, any>) {
    return this.proxyService.forwardToApiCore('/customers', 'POST', body, query);
  }
}
