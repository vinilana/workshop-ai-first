import { CheckoutSession, CheckoutSessionStatus } from '../domain/checkout-session.entity';
import { LineItem } from '../domain/line-item.value-object';

export interface CheckoutSessionRow {
  id: string;
  status: string;
  currency: string;
  success_url: string | null;
  cancel_url: string | null;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
}

export interface CheckoutSessionItemRow {
  id: string;
  checkout_session_id: string;
  price_id: string;
  quantity: number;
  product_id: string | null;
  product_name: string | null;
  unit_amount: number | null;
  currency: string | null;
}

export class CheckoutMapper {
  static toDomain(
    row: CheckoutSessionRow,
    itemRows: CheckoutSessionItemRow[] = [],
  ): CheckoutSession {
    const lineItems = itemRows.map(
      (item) =>
        new LineItem(
          item.price_id,
          item.quantity,
          item.product_id ?? undefined,
          item.product_name ?? undefined,
          item.unit_amount ?? undefined,
          item.currency ?? undefined,
        ),
    );

    return new CheckoutSession(
      row.id,
      row.status as CheckoutSessionStatus,
      row.currency,
      lineItems,
      row.success_url,
      row.cancel_url,
      row.created_at,
      row.expires_at,
      row.completed_at,
    );
  }
}
