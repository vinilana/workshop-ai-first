import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { DB_PATH } from './database';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  private db: Database.Database;

  constructor() {
    // make sure data dir exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // initialize database
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');

    // create all the tables right here in the constructor
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        metadata TEXT DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prices (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        unit_amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'brl',
        type TEXT NOT NULL DEFAULT 'one_time',
        recurring_interval TEXT,
        recurring_interval_count INTEGER DEFAULT 1,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        type TEXT NOT NULL,
        card_last4 TEXT,
        card_brand TEXT,
        card_exp_month INTEGER,
        card_exp_year INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS checkout_sessions (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        status TEXT NOT NULL DEFAULT 'open',
        success_url TEXT,
        cancel_url TEXT,
        amount_total INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'brl',
        payment_status TEXT NOT NULL DEFAULT 'unpaid',
        metadata TEXT DEFAULT '{}',
        expires_at TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS checkout_session_items (
        id TEXT PRIMARY KEY,
        checkout_session_id TEXT NOT NULL,
        price_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_amount INTEGER,
        amount_total INTEGER NOT NULL,
        currency TEXT DEFAULT 'brl',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (checkout_session_id) REFERENCES checkout_sessions(id),
        FOREIGN KEY (price_id) REFERENCES prices(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        checkout_session_id TEXT NOT NULL,
        payment_method_id TEXT,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL DEFAULT 'brl',
        status TEXT NOT NULL DEFAULT 'pending',
        error_message TEXT,
        metadata TEXT DEFAULT '{}',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (checkout_session_id) REFERENCES checkout_sessions(id),
        FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id)
      )
    `);
  }

  // get all products from database
  getProducts(active?: boolean): any[] {
    try {
      let products;
      if (active === true) {
        // get active products
        const stmt = this.db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY created_at DESC');
        products = stmt.all();
      } else if (active === false) {
        // get inactive products
        const stmt = this.db.prepare('SELECT * FROM products WHERE active = 0 ORDER BY created_at DESC');
        products = stmt.all();
      } else {
        // get all products
        const stmt = this.db.prepare('SELECT * FROM products ORDER BY created_at DESC');
        products = stmt.all();
      }

      // get prices for each product
      const result: any[] = [];
      for (let i = 0; i < products.length; i++) {
        const p = products[i] as any;
        // get the prices
        const priceStmt = this.db.prepare('SELECT * FROM prices WHERE product_id = ? AND active = 1 ORDER BY created_at DESC');
        const prices = priceStmt.all(p.id);

        // parse metadata
        let metadata = {};
        try {
          metadata = JSON.parse(p.metadata || '{}');
        } catch (e) {
          // ignore parse error
          metadata = {};
        }

        // build product object
        const productObj = {
          id: p.id,
          name: p.name,
          description: p.description,
          active: p.active === 1 ? true : false,
          metadata: metadata,
          prices: prices.map((pr: any) => {
            return {
              id: pr.id,
              product_id: pr.product_id,
              unit_amount: pr.unit_amount,
              currency: pr.currency,
              type: pr.type,
              recurring: pr.type === 'recurring' ? {
                interval: pr.recurring_interval,
                interval_count: pr.recurring_interval_count,
              } : null,
              active: pr.active === 1 ? true : false,
              created_at: pr.created_at,
            };
          }),
          created_at: p.created_at,
          updated_at: p.updated_at,
        };

        // add to result array
        result.push(productObj);
      }

      return result;
    } catch (e) {
      // return empty array on error
      return [];
    }
  }

  // get product by id
  getProductById(id: string): any {
    try {
      // get the product
      const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
      const p = stmt.get(id) as any;

      if (!p) {
        return null;
      }

      // get prices for the product
      const priceStmt = this.db.prepare('SELECT * FROM prices WHERE product_id = ? ORDER BY created_at DESC');
      const prices = priceStmt.all(p.id);

      // parse metadata
      let metadata = {};
      try {
        metadata = JSON.parse(p.metadata || '{}');
      } catch (e) {
        // ignore
        metadata = {};
      }

      // build result object
      const result = {
        id: p.id,
        name: p.name,
        description: p.description,
        active: p.active === 1 ? true : false,
        metadata: metadata,
        prices: prices.map((pr: any) => {
          return {
            id: pr.id,
            product_id: pr.product_id,
            unit_amount: pr.unit_amount,
            currency: pr.currency,
            type: pr.type,
            recurring: pr.type === 'recurring' ? {
              interval: pr.recurring_interval,
              interval_count: pr.recurring_interval_count,
            } : null,
            active: pr.active === 1 ? true : false,
            created_at: pr.created_at,
          };
        }),
        created_at: p.created_at,
        updated_at: p.updated_at,
      };

      return result;
    } catch (e) {
      // return null on error
      return null;
    }
  }

  // create checkout session
  createCheckoutSession(
    lineItems: Array<{ price_id: string; quantity: number }>,
    successUrl: string,
    cancelUrl: string,
    customerId: string | null,
    metadata: any,
  ): any {
    // generate session id
    const sessionId = 'cs_' + uuidv4();

    // validate customer exists if provided
    if (customerId) {
      const customerStmt = this.db.prepare('SELECT * FROM customers WHERE id = ?');
      const c = customerStmt.get(customerId);
      if (!c) {
        throw new Error('Cliente não encontrado: ' + customerId);
      }
    }

    // calculate total amount and validate items
    let totalAmount = 0;
    const itemsData: any[] = [];

    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      // get price from database
      const priceStmt = this.db.prepare('SELECT * FROM prices WHERE id = ?');
      const d = priceStmt.get(item.price_id) as any;

      if (!d) {
        throw new Error('Preço não encontrado: ' + item.price_id);
      }

      // check if price is active
      if (d.active !== 1) {
        throw new Error('Preço não está ativo: ' + item.price_id);
      }

      // get the product
      const productStmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
      const prod = productStmt.get(d.product_id) as any;

      if (!prod) {
        throw new Error('Produto não encontrado para o preço: ' + item.price_id);
      }

      // check if product is active
      if (prod.active !== 1) {
        throw new Error('Produto não está ativo: ' + prod.id);
      }

      // calculate amount for this line item
      const itemAmount = d.unit_amount * item.quantity;
      totalAmount = totalAmount + itemAmount;

      itemsData.push({
        id: 'li_' + uuidv4(),
        checkout_session_id: sessionId,
        price_id: item.price_id,
        product_id: d.product_id,
        quantity: item.quantity,
        amount_total: itemAmount,
      });
    }

    // set expiration to 30 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // serialize metadata to string
    let metadataStr = '{}';
    try {
      metadataStr = JSON.stringify(metadata || {});
    } catch (e) {
      metadataStr = '{}';
    }

    // insert the checkout session into database
    const insertStmt = this.db.prepare(`
      INSERT INTO checkout_sessions (id, customer_id, status, success_url, cancel_url, amount_total, currency, payment_status, metadata, expires_at, created_at, updated_at)
      VALUES (?, ?, 'open', ?, ?, ?, 'brl', 'unpaid', ?, ?, datetime('now'), datetime('now'))
    `);

    insertStmt.run(
      sessionId,
      customerId,
      successUrl,
      cancelUrl,
      totalAmount,
      metadataStr,
      expiresAt.toISOString(),
    );

    // insert all line items into the database
    for (let i = 0; i < itemsData.length; i++) {
      const li = itemsData[i];
      const liStmt = this.db.prepare(`
        INSERT INTO checkout_session_items (id, checkout_session_id, price_id, product_id, quantity, amount_total, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      liStmt.run(li.id, li.checkout_session_id, li.price_id, li.product_id, li.quantity, li.amount_total);
    }

    // return the created session
    const r = this.getCheckoutSession(sessionId);
    return r;
  }

  // get checkout session by id
  getCheckoutSession(id: string): any {
    try {
      // get the session from database
      const stmt = this.db.prepare('SELECT * FROM checkout_sessions WHERE id = ?');
      const s = stmt.get(id) as any;

      if (!s) {
        return null;
      }

      // get line items for this session
      const itemsStmt = this.db.prepare('SELECT * FROM checkout_session_items WHERE checkout_session_id = ?');
      const items = itemsStmt.all(id);

      // build line items array with product and price info
      const lineItems: any[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i] as any;

        // get price details from database
        const priceStmt = this.db.prepare('SELECT * FROM prices WHERE id = ?');
        const r = priceStmt.get(item.price_id) as any;

        // get product details from database
        const productStmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
        const prod = productStmt.get(item.product_id) as any;

        lineItems.push({
          id: item.id,
          price: r ? {
            id: r.id,
            unit_amount: r.unit_amount,
            currency: r.currency,
            type: r.type,
            recurring: r.type === 'recurring' ? {
              interval: r.recurring_interval,
              interval_count: r.recurring_interval_count,
            } : null,
          } : null,
          product: prod ? {
            id: prod.id,
            name: prod.name,
            description: prod.description,
          } : null,
          quantity: item.quantity,
          amount_total: item.amount_total,
        });
      }

      // parse metadata
      let metadata = {};
      try {
        metadata = JSON.parse(s.metadata || '{}');
      } catch (e) {
        metadata = {};
      }

      // check if session is expired
      let status = s.status;
      if (s.expires_at && new Date(s.expires_at) < new Date()) {
        if (status === 'open') {
          // update status to expired in the database
          const updateStmt = this.db.prepare("UPDATE checkout_sessions SET status = 'expired', updated_at = datetime('now') WHERE id = ?");
          updateStmt.run(id);
          status = 'expired';
        }
      }

      // build response object
      const result = {
        id: s.id,
        customer_id: s.customer_id,
        status: status,
        success_url: s.success_url,
        cancel_url: s.cancel_url,
        amount_total: s.amount_total,
        currency: s.currency,
        payment_status: s.payment_status,
        metadata: metadata,
        line_items: lineItems,
        expires_at: s.expires_at,
        created_at: s.created_at,
        updated_at: s.updated_at,
      };

      return result;
    } catch (e) {
      // return null on error
      return null;
    }
  }

  // process a payment for a checkout session
  processPayment(checkoutSessionId: string, paymentMethod: any): any {
    // get the checkout session from database
    const sessionStmt = this.db.prepare('SELECT * FROM checkout_sessions WHERE id = ?');
    const session = sessionStmt.get(checkoutSessionId) as any;

    if (!session) {
      throw new Error('Sessão de checkout não encontrada: ' + checkoutSessionId);
    }

    // check if session is still open
    if (session.status !== 'open') {
      if (session.status === 'expired') {
        throw new Error('Sessão de checkout expirada');
      }
      if (session.status === 'complete') {
        throw new Error('Sessão de checkout já foi paga');
      }
      throw new Error('Sessão de checkout não está aberta');
    }

    // check if session has expired by time
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      // update to expired in database
      const expStmt = this.db.prepare("UPDATE checkout_sessions SET status = 'expired', updated_at = datetime('now') WHERE id = ?");
      expStmt.run(checkoutSessionId);
      throw new Error('Sessão de checkout expirada');
    }

    // create payment method record in the database
    const pmId = 'pm_' + uuidv4();
    let cardLast4: string | null = null;
    let cardBrand: string | null = null;
    let cardExpMonth: number | null = null;
    let cardExpYear: number | null = null;

    if (paymentMethod.type === 'credit_card' || paymentMethod.type === 'debit_card') {
      // extract card details from payment method
      const cardNumber = paymentMethod.card.number.replace(/\s/g, '');
      cardLast4 = cardNumber.slice(-4);
      cardExpMonth = paymentMethod.card.exp_month;
      cardExpYear = paymentMethod.card.exp_year;

      // detect card brand based on first digit
      if (cardNumber.startsWith('4')) {
        cardBrand = 'visa';
      } else if (cardNumber.startsWith('5')) {
        cardBrand = 'mastercard';
      } else if (cardNumber.startsWith('3')) {
        cardBrand = 'amex';
      } else {
        cardBrand = 'unknown';
      }
    }

    // insert payment method into database
    const pmStmt = this.db.prepare(`
      INSERT INTO payment_methods (id, customer_id, type, card_last4, card_brand, card_exp_month, card_exp_year, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    pmStmt.run(pmId, session.customer_id, paymentMethod.type, cardLast4, cardBrand, cardExpMonth, cardExpYear);

    // create payment record
    const paymentId = 'pay_' + uuidv4();

    // simulate payment processing - 85% chance of success
    const random = Math.random();
    let paymentStatus = 'succeeded';
    let errorMessage: string | null = null;

    if (random > 0.85) {
      // payment failed - determine reason
      if (random > 0.95) {
        paymentStatus = 'failed';
        errorMessage = 'Cartão recusado: fundos insuficientes';
      } else if (random > 0.90) {
        paymentStatus = 'failed';
        errorMessage = 'Cartão recusado: cartão expirado';
      } else {
        paymentStatus = 'failed';
        errorMessage = 'Erro no processamento do pagamento';
      }
    }

    // insert the payment into database
    const payStmt = this.db.prepare(`
      INSERT INTO payments (id, checkout_session_id, payment_method_id, amount, currency, status, error_message, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'brl', ?, ?, '{}', datetime('now'), datetime('now'))
    `);
    payStmt.run(paymentId, checkoutSessionId, pmId, session.amount_total, paymentStatus, errorMessage);

    // update checkout session status based on payment result
    if (paymentStatus === 'succeeded') {
      // mark session as complete
      const updateStmt = this.db.prepare(`
        UPDATE checkout_sessions
        SET status = 'complete', payment_status = 'paid', updated_at = datetime('now')
        WHERE id = ?
      `);
      updateStmt.run(checkoutSessionId);
    } else {
      // mark session payment as failed but keep open
      const updateStmt = this.db.prepare(`
        UPDATE checkout_sessions
        SET payment_status = 'failed', updated_at = datetime('now')
        WHERE id = ?
      `);
      updateStmt.run(checkoutSessionId);
    }

    // build the response object
    const response = {
      id: paymentId,
      checkout_session_id: checkoutSessionId,
      payment_method: {
        id: pmId,
        type: paymentMethod.type,
        card: cardLast4 ? {
          last4: cardLast4,
          brand: cardBrand,
          exp_month: cardExpMonth,
          exp_year: cardExpYear,
        } : null,
      },
      amount: session.amount_total,
      currency: 'brl',
      status: paymentStatus,
      error_message: errorMessage,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return response;
  }

  // get payment by id
  getPaymentById(id: string): any {
    try {
      // get payment from database
      const stmt = this.db.prepare('SELECT * FROM payments WHERE id = ?');
      const pay = stmt.get(id) as any;

      if (!pay) {
        return null;
      }

      // get the payment method details
      let paymentMethod: any = null;
      if (pay.payment_method_id) {
        const pmStmt = this.db.prepare('SELECT * FROM payment_methods WHERE id = ?');
        const pm = pmStmt.get(pay.payment_method_id) as any;
        if (pm) {
          paymentMethod = {
            id: pm.id,
            type: pm.type,
            card: pm.card_last4 ? {
              last4: pm.card_last4,
              brand: pm.card_brand,
              exp_month: pm.card_exp_month,
              exp_year: pm.card_exp_year,
            } : null,
          };
        }
      }

      // parse metadata
      let metadata = {};
      try {
        metadata = JSON.parse(pay.metadata || '{}');
      } catch (e) {
        metadata = {};
      }

      // build response
      const result = {
        id: pay.id,
        checkout_session_id: pay.checkout_session_id,
        payment_method: paymentMethod,
        amount: pay.amount,
        currency: pay.currency,
        status: pay.status,
        error_message: pay.error_message,
        metadata: metadata,
        created_at: pay.created_at,
        updated_at: pay.updated_at,
      };

      return result;
    } catch (e) {
      // return null on error
      return null;
    }
  }

  // create a new customer
  createCustomer(email: string, name: string, metadata: any): any {
    // check if customer with this email already exists
    const checkStmt = this.db.prepare('SELECT * FROM customers WHERE email = ?');
    const existing = checkStmt.get(email);

    if (existing) {
      throw new Error('Cliente com este email já existe: ' + email);
    }

    // generate customer id
    const customerId = 'cus_' + uuidv4();

    // serialize metadata to string
    let metadataStr = '{}';
    try {
      metadataStr = JSON.stringify(metadata || {});
    } catch (e) {
      // ignore serialization error
      metadataStr = '{}';
    }

    // insert the customer into database
    const stmt = this.db.prepare(`
      INSERT INTO customers (id, email, name, metadata, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    stmt.run(customerId, email, name, metadataStr);

    // return created customer
    const r = this.getCustomerById(customerId);
    return r;
  }

  // get customer by id
  getCustomerById(id: string): any {
    try {
      // get the customer from database
      const stmt = this.db.prepare('SELECT * FROM customers WHERE id = ?');
      const c = stmt.get(id) as any;

      if (!c) {
        return null;
      }

      // parse metadata
      let metadata = {};
      try {
        metadata = JSON.parse(c.metadata || '{}');
      } catch (e) {
        // ignore error
        metadata = {};
      }

      // get payment methods for this customer
      const pmStmt = this.db.prepare('SELECT * FROM payment_methods WHERE customer_id = ? ORDER BY created_at DESC');
      const paymentMethods = pmStmt.all(id);

      // get checkout sessions for this customer
      const csStmt = this.db.prepare('SELECT * FROM checkout_sessions WHERE customer_id = ? ORDER BY created_at DESC');
      const sessions = csStmt.all(id);

      // get all payments for this customer by going through their sessions
      const payments: any[] = [];
      for (let i = 0; i < sessions.length; i++) {
        const s = sessions[i] as any;
        const payStmt = this.db.prepare('SELECT * FROM payments WHERE checkout_session_id = ? ORDER BY created_at DESC');
        const sessionPayments = payStmt.all(s.id);
        for (let j = 0; j < sessionPayments.length; j++) {
          payments.push(sessionPayments[j]);
        }
      }

      // calculate total spent by summing succeeded payments
      let totalSpent = 0;
      for (let i = 0; i < payments.length; i++) {
        const p = payments[i] as any;
        if (p.status === 'succeeded') {
          totalSpent = totalSpent + p.amount;
        }
      }

      // build result object
      const result = {
        id: c.id,
        email: c.email,
        name: c.name,
        metadata: metadata,
        payment_methods: paymentMethods.map((pm: any) => {
          return {
            id: pm.id,
            type: pm.type,
            card: pm.card_last4 ? {
              last4: pm.card_last4,
              brand: pm.card_brand,
              exp_month: pm.card_exp_month,
              exp_year: pm.card_exp_year,
            } : null,
            created_at: pm.created_at,
          };
        }),
        total_spent: totalSpent,
        sessions_count: sessions.length,
        payments_count: payments.length,
        created_at: c.created_at,
        updated_at: c.updated_at,
      };

      return result;
    } catch (e) {
      // swallow error and return null
      return null;
    }
  }
}
