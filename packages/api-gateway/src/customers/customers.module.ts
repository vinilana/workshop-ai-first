import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { ProxyModule } from '../proxy/proxy.module';

@Module({
  imports: [ProxyModule],
  controllers: [CustomersController],
})
export class CustomersModule {}
