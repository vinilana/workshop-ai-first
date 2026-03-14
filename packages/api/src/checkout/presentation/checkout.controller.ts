import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { CreateCheckoutSessionUseCase } from '../application/create-checkout-session.use-case';
import { GetCheckoutSessionUseCase } from '../application/get-checkout-session.use-case';
import { CreateCheckoutSessionDto } from './create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './checkout-session-response.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly getCheckoutSessionUseCase: GetCheckoutSessionUseCase,
  ) {}

  @Post('sessions')
  createSession(@Body() dto: CreateCheckoutSessionDto): CheckoutSessionResponseDto {
    const session = this.createCheckoutSessionUseCase.execute(dto);
    return session.toResponse();
  }

  @Get('sessions/:id')
  getSession(@Param('id') id: string): CheckoutSessionResponseDto {
    const session = this.getCheckoutSessionUseCase.execute(id);
    return session.toResponse();
  }
}
