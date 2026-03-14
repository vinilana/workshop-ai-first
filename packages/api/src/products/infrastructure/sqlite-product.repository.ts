import { Injectable, Inject } from '@nestjs/common';
import Database from 'better-sqlite3';
import { ProductRepository, ProductFilters } from '../domain/product.repository';
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

  findByFilters(filters: ProductFilters): Product[] {
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.name !== undefined) {
      conditions.push('p.name LIKE ?');
      params.push(`%${filters.name}%`);
    }

    if (filters.active !== undefined) {
      conditions.push('p.active = ?');
      params.push(filters.active ? 1 : 0);
    }

    if (filters.priceType !== undefined) {
      conditions.push(
        'EXISTS (SELECT 1 FROM prices pr WHERE pr.product_id = p.id AND pr.type = ?)',
      );
      params.push(filters.priceType);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const productRows = this.db
      .prepare(
        `SELECT p.* FROM products p ${whereClause} ORDER BY p.created_at DESC`,
      )
      .all(...params) as ProductRow[];

    return productRows.map((row) => {
      const priceRows = this.db
        .prepare('SELECT * FROM prices WHERE product_id = ?')
        .all(row.id) as PriceRow[];
      return ProductMapper.toDomain(row, priceRows);
    });
  }
}
