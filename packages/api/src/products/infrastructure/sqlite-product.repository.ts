import { Injectable, Inject } from '@nestjs/common';
import Database from 'better-sqlite3';
import { ProductRepository } from '../domain/product.repository';
import { Product } from '../domain/product.entity';
import { ProductMapper, ProductRow, PriceRow } from './product.mapper';

@Injectable()
export class SqliteProductRepository extends ProductRepository {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {
    super();
  }

  findAll(): Product[] {
    const productRows = this.db
      .prepare('SELECT * FROM products ORDER BY created_at DESC')
      .all() as ProductRow[];

    return productRows.map((row) => {
      const priceRows = this.db
        .prepare('SELECT * FROM prices WHERE product_id = ?')
        .all(row.id) as PriceRow[];
      return ProductMapper.toDomain(row, priceRows);
    });
  }

  findById(id: string): Product | null {
    const row = this.db
      .prepare('SELECT * FROM products WHERE id = ?')
      .get(id) as ProductRow | undefined;

    if (!row) return null;

    const priceRows = this.db
      .prepare('SELECT * FROM prices WHERE product_id = ?')
      .all(id) as PriceRow[];

    return ProductMapper.toDomain(row, priceRows);
  }
}
