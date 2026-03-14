import Database from 'better-sqlite3';
import * as path from 'path';

// database path
export const DB_PATH = path.resolve(__dirname, '..', '..', '..', 'data', 'dom-pagamentos.sqlite');

// get database
export function getDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}
