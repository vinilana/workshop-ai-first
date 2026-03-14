---
type: doc
name: architecture
description: System architecture, layers, patterns, and design decisions
category: architecture
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## Architecture Overview

DOM Pagamentos is a monorepo (npm workspaces) that demonstrates two API implementation styles side by side, unified behind an API Gateway. The gateway pattern means frontends always talk to a single entry point (port 3000), and routing to the underlying service is transparent.

```
Frontend (5173 / 5174)
       |
API Gateway (3000)   ← single entry point for all clients
  /         \
api-core    api
 (3001)    (3002)
   \         /
    SQLite DB
```

## Monorepo Packages

| Package | Port | Role |
|---|---|---|
| `packages/shared` | — | Shared TypeScript types, constants, utilities |
| `packages/api-core` | 3001 | Legacy monolithic NestJS API (direct SQL in service layer) |
| `packages/api` | 3002 | Clean Architecture NestJS API (DDD layers) |
| `packages/api-gateway` | 3000 | Proxy / API Gateway routing to api-core or api |
| `packages/frontend-v1` | 5173 | Original React frontend |
| `packages/frontend-v2` | 5174 | Current React frontend (component-based architecture) |

## Architectural Layers

### shared
Contains all cross-package TypeScript types, DTOs, enumerations, and constants. Must be built before any other package (`npm run build:shared`).

### api-core (Legacy)
A single-layer monolithic NestJS app. Business logic, SQL queries, and HTTP controllers live together in `AppService` / `AppController`. Useful as a before-state contrast to the Clean Architecture API.

### api (Clean Architecture + DDD)
Each domain module (`products`, `checkout`) follows a strict four-layer structure:

- **domain/** — Entities, Value Objects, and abstract Repository interfaces. No framework dependencies.
- **application/** — Use Cases that orchestrate domain objects. Each use case is a single-responsibility class.
- **infrastructure/** — Concrete SQLite repository implementations using `better-sqlite3`. DB-to-domain Mappers live here.
- **presentation/** — NestJS Controllers and DTOs validated with `class-validator`.

### api-gateway
A thin NestJS proxy using the Proxy pattern. It receives all frontend requests and forwards them to either `api-core` or `api` based on route configuration. No business logic lives here.

### frontends (frontend-v1, frontend-v2)
React 18 applications built with Vite. `frontend-v2` is the active frontend and uses:
- `services/` — fetch-based API client with typed service modules
- `hooks/` — custom data-fetching hooks with loading/error states
- `pages/` — route components (Products → Checkout → Success/Cancel)
- `components/` — reusable UI components

## Design Patterns

| Pattern | Where used |
|---|---|
| Repository | `api` infrastructure layer — abstracts SQLite access behind interfaces defined in domain |
| Use Case | `api` application layer — one class per business operation |
| Mapper | `api` infrastructure layer — converts between DB rows and domain entities |
| Proxy | `api-gateway` — forwards HTTP requests without business logic |
| NestJS Module | All NestJS packages — encapsulates providers, controllers, imports per feature |

## Entry Points

Each NestJS application has a `main.ts` bootstrap function:

- `packages/api-core/src/main.ts` — bootstraps legacy API on port 3001
- `packages/api/src/main.ts` — bootstraps Clean Architecture API on port 3002
- `packages/api-gateway/src/main.ts` — bootstraps gateway on port 3000

## Public API — Key Exports from `packages/shared`

| Export | Kind | Description |
|---|---|---|
| `Product` | interface | Product entity with id, name, description, prices |
| `Price` | interface | Price entry with amount (cents), currency, type |
| `Customer` | interface | Customer with id, name, email, address |
| `Address` | interface | Street, city, state, postal code, country |
| `PaymentMethod` | interface | Payment method linked to a customer |
| `CardDetails` | interface | Masked card data (last4, brand, expiry) |
| `CheckoutSession` | interface | Session with line items, status, payment intent |
| `LineItem` | interface | Product + quantity + price snapshot in a session |
| `Payment` | interface | Payment record with method, amount, status |
| `CreateCheckoutSessionDto` | DTO | Input for creating a new checkout session |
| `ProcessPaymentDto` | DTO | Input for processing a payment on a session |
| `ApiResponse<T>` | generic | Standard envelope `{ data, error, message }` |
| `Currency` | enum | Supported currencies (e.g., `BRL`) |
| `PaymentMethodType` | enum | `card`, `boleto`, `pix` |
| `CheckoutSessionStatus` | enum | `open`, `complete`, `expired` |
