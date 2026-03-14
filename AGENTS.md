# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DOM Pagamentos is a payment processing platform built as a monorepo with npm workspaces. It demonstrates both a legacy monolithic API and a Clean Architecture API side-by-side, with an API Gateway routing between them.

## Commands

```bash
# First-time setup
npm run first-run          # install deps, build shared, seed database

# Development (starts all backends + frontend-v2)
npm run dev

# Individual services
npm run dev:api-core       # Legacy API on port 3001
npm run dev:api            # Clean Architecture API on port 3002
npm run dev:gateway        # API Gateway on port 3000
npm run dev:frontend-v2    # React frontend on port 5174

# Build
npm run build:shared       # Must build shared package first
npm run build:all          # Build all backend packages

# Database
npm run seed               # Seed with sample data
npm run seed:reset         # Reset and re-seed database
```

## Architecture

### Monorepo Structure (npm workspaces)

- **packages/shared** — Shared TypeScript types, constants, and utilities used by all packages
- **packages/api-core** (port 3001) — Legacy monolithic NestJS API with direct SQL queries in a single AppService
- **packages/api** (port 3002) — Clean Architecture NestJS API with DDD layers (domain, application, infrastructure, presentation)
- **packages/api-gateway** (port 3000) — Proxy that routes requests to api-core or api; this is the entry point for frontends
- **packages/frontend-v1** (port 5173) — Original React frontend
- **packages/frontend-v2** (port 5174) — Current React frontend with component-based architecture

### Clean Architecture API (packages/api)

Each module (products, checkout) follows this layer structure:
- **domain/** — Entities, Value Objects, abstract Repository interfaces
- **application/** — Use Cases (business logic orchestration)
- **infrastructure/** — SQLite repository implementations, DB-to-domain mappers
- **presentation/** — NestJS Controllers, DTOs with class-validator

### Database

SQLite via better-sqlite3 with WAL mode. Single database file at `data/dom-pagamentos.sqlite` shared by all API services. Tables: products, prices, customers, payment_methods, checkout_sessions, checkout_session_items, payments.

### Frontend (packages/frontend-v2)

React 18 + React Router v6 + Vite. All API calls go through the gateway (port 3000). Key directories:
- `services/` — API client layer (fetch wrapper + typed service modules)
- `hooks/` — Custom hooks for data fetching with loading/error states
- `pages/` — Route components (Products → Checkout → Success/Cancel)
- `components/` — Reusable UI (ProductCard, Cart, PaymentForm, ProductFilters)

### Request Flow

Frontend → API Gateway (3000) → API Core (3001) or Clean API (3002) → SQLite

## Tech Stack

- **Backend:** NestJS 10, TypeScript 5.3, better-sqlite3 (raw SQL, no ORM)
- **Frontend:** React 18, React Router 6, Vite 5, TypeScript, CSS Modules
- **Shared types** must be built before other packages (`npm run build:shared`)
- Payment methods: card, boleto, pix (Brazilian payment ecosystem)
## AI Context References
- Documentation index: `.context/docs/README.md`
- Agent playbooks: `.context/agents/README.md`

