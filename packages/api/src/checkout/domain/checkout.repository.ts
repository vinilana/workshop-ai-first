import { CheckoutSession } from './checkout-session.entity';

export abstract class CheckoutRepository {
  abstract create(session: CheckoutSession): CheckoutSession;
  abstract findById(id: string): CheckoutSession | null;
  abstract update(session: CheckoutSession): CheckoutSession;
}
