import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { CheckoutRepository } from './domain/checkout.repository';
import { SqliteCheckoutRepository } from './infrastructure/sqlite-checkout.repository';
import { CreateCheckoutSessionUseCase } from './application/create-checkout-session.use-case';
import { GetCheckoutSessionUseCase } from './application/get-checkout-session.use-case';
import { CheckoutController } from './presentation/checkout.controller';

@Module({
  imports: [ProductsModule],
  controllers: [CheckoutController],
  providers: [
    {
      provide: CheckoutRepository,
      useClass: SqliteCheckoutRepository,
    },
    CreateCheckoutSessionUseCase,
    GetCheckoutSessionUseCase,
  ],
})
export class CheckoutModule {}
