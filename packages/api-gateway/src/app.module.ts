import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyModule } from './proxy/proxy.module';
import { ProductsModule } from './products/products.module';
import { CheckoutModule } from './checkout/checkout.module';
import { CustomersModule } from './customers/customers.module';
import { PaymentsModule } from './payments/payments.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HttpModule,
    ProxyModule,
    ProductsModule,
    CheckoutModule,
    CustomersModule,
    PaymentsModule,
    HealthModule,
  ],
})
export class AppModule {}
