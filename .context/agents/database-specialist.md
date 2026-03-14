---
type: agent
name: Database Specialist
description: Design and optimize database schemas
agentType: database-specialist
phases: [P, E]
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## Setup

- Driver: `better-sqlite3` (synchronous API — no async/await needed for queries)
- File: `data/dom-pagamentos.sqlite` (shared by all backend services)
- WAL mode enabled: `db.pragma('journal_mode = WAL')` and `db.pragma('foreign_keys = ON')` — see `packages/api/src/database/database.provider.ts`
- No ORM — all queries are raw prepared statements

## Schema

Schema is defined implicitly through `CREATE TABLE IF NOT EXISTS` statements in `packages/api-core/src/app.service.ts` constructor. Tables:

| Table | Key columns |
|---|---|
| `products` | `id TEXT PK`, `name`, `active INTEGER`, `created_at` |
| `prices` | `id TEXT PK`, `product_id FK`, `unit_amount INTEGER`, `currency`, `type` (`one_time`/`recurring`) |
| `customers` | `id TEXT PK`, `email UNIQUE`, `name` |
| `payment_methods` | `id TEXT PK`, `customer_id FK`, `type`, card fields |
| `checkout_sessions` | `id TEXT PK`, `customer_id FK`, `status`, `payment_status`, `amount_total INTEGER` |
| `checkout_session_items` | `id TEXT PK`, `checkout_session_id FK`, `price_id FK`, `product_id FK`, `quantity`, `amount_total` |
| `payments` | `id TEXT PK`, `checkout_session_id FK`, `payment_method_id FK`, `amount`, `status` |

Monetary amounts are stored as integers (centavos). Currency is always `brl`.

## Query Patterns

```ts
// single row
const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRow | undefined;

// multiple rows
const rows = db.prepare('SELECT * FROM prices WHERE product_id = ?').all(productId) as PriceRow[];

// write
db.prepare('INSERT INTO products (id, name) VALUES (?, ?)').run(id, name);
```

Always use parameterized queries — never string interpolation.

## Seeding

Run `npm run seed` (uses `packages/api-core/src/seed.ts`). To reset: `npm run seed:reset`. The seed file is the canonical source of sample data structure and ID prefixes (`prod_`, `price_`, `cus_`, `cs_`, `pm_`, `pay_`).

## Adding a Column

1. Add to the `CREATE TABLE` statement in `app.service.ts`
2. Update the corresponding `interface XxxRow` in the mapper file
3. Update `ProductMapper.toDomain()` (or equivalent) to map the new column
4. Run `npm run seed:reset` to rebuild the database with the new schema
