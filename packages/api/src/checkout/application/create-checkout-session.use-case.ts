import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CheckoutRepository } from '../domain/checkout.repository';
import { CheckoutSession } from '../domain/checkout-session.entity';
import { LineItem } from '../domain/line-item.value-object';
import { ProductRepository } from '../../products/domain/product.repository';
import { CreateCheckoutSessionDto } from '../presentation/create-checkout-session.dto';

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  execute(dto: CreateCheckoutSessionDto): CheckoutSession {
    const products = this.productRepository.findAll();

    const lineItems: LineItem[] = dto.line_items.map((item) => {
      let foundPrice: {
        priceId: string;
        productId: string;
        productName: string;
        unitAmount: number;
        currency: string;
      } | null = null;

      if (item.price_id) {
        for (const product of products) {
          const price = product.prices.find((p) => p.id === item.price_id);
          if (price) {
            foundPrice = {
              priceId: price.id,
              productId: product.id,
              productName: product.name,
              unitAmount: price.amount,
              currency: price.currency,
            };
            break;
          }
        }
        if (!foundPrice) {
          throw new BadRequestException(`Price "${item.price_id}" not found`);
        }
      } else if (item.product_id) {
        const product = products.find((p) => p.id === item.product_id);
        if (!product) {
          throw new BadRequestException(`Product "${item.product_id}" not found`);
        }
        const defaultPrice = product.prices.find((p) => p.isActive());
        if (!defaultPrice) {
          throw new BadRequestException(`No active price for product "${item.product_id}"`);
        }
        foundPrice = {
          priceId: defaultPrice.id,
          productId: product.id,
          productName: product.name,
          unitAmount: defaultPrice.amount,
          currency: defaultPrice.currency,
        };
      } else {
        throw new BadRequestException('Either price_id or product_id is required');
      }

      return new LineItem(
        foundPrice.priceId,
        item.quantity,
        foundPrice.productId,
        foundPrice.productName,
        foundPrice.unitAmount,
        foundPrice.currency,
      );
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    const session = new CheckoutSession(
      `cs_${uuidv4()}`,
      'open',
      'brl',
      lineItems,
      dto.success_url ?? null,
      dto.cancel_url ?? null,
      now.toISOString(),
      expiresAt.toISOString(),
    );

    return this.checkoutRepository.create(session);
  }
}
