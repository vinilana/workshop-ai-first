---
type: agent
name: Devops Specialist
description: Design and maintain CI/CD pipelines
agentType: devops-specialist
phases: [E, C]
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## This is a Workshop Project

There is no CI/CD pipeline, no Docker setup, and no deployment configuration. Everything runs locally via npm scripts. Do not add CI/CD tooling unless the workshop explicitly asks for it.

## npm Workspaces

The root `package.json` declares all packages under `packages/*`. Running `npm install` at the root installs dependencies for all packages. Do not run `npm install` inside individual package directories.

## Build Order

`packages/shared` must be compiled before any other package that imports from it:
```bash
npm run build:shared    # compiles shared TypeScript to dist/
npm run build:all       # builds all backend packages
```

If TypeScript errors appear referencing `@dom-pagamentos/shared`, the shared package is either not built or its `dist/` is stale.

## Development Scripts

The root `package.json` uses `concurrently` to run multiple services in parallel:
```bash
npm run dev    # starts api-core, api, gateway, and frontend-v2 concurrently
```

Individual service commands:
```bash
npm run dev:api-core      # port 3001
npm run dev:api           # port 3002
npm run dev:gateway       # port 3000
npm run dev:frontend-v2   # port 5174
```

## First-Time Setup

```bash
npm run first-run    # npm install + build:shared + seed
```

## Database Management

```bash
npm run seed          # insert sample data
npm run seed:reset    # drop and re-seed (useful after schema changes)
```

The SQLite file and WAL journal files (`-shm`, `-wal`) live in `data/`. They are gitignored — collaborators must run `seed` after cloning.

## Environment Variables

No `.env` files are used. The gateway reads `API_CORE_URL` and `API_URL` from the process environment, defaulting to `http://localhost:3001` and `http://localhost:3002` respectively.
