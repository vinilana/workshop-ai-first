---
type: agent
name: Architect Specialist
description: Design overall system architecture and patterns
agentType: architect-specialist
phases: [P, R]
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## Monorepo Structure

Six npm workspace packages under `packages/`:
- `shared` — compiled TypeScript types, constants, utils; must be built first
- `api-core` — legacy NestJS monolith (port 3001): all logic lives in one `AppService`
- `api` — Clean Architecture NestJS (port 3002): the reference implementation
- `api-gateway` — proxy NestJS app (port 3000): the single entry point for all frontends
- `frontend-v1` — original React app (port 5173)
- `frontend-v2` — current React app (port 5174)

All packages share a single SQLite file at `data/dom-pagamentos.sqlite`.

## Clean Architecture Layers in `packages/api`

Each feature module (e.g., `products`, `checkout`) is structured identically:

```
src/<module>/
  domain/          # entities, value objects, abstract repository interface
  application/     # use cases — one class per use case
  infrastructure/  # SqliteXxxRepository (implements abstract), Mapper class
  presentation/    # NestJS @Controller, request/response DTOs
  <module>.module.ts
```

Dependency rule: domain has no imports from other layers. Application depends only on domain abstractions. Infrastructure and presentation depend inward, never on each other.

The NestJS module (`<module>.module.ts`) wires everything: it binds the abstract `XxxRepository` token to the concrete `SqliteXxxRepository` and lists use cases as providers.

## API Gateway Routing Pattern

`packages/api-gateway/src/proxy/proxy.service.ts` contains two methods:
- `forwardToApi(path, method, body, query)` — proxies to `api` (port 3002)
- `forwardToApiCore(path, method, body, query)` — proxies to `api-core` (port 3001)

Each gateway controller (e.g., `products/products.controller.ts`) chooses which backend to call. Currently products and checkout route to `api`; customers and payments route to `api-core`. Adding a new route means adding a controller+module in the gateway and calling the appropriate proxy method.

Gateway base URLs come from `packages/api-gateway/src/config/services.config.ts` via environment variables `API_URL` and `API_CORE_URL`.

## Key Design Decisions

- No ORM — all SQL is raw `better-sqlite3` prepared statements
- SQLite WAL mode enabled in `database.provider.ts` (pragma `journal_mode = WAL`)
- Boolean columns stored as INTEGER (0/1); mappers handle the conversion
- Payment simulation is random (85% success rate) — this is intentional for the workshop
- The gateway unwraps `{ data, success }` response envelopes automatically via the frontend's `apiRequest` helper
