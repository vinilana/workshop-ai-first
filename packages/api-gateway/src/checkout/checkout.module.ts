import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
