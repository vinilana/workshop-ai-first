---
type: doc
name: project-overview
description: High-level overview of the project, its purpose, and key components
category: overview
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## What Is DOM Pagamentos?

DOM Pagamentos is a payment processing workshop platform. It is a teaching project designed to demonstrate the evolution from a legacy monolithic API to a Clean Architecture API, both running side by side and accessible through a unified API Gateway. It supports Brazilian payment methods: card, boleto, and pix.

## Quick Facts

- **Language:** TypeScript (strict mode) across all packages
- **Structure:** Monorepo managed with npm workspaces
- **Packages:** 6 workspace packages
- **Database:** SQLite via `better-sqlite3` (no ORM — raw SQL)
- **Backend framework:** NestJS 10
- **Frontend framework:** React 18 + Vite 5 + React Router 6
- **Payment methods:** `card`, `boleto`, `pix`

## Entry Points

### Backend Applications (NestJS)

| App | Port | Description |
|---|---|---|
| `packages/api-gateway` | 3000 | API Gateway — all client traffic enters here |
| `packages/api-core` | 3001 | Legacy monolithic API |
| `packages/api` | 3002 | Clean Architecture API |

### Frontend Applications (React + Vite)

| App | Port | Description |
|---|---|---|
| `packages/frontend-v1` | 5173 | Original frontend (reference) |
| `packages/frontend-v2` | 5174 | Active frontend (component-based) |

### Shared Library

| Package | Description |
|---|---|
| `packages/shared` | TypeScript types, DTOs, enumerations, constants |

## File Structure

```
dom-pagamentos/
├── data/
│   └── dom-pagamentos.sqlite       # Shared SQLite database file
├── packages/
│   ├── shared/                     # Cross-package types and utilities
│   ├── api-core/                   # Legacy NestJS API
│   │   └── src/
│   │       ├── app.controller.ts
│   │       └── app.service.ts
│   ├── api/                        # Clean Architecture NestJS API
│   │   └── src/
│   │       ├── products/
│   │       │   ├── domain/
│   │       │   ├── application/
│   │       │   ├── infrastructure/
│   │       │   └── presentation/
│   │       └── checkout/
│   │           ├── domain/
│   │           ├── application/
│   │           ├── infrastructure/
│   │           └── presentation/
│   ├── api-gateway/                # Proxy gateway
│   ├── frontend-v1/                # Original React app
│   └── frontend-v2/                # Active React app
│       └── src/
│           ├── services/           # API client modules
│           ├── hooks/              # Data-fetching hooks
│           ├── pages/              # Route components
│           └── components/         # Reusable UI components
├── package.json                    # Root workspace manifest
└── CLAUDE.md                       # AI agent guidance
```

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript 5.3 |
| Backend framework | NestJS 10 |
| Database driver | better-sqlite3 (raw SQL, WAL mode) |
| Frontend framework | React 18 |
| Frontend build | Vite 5 |
| Routing (frontend) | React Router 6 |
| Styling | CSS Modules |
| Input validation | class-validator (NestJS DTOs) |
| Multi-service runner | concurrently |
| Package manager | npm workspaces |

## Getting Started Checklist

1. Install dependencies and prepare the project:
   ```bash
   npm run first-run
   ```
2. Start all services:
   ```bash
   npm run dev
   ```
3. Open the frontend at `http://localhost:5174`
4. The API is accessible at `http://localhost:3000`
5. To reset the database at any time: `npm run seed:reset`
