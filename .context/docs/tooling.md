---
type: doc
name: tooling
description: Scripts, IDE settings, automation, and developer productivity tips
category: tooling
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## Runtime and Package Management

### Node.js + npm Workspaces
The project requires Node.js (LTS recommended). All six packages are declared as workspaces in the root `package.json`. Running `npm install` from the root installs dependencies for all packages in a single `node_modules` hoisted tree.

Key workspace commands:
```bash
npm install                        # Install all workspace dependencies
npm run <script>                   # Run a root-level script
npm run <script> -w packages/api   # Run a script in a specific workspace
```

## Backend Tooling

### NestJS CLI
Used to scaffold and manage NestJS applications in `api-core`, `api`, and `api-gateway`. Provides code generation for modules, controllers, services, and more.

```bash
npx @nestjs/cli generate module products   # Example: generate a new module
```

Each NestJS package uses `ts-jest` or `@nestjs/testing` + Jest for unit and e2e tests.

### TypeScript Compiler (`tsc`)
Each package has its own `tsconfig.json` extending a root base config. The `packages/shared` package must be compiled to JavaScript (`dist/`) before other packages can import from it.

```bash
npm run build:shared   # Compiles packages/shared → packages/shared/dist/
npm run build:all      # Compiles all backend packages
```

### better-sqlite3
Synchronous SQLite driver used in both `api-core` and `api`. No ORM — all queries are raw SQL strings. The database runs in WAL mode for concurrent read performance.

Database file location: `data/dom-pagamentos.sqlite`

## Frontend Tooling

### Vite
Build tool and dev server for both React frontends. Provides fast HMR (Hot Module Replacement) during development.

```bash
npm run dev:frontend-v2   # Starts Vite dev server on port 5174
```

### React 18
Both frontends use React 18 with functional components and hooks. `frontend-v2` uses React Router 6 for client-side navigation.

### CSS Modules
Scoped component styles in `frontend-v2`. Each component can have a `.module.css` file.

## Developer Productivity

### concurrently
Used in the root `npm run dev` script to start all services (api-core, api, api-gateway, frontend-v2) in parallel within a single terminal session, with color-coded output per service.

```bash
npm run dev   # Starts all services concurrently
```

### class-validator + class-transformer
Used in NestJS DTOs for automatic request body validation. Decorators like `@IsString()`, `@IsEnum()`, and `@ArrayMinSize()` are used in the presentation layer of `packages/api`.

## Root npm Scripts Reference

| Script | Description |
|---|---|
| `npm run first-run` | Install deps, build shared, seed database |
| `npm run dev` | Start all services concurrently |
| `npm run dev:api-core` | Start legacy API on port 3001 |
| `npm run dev:api` | Start Clean Architecture API on port 3002 |
| `npm run dev:gateway` | Start API Gateway on port 3000 |
| `npm run dev:frontend-v2` | Start React frontend on port 5174 |
| `npm run build:shared` | Compile shared package |
| `npm run build:all` | Compile all backend packages |
| `npm run seed` | Seed database with sample data |
| `npm run seed:reset` | Reset and re-seed database |
