---
type: agent
name: Performance Optimizer
description: Identify performance bottlenecks
agentType: performance-optimizer
phases: [E, V]
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## SQLite Query Optimization

The current `SqliteProductRepository.findAll()` issues N+1 queries: one for products, then one per product for its prices. For a workshop dataset this is acceptable, but at scale use a JOIN:

```sql
SELECT p.*, pr.id as price_id, pr.unit_amount, ...
FROM products p
LEFT JOIN prices pr ON pr.product_id = p.id
ORDER BY p.created_at DESC
```

Then group rows in the mapper rather than issuing per-product queries.

`better-sqlite3` is synchronous, which means it blocks the Node.js event loop during queries. For heavy reads, consider batching or running queries in a worker thread. For this workshop, the synchronous API is fine.

WAL mode (already enabled) significantly improves concurrent read/write performance compared to the default journal mode.

## Gateway Overhead

Every request passes through the gateway's `ProxyService`, which uses `HttpService` (axios under the hood) to make an HTTP call to the backend. This adds one HTTP round-trip per request. For this project the latency is negligible (loopback), but be aware the gateway is not a zero-cost abstraction.

## Frontend Bundle Size

Vite handles code splitting automatically for route-based chunks. The current app has no heavy dependencies beyond React and React Router — bundle size is not a concern at workshop scale.

Check bundle composition with:
```bash
cd packages/frontend-v2 && npx vite build --reporter verbose
```

Avoid importing large utility libraries (lodash, moment) for simple operations — use native JS equivalents.

## Payment Simulation

The 85% random success rate in `AppService.processPayment()` is intentional for the workshop. Do not remove or optimize it — it is a feature, not a performance problem.
