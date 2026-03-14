import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('sessions')
  createSession(@Body() body: any, @Query() query: Record<string, any>) {
    return this.proxyService.forwardToApi('/checkout/sessions', 'POST', body, query);
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string, @Query() query: Record<string, any>) {
    return this.proxyService.forwardToApi(`/checkout/sessions/${id}`, 'GET', undefined, query);
  }
}
