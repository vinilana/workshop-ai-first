import { Price } from './price.entity';

export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly active: boolean,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public prices: Price[] = [],
  ) {}

  isActive(): boolean {
    return this.active;
  }

  toResponse() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      active: this.active,
      prices: this.prices.map((price) => price.toResponse()),
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}
