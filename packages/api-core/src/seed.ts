import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { DB_PATH } from './database';
import * as fs from 'fs';
import * as path from 'path';

// check for --reset flag
const shouldReset = process.argv.includes('--reset');

// ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

if (shouldReset) {
  console.log('Resetando banco de dados...');
  db.exec('DROP TABLE IF EXISTS payments');
  db.exec('DROP TABLE IF EXISTS checkout_session_items');
  db.exec('DROP TABLE IF EXISTS checkout_sessions');
  db.exec('DROP TABLE IF EXISTS payment_methods');
  db.exec('DROP TABLE IF EXISTS prices');
  db.exec('DROP TABLE IF EXISTS customers');
  db.exec('DROP TABLE IF EXISTS products');
  console.log('Tabelas removidas.');
}

// create tables
db.exec(`
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

db.exec(`
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

db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
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

db.exec(`
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

db.exec(`
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

db.exec(`
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

console.log('Tabelas criadas.');

// seed products and prices
const products = [
  {
    id: 'prod_' + uuidv4(),
    name: 'Plano Básico',
    description: 'Plano básico com funcionalidades essenciais para pequenos negócios',
    price: {
      unit_amount: 2990,
      type: 'recurring',
      recurring_interval: 'month',
    },
  },
  {
    id: 'prod_' + uuidv4(),
    name: 'Plano Pro',
    description: 'Plano profissional com recursos avançados e suporte prioritário',
    price: {
      unit_amount: 7990,
      type: 'recurring',
      recurring_interval: 'month',
    },
  },
  {
    id: 'prod_' + uuidv4(),
    name: 'Plano Enterprise',
    description: 'Plano enterprise com recursos ilimitados e suporte dedicado 24/7',
    price: {
      unit_amount: 29990,
      type: 'recurring',
      recurring_interval: 'month',
    },
  },
  {
    id: 'prod_' + uuidv4(),
    name: 'Consultoria Avulsa',
    description: 'Sessão de consultoria avulsa com especialista em pagamentos',
    price: {
      unit_amount: 45000,
      type: 'one_time',
      recurring_interval: null,
    },
  },
  {
    id: 'prod_' + uuidv4(),
    name: 'Setup Inicial',
    description: 'Configuração e setup inicial da plataforma de pagamentos',
    price: {
      unit_amount: 120000,
      type: 'one_time',
      recurring_interval: null,
    },
  },
  {
    id: 'prod_' + uuidv4(),
    name: 'Suporte Premium',
    description: 'Suporte premium com atendimento prioritário e SLA garantido',
    price: {
      unit_amount: 14990,
      type: 'recurring',
      recurring_interval: 'month',
    },
  },
];

// check if products already exist
const existingProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;

if (existingProducts.count === 0) {
  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, description, active, metadata, created_at, updated_at)
    VALUES (?, ?, ?, 1, '{}', datetime('now'), datetime('now'))
  `);

  const insertPrice = db.prepare(`
    INSERT INTO prices (id, product_id, unit_amount, currency, type, recurring_interval, recurring_interval_count, active, created_at)
    VALUES (?, ?, ?, 'brl', ?, ?, 1, 1, datetime('now'))
  `);

  for (const product of products) {
    insertProduct.run(product.id, product.name, product.description);

    const priceId = 'price_' + uuidv4();
    insertPrice.run(
      priceId,
      product.id,
      product.price.unit_amount,
      product.price.type,
      product.price.recurring_interval,
    );

    console.log(`Produto criado: ${product.name} (${product.id}) - R$ ${(product.price.unit_amount / 100).toFixed(2)}`);
  }
} else {
  console.log(`Produtos já existem (${existingProducts.count} encontrados). Pulando seed de produtos.`);
}

// seed customers
const customers = [
  {
    id: 'cus_' + uuidv4(),
    email: 'joao.silva@example.com',
    name: 'João Silva',
    metadata: JSON.stringify({ company: 'Silva & Associados', phone: '11999990001' }),
  },
  {
    id: 'cus_' + uuidv4(),
    email: 'maria.santos@example.com',
    name: 'Maria Santos',
    metadata: JSON.stringify({ company: 'Santos Digital', phone: '21999990002' }),
  },
  {
    id: 'cus_' + uuidv4(),
    email: 'pedro.oliveira@example.com',
    name: 'Pedro Oliveira',
    metadata: JSON.stringify({ company: 'Oliveira Tech', phone: '31999990003' }),
  },
];

const existingCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get() as any;

if (existingCustomers.count === 0) {
  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, email, name, metadata, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  for (const customer of customers) {
    insertCustomer.run(customer.id, customer.email, customer.name, customer.metadata);
    console.log(`Cliente criado: ${customer.name} (${customer.id})`);
  }
} else {
  console.log(`Clientes já existem (${existingCustomers.count} encontrados). Pulando seed de clientes.`);
}

db.close();
console.log('Seed concluído!');
