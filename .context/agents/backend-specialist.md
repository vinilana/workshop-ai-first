---
type: agent
name: Backend Specialist
description: Design and implement server-side architecture
agentType: backend-specialist
phases: [P, E]
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Working in `packages/api` (Clean Architecture)

### NestJS Module Registration

Each module file binds the abstract repository token to its concrete implementation:

```ts
{ provide: ProductRepository, useClass: SqliteProductRepository }
```

Use cases are listed as plain providers. The `DatabaseModule` must be imported to get the `'DATABASE'` injection token.

### Use Cases

One class per operation, injected with `@Injectable()`. Constructor receives the abstract repository (NestJS resolves the concrete class). The `execute()` method contains all business logic — no `@Get`/`@Post` decorators here.

### Repositories

Abstract class in `domain/` defines the interface. Concrete `SqliteXxxRepository` in `infrastructure/` extends it and injects `@Inject('DATABASE') private readonly db: Database.Database`. All queries use `db.prepare(...).all()`, `.get()`, or `.run()`. Boolean columns (`active`) come back as `0`/`1` integers — the Mapper handles conversion.

### Mappers

Located in `infrastructure/xxx.mapper.ts`. Define `interface XxxRow` matching the raw SQLite column names (snake_case, integers for booleans). Static `toDomain(row, ...)` returns domain entities. Never call a mapper from a controller; call it from the repository.

### Adding a New Endpoint

1. Create `domain/xxx.entity.ts` and `domain/xxx.repository.ts` (abstract class)
2. Create `application/do-something.use-case.ts`
3. Create `infrastructure/xxx.mapper.ts` and `infrastructure/sqlite-xxx.repository.ts`
4. Create `presentation/xxx.controller.ts` and DTOs with `class-validator` decorators
5. Create `xxx.module.ts` wiring them together, import `DatabaseModule`
6. Register the new module in `app.module.ts`
7. Add a corresponding controller in `packages/api-gateway` to expose it

### `packages/api-core` (Legacy)

All logic is in `AppService`. SQL, business rules, and response shaping are mixed together. Do not add new features here — migrate to `packages/api` instead.

### Validation

DTOs use `class-validator` annotations (`@IsString()`, `@IsArray()`, `@ValidateNested()`, etc.). NestJS global `ValidationPipe` is configured in `main.ts`. Always use `@Type(() => NestedClass)` from `class-transformer` for nested object validation.
