import { Provider } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

export const DATABASE_TOKEN = 'DATABASE';

export const databaseProvider: Provider = {
  provide: DATABASE_TOKEN,
  useFactory: (): Database.Database => {
    const dbPath = path.resolve(__dirname, '..', '..', '..', '..', 'data', 'dom-pagamentos.sqlite');
    const db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    return db;
  },
};
