---
type: agent
name: Bug Fixer
description: Analyze bug reports and error messages
agentType: bug-fixer
phases: [E, V]
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## Common Issues and Fixes

### "Cannot find module '@dom-pagamentos/shared'"

The shared package has not been compiled. Run:
```bash
npm run build:shared
```
This must happen before starting any backend service. The `first-run` script handles this automatically on initial setup.

### Port Conflicts

Services bind to fixed ports: gateway=3000, api-core=3001, api=3002, frontend-v1=5173, frontend-v2=5174. If a port is in use:
```bash
lsof -i :3002    # find the PID
kill <PID>
```

### SQLite WAL Mode / Locked Database

The `.sqlite-shm` and `.sqlite-wal` files are WAL mode journal files. If a process crashed mid-write they can be left behind. To reset:
```bash
npm run seed:reset    # wipes and re-seeds the database
```
Do not manually delete `-shm`/`-wal` files while any service is running.

### Gateway Proxy Returns 503

The gateway forwards to `http://localhost:3001` or `http://localhost:3002`. If you get 503, check that the target service is running. Start individually with `npm run dev:api` or `npm run dev:api-core`.

### Gateway Returns 404 for a Valid Route

The gateway has its own set of controllers (in `packages/api-gateway/src/`). If you add a route to `packages/api` without adding a matching controller in the gateway, the gateway will 404.

### Validation Errors (400) from NestJS

DTOs require `class-validator` annotations and `class-transformer`. If a nested object fails validation, ensure you have `@ValidateNested({ each: true })` plus `@Type(() => NestedClass)` on the property.

### SQLite `active` Boolean Bug

SQLite stores booleans as integers. If you query `active` directly without going through the Mapper, you will get `0` or `1` instead of `true`/`false`. Always use `ProductMapper.toDomain()` (or equivalent) rather than returning raw rows.

### Frontend Shows Stale Data

The frontend hooks use `useEffect` + `fetch` — there is no caching layer. Hard-refresh the page or check that the gateway is running and the backend returned the expected response.
