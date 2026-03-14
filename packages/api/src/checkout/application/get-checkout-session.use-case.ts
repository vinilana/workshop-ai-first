import { Injectable, NotFoundException } from '@nestjs/common';
import { CheckoutRepository } from '../domain/checkout.repository';
import { CheckoutSession } from '../domain/checkout-session.entity';

@Injectable()
export class GetCheckoutSessionUseCase {
  constructor(private readonly checkoutRepository: CheckoutRepository) {}

  execute(id: string): CheckoutSession {
    const session = this.checkoutRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Checkout session "${id}" not found`);
    }
    return session;
  }
}
