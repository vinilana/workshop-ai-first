import { Injectable, Inject } from '@nestjs/common';
import Database from 'better-sqlite3';
import { CheckoutRepository } from '../domain/checkout.repository';
import { CheckoutSession } from '../domain/checkout-session.entity';
import { CheckoutMapper, CheckoutSessionRow, CheckoutSessionItemRow } from './checkout.mapper';

@Injectable()
export class SqliteCheckoutRepository extends CheckoutRepository {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {
    super();
  }

  create(session: CheckoutSession): CheckoutSession {
    const insertSession = this.db.prepare(`
      INSERT INTO checkout_sessions (id, status, currency, amount_total, success_url, cancel_url, created_at, expires_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = this.db.prepare(`
      INSERT INTO checkout_session_items (id, checkout_session_id, price_id, quantity, product_id, product_name, unit_amount, amount_total, currency)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const { v4: uuidv4 } = require('uuid');

    const transaction = this.db.transaction(() => {
      insertSession.run(
        session.id,
        session.status,
        session.currency,
        session.getTotalAmount(),
        session.successUrl,
        session.cancelUrl,
        session.createdAt,
        session.expiresAt,
        session.completedAt,
      );

      for (const item of session.lineItems) {
        insertItem.run(
          `csi_${uuidv4()}`,
          session.id,
          item.priceId,
          item.quantity,
          item.productId ?? null,
          item.productName ?? null,
          item.unitAmount ?? null,
          item.getTotalAmount(),
          item.currency ?? null,
        );
      }
    });

    transaction();

    return this.findById(session.id)!;
  }

  findById(id: string): CheckoutSession | null {
    const row = this.db
      .prepare('SELECT * FROM checkout_sessions WHERE id = ?')
      .get(id) as CheckoutSessionRow | undefined;

    if (!row) return null;

    const itemRows = this.db
      .prepare('SELECT * FROM checkout_session_items WHERE checkout_session_id = ?')
      .all(id) as CheckoutSessionItemRow[];

    return CheckoutMapper.toDomain(row, itemRows);
  }

  update(session: CheckoutSession): CheckoutSession {
    this.db
      .prepare(`
        UPDATE checkout_sessions
        SET status = ?, completed_at = ?
        WHERE id = ?
      `)
      .run(session.status, session.completedAt, session.id);

    return this.findById(session.id)!;
  }
}
