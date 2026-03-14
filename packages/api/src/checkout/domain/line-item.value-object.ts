export class LineItem {
  constructor(
    public readonly priceId: string,
    public readonly quantity: number,
    public readonly productId?: string,
    public readonly productName?: string,
    public readonly unitAmount?: number,
    public readonly currency?: string,
  ) {}

  getTotalAmount(): number {
    return (this.unitAmount ?? 0) * this.quantity;
  }

  toResponse() {
    return {
      price_id: this.priceId,
      quantity: this.quantity,
      product_id: this.productId,
      product_name: this.productName,
      unit_amount: this.unitAmount,
      currency: this.currency,
      total_amount: this.getTotalAmount(),
    };
  }
}
