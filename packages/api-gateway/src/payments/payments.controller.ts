import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  create(@Body() body: any, @Query() query: Record<string, any>) {
    return this.proxyService.forwardToApiCore('/payments', 'POST', body, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.proxyService.forwardToApiCore(`/payments/${id}`, 'GET', undefined, query);
  }
}
