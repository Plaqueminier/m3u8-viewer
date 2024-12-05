import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export function getDbConnection(): Promise<Database> {
  return open({
    filename: process.env.DATABASE_PATH!,
    driver: sqlite3.Database,
  });
}
