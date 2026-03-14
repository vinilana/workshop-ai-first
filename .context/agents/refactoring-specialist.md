---
type: agent
name: Refactoring Specialist
description: Identify code smells and improvement opportunities
agentType: refactoring-specialist
phases: [E]
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Primary Refactoring Pattern: api-core → api

The main architectural improvement in this codebase is migrating logic from `packages/api-core` (monolith) to `packages/api` (Clean Architecture). The `AppService` in api-core mixes SQL, business rules, and response shaping in a single 700-line class.

### Identifying What to Migrate

Each method in `AppService` corresponds to a potential use case in `packages/api`:
- `getProducts()` → `GetProductsUseCase` (already done)
- `createCheckoutSession()` → `CreateCheckoutSessionUseCase` (already done)
- `createCustomer()` → candidate for migration
- `processPayment()` → candidate for migration

### Migration Steps for a Method

1. Identify the method's inputs, outputs, and side effects
2. Create a domain entity if none exists (e.g., `Customer`, `Payment`)
3. Extract the SQL into `SqliteXxxRepository` using the mapper pattern
4. Move business logic into a use case class
5. Add a controller in `packages/api` and a matching route in the gateway
6. Update the gateway controller to call `forwardToApi` instead of `forwardToApiCore`

### Code Smells in api-core to Watch For

- `any` typed variables throughout (all repository returns are `any`)
- Inline `JSON.parse` / `JSON.stringify` for metadata (no schema)
- Manual boolean conversion scattered everywhere (`p.active === 1 ? true : false`)
- N+1 query loops with explicit `for` loops instead of map/join
- Error swallowing with empty `catch (e) { return null; }` blocks

### Refactoring in `packages/api`

The Clean Architecture API is generally well-structured. Minor improvements:
- `ProductsController.findAll()` calls `product.toResponse()` inline — a dedicated response mapper could be cleaner
- Use cases that only delegate to the repository with no added logic could be simplified, but maintaining use cases consistently is preferable for testability
