---
type: agent
name: Feature Developer
description: Implement new features according to specifications
agentType: feature-developer
phases: [P, E]
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Adding a New Module to `packages/api`

Use the `products` module (`packages/api/src/products/`) as the reference implementation. Follow these steps in order:

### 1. Domain Layer

Create `src/<module>/domain/<module>.entity.ts` — plain TypeScript class, no NestJS decorators. Include a `toResponse()` method that returns a plain object safe to serialize.

Create `src/<module>/domain/<module>.repository.ts` — abstract class with method signatures only:
```ts
export abstract class WidgetRepository {
  abstract findAll(): Widget[];
  abstract findById(id: string): Widget | null;
}
```

### 2. Application Layer

One file per use case in `src/<module>/application/`. Each is `@Injectable()` and receives the abstract repository via constructor injection:
```ts
@Injectable()
export class GetWidgetsUseCase {
  constructor(private readonly widgetRepository: WidgetRepository) {}
  execute(): Widget[] { return this.widgetRepository.findAll(); }
}
```

### 3. Infrastructure Layer

Create `src/<module>/infrastructure/<module>.mapper.ts` with `interface XxxRow` (matching SQLite column names) and a `static toDomain()` method.

Create `src/<module>/infrastructure/sqlite-<module>.repository.ts` extending the abstract class, injecting `@Inject('DATABASE') private readonly db: Database.Database`.

### 4. Presentation Layer

Create DTOs in `src/<module>/presentation/` using `class-validator` decorators. Create the controller with `@Controller('<module>')`. Call use cases, return `entity.toResponse()`.

### 5. Module File

```ts
@Module({
  imports: [DatabaseModule],
  controllers: [WidgetController],
  providers: [
    { provide: WidgetRepository, useClass: SqliteWidgetRepository },
    GetWidgetsUseCase,
  ],
})
export class WidgetsModule {}
```

Register in `app.module.ts`.

### 6. Gateway

Add `src/<module>/<module>.controller.ts` and `<module>.module.ts` in `packages/api-gateway`. The controller calls `this.proxyService.forwardToApi(...)`. Register the module in the gateway's `app.module.ts`.

### 7. Database

Add `CREATE TABLE IF NOT EXISTS` in `packages/api-core/src/app.service.ts` and update the seed file. Run `npm run seed:reset`.
