---
type: agent
name: Frontend Specialist
description: Design and implement user interfaces
agentType: frontend-specialist
phases: [P, E]
generated: 2026-03-14
status: unfilled
scaffoldVersion: "2.0.0"
---

## Stack

React 18, React Router v6, Vite 5, TypeScript, CSS Modules. All work happens in `packages/frontend-v2/src/`. Ignore `packages/frontend-v1/`.

## API Layer

All requests go to the gateway at `http://localhost:3000`. The base fetch wrapper is `services/api.ts` — it automatically unwraps `{ data, success }` response envelopes from the Clean Architecture API. Use `apiRequest<T>(path, options)` for all calls.

Feature-specific service files: `services/products.service.ts`, `services/checkout.service.ts`, `services/payments.service.ts`.

## Custom Hooks Pattern

Data fetching lives in `hooks/`. Each hook manages `loading`, `error`, and data state. Example: `useProducts()` in `hooks/useProducts.ts` tracks a `filters` state and re-fetches when filters change using `useCallback` + `useEffect` with a cancellation guard.

When adding a new hook:
- Export `{ data, loading, error }` as minimum
- Use a cancelled flag in `useEffect` to prevent state updates after unmount
- Call the appropriate service function, not `fetch` directly

## Component Structure

Components live in `components/<ComponentName>/` with co-located `<ComponentName>.module.css`. Use CSS Modules for all styles — import as `import styles from './Foo.module.css'` and apply as `className={styles.container}`.

Global CSS variables are in `styles/variables.css`; global resets in `styles/global.css`.

## Routing

Routes are defined in `App.tsx` using React Router v6 `<Routes>` + `<Route>`. Current flow: `/` (ProductsPage) → `/checkout` (CheckoutPage) → `/success` or `/cancel`. Cart state is passed via React Router location state or lifted to a common ancestor.

## Payment Form

`components/PaymentForm/PaymentForm.tsx` handles card, boleto, and pix payment method selection. The `usePaymentForm` hook manages form state and submission. Card input formatting (spaces, expiry) is in `components/CardInput/`.

## Adding a New Page

1. Create `pages/<Name>/<Name>.tsx` and `<Name>.module.css`
2. Add a `<Route>` in `App.tsx`
3. Create a hook in `hooks/use<Name>.ts` for data fetching
4. Add a service function in the appropriate `services/` file
