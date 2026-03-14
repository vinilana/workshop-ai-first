export class Price {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly type: string,
    public readonly recurringInterval: string | null,
    public readonly recurringCount: number | null,
    public readonly active: boolean,
    public readonly createdAt: string,
  ) {}

  isActive(): boolean {
    return this.active;
  }

  isRecurring(): boolean {
    return this.type === 'recurring';
  }

  formatAmount(): string {
    const reais = (this.amount / 100).toFixed(2);
    return `R$ ${reais}`;
  }

  toResponse() {
    return {
      id: this.id,
      product_id: this.productId,
      unit_amount: this.amount,
      currency: this.currency,
      type: this.type,
      recurring_interval: this.recurringInterval,
      recurring_count: this.recurringCount,
      active: this.active,
      formatted_amount: this.formatAmount(),
      created_at: this.createdAt,
    };
  }
}
