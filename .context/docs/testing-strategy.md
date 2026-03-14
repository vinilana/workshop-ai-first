---
type: doc
name: testing-strategy
description: Test frameworks, patterns, coverage requirements, and quality gates
category: testing
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Current State

DOM Pagamentos is a **workshop project**. No tests are currently implemented. The test infrastructure scaffolded by NestJS CLI is present but empty.

## Test Infrastructure (Available but Unused)

NestJS generates Jest configuration by default. Each NestJS package (`api-core`, `api`, `api-gateway`) includes:

- `jest` configuration in `package.json`
- `*.spec.ts` file pattern recognized by the test runner
- `@nestjs/testing` package available for module test utilities

### Test Commands

These commands are available in each NestJS package's `package.json`:

```bash
# From inside a package directory or via npm workspaces
npm test               # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage report
npm run test:e2e       # Run end-to-end tests (if configured)
```

No equivalent test setup exists for the React frontends at this time.

## Recommended Testing Approach (When Implementing)

Given the Clean Architecture structure of `packages/api`, the natural testing strategy is:

### Unit Tests — Domain Layer
Test entities and value objects in isolation. No framework dependencies; pure TypeScript.

### Unit Tests — Application Layer (Use Cases)
Mock repository interfaces and test use case logic. Repository interfaces in the domain layer make this straightforward with Jest mocks.

### Unit Tests — Infrastructure Layer (Mappers)
Test that DB row objects are correctly mapped to domain entities and back.

### Integration Tests — Repository Implementations
Use an in-memory or test SQLite database to verify SQL queries behave correctly end-to-end.

### E2E Tests — Presentation Layer
Use `@nestjs/testing` with `supertest` to spin up the NestJS application and test full HTTP request/response cycles.

## Quality Gates

No automated quality gates are currently configured. For a production adaptation the following would be recommended:

- Minimum coverage threshold (e.g., 80% line coverage on `packages/api`)
- CI pipeline running tests on every pull request
- Linting enforced via ESLint before merge
