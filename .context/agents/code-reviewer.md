---
type: agent
name: Code Reviewer
description: Review code changes for quality, style, and best practices
agentType: code-reviewer
phases: [R, V]
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Clean Architecture Boundary Checks

- Domain entities must not import from `application/`, `infrastructure/`, or `presentation/`.
- Use cases must not import from `infrastructure/` or `presentation/`; they depend only on abstract repository classes from `domain/`.
- Controllers must not instantiate repositories directly or call `db.prepare()` — all persistence goes through use cases.
- Mappers must not be called from controllers or use cases — only from repository implementations.

## DTO Validation

Every controller method that accepts a body must use a DTO class with `class-validator` decorators. Flag:
- Missing `@IsOptional()` on truly optional fields
- Missing `@Type(() => NestedClass)` when `@ValidateNested()` is used
- Response DTOs returned directly from domain entities (should use `toResponse()` or a dedicated DTO)

## Mapper Usage

The mapper's role is converting between raw SQLite row shapes and domain entities. Check that:
- `active` integer columns are converted to booleans (`row.active === 1`)
- `recurring_interval` nullability is handled (the column can be `null`)
- New columns added to the schema are reflected in both the `interface XxxRow` and the `toDomain` static method

## Type Safety

- Raw `any` types in repository queries should be avoided; use typed row interfaces (`ProductRow`, `PriceRow`, etc.)
- `db.prepare(...).all()` returns `unknown[]` — always cast with `as XxxRow[]`
- The shared package types in `packages/shared/src/types.ts` should be used for cross-package contracts

## Gateway Consistency

When a new endpoint is added to `packages/api`, verify a matching route exists in `packages/api-gateway`. The gateway controller should call `this.proxyService.forwardToApi(...)` — not re-implement logic.

## Monorepo Hygiene

- Changes to `packages/shared` require rebuilding (`npm run build:shared`) before other packages will see them
- Do not add direct `import` paths between packages; use the workspace package name (e.g., `@dom-pagamentos/shared`)
