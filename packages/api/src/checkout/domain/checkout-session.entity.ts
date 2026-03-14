import { LineItem } from './line-item.value-object';

export type CheckoutSessionStatus = 'open' | 'completed' | 'expired';

export class CheckoutSession {
  constructor(
    public readonly id: string,
    public status: CheckoutSessionStatus,
    public readonly currency: string,
    public readonly lineItems: LineItem[],
    public readonly successUrl: string | null,
    public readonly cancelUrl: string | null,
    public readonly createdAt: string,
    public readonly expiresAt: string,
    public completedAt: string | null = null,
  ) {}

  isExpired(): boolean {
    return new Date(this.expiresAt) < new Date();
  }

  canComplete(): boolean {
    return this.status === 'open' && !this.isExpired();
  }

  complete(): void {
    if (!this.canComplete()) {
      throw new Error('Checkout session cannot be completed');
    }
    this.status = 'completed';
    this.completedAt = new Date().toISOString();
  }

  getTotalAmount(): number {
    return this.lineItems.reduce((total, item) => total + item.getTotalAmount(), 0);
  }

  toResponse() {
    return {
      id: this.id,
      status: this.status,
      currency: this.currency,
      line_items: this.lineItems.map((item) => item.toResponse()),
      total_amount: this.getTotalAmount(),
      success_url: this.successUrl,
      cancel_url: this.cancelUrl,
      created_at: this.createdAt,
      expires_at: this.expiresAt,
      completed_at: this.completedAt,
    };
  }
}
