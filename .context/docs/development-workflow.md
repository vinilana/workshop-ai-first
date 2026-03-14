---
type: doc
name: development-workflow
description: Day-to-day engineering processes, branching, and contribution guidelines
category: workflow
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Branching Strategy

This project uses trunk-based development. All work is merged directly to `main`. There are no long-lived feature branches. For workshop exercises, create short-lived branches named descriptively (e.g., `feature/add-payment-validation`) and merge via pull request or directly once verified locally.

## Local Development Setup

### First-time Setup

Run once after cloning to install all workspace dependencies, build the shared package, and seed the database:

```bash
npm run first-run
```

This is equivalent to:
```bash
npm install
npm run build:shared
npm run seed
```

### Starting All Services

```bash
npm run dev
```

Starts all backend services and `frontend-v2` concurrently using the `concurrently` package.

### Starting Individual Services

| Command | Service | Port |
|---|---|---|
| `npm run dev:api-core` | Legacy monolithic API | 3001 |
| `npm run dev:api` | Clean Architecture API | 3002 |
| `npm run dev:gateway` | API Gateway | 3000 |
| `npm run dev:frontend-v2` | React frontend (active) | 5174 |

### Build Commands

```bash
npm run build:shared   # Build shared types package — must run first after any shared changes
npm run build:all      # Build all backend packages
```

### Database Commands

```bash
npm run seed           # Seed database with sample products and data
npm run seed:reset     # Drop all data and re-seed from scratch
```

## Important: Build Order

`packages/shared` must be compiled before any other package is built or started, because all other packages import from it. If you modify anything in `packages/shared`, always run `npm run build:shared` before restarting services.

## Code Review Expectations

- Keep pull requests small and focused on a single change.
- Ensure the project starts cleanly with `npm run dev` after your change.
- If modifying `packages/shared`, verify that dependent packages still compile.
- DTOs must use `class-validator` decorators for input validation.
- Follow the Clean Architecture layer boundaries in `packages/api` — do not import infrastructure types in the domain layer.
- No business logic in the gateway or frontend service layers.
