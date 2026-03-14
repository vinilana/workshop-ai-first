---
type: agent
name: Test Writer
description: Write comprehensive unit and integration tests
agentType: test-writer
phases: [E, V]
generated: 2026-03-14
status: filled
scaffoldVersion: "2.0.0"
---

## Current State

There are no tests in the repository yet. This is a workshop project — tests are the natural next step after understanding the architecture.

## Testing Use Cases

Use cases are the highest-value test targets. They have no framework dependencies — just inject a mock repository:

```ts
describe('GetProductsUseCase', () => {
  it('returns all products from repository', () => {
    const mockRepo = { findAll: jest.fn().mockReturnValue([mockProduct]) };
    const useCase = new GetProductsUseCase(mockRepo as any);
    expect(useCase.execute()).toEqual([mockProduct]);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });
});
```

## Testing Controllers with NestJS Testing Module

```ts
const module = await Test.createTestingModule({
  controllers: [ProductsController],
  providers: [
    { provide: GetProductsUseCase, useValue: { execute: jest.fn().mockReturnValue([]) } },
    { provide: GetProductByIdUseCase, useValue: { execute: jest.fn() } },
    { provide: FilterProductsUseCase, useValue: { execute: jest.fn() } },
  ],
}).compile();
const controller = module.get(ProductsController);
```

## Mocking the Database / Repository

For repository unit tests, create an in-memory SQLite database:
```ts
import Database from 'better-sqlite3';
const db = new Database(':memory:');
db.pragma('journal_mode = WAL');
// run CREATE TABLE statements here
const repo = new SqliteProductRepository(db);
```

This is faster and safer than touching the real `data/dom-pagamentos.sqlite`.

## Mapper Tests

Mappers are pure functions — test them directly without any mocks:
```ts
it('converts active integer to boolean', () => {
  const row: ProductRow = { id: '1', name: 'Test', active: 0, ... };
  const product = ProductMapper.toDomain(row, []);
  expect(product.isActive()).toBe(false);
});
```

## Test File Location

NestJS convention: place test files adjacent to source files as `*.spec.ts`. Jest is already configured in NestJS's default `package.json` — run with:
```bash
cd packages/api && npx jest
```
