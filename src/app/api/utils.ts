import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";

let db: DatabaseType | null = null;

export function getDb(): DatabaseType {
  if (!db) {
    db = new Database(process.env.DATABASE_PATH!);
    // Enable foreign keys and WAL mode for better performance
    db.pragma('foreign_keys = ON');
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
