import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

/**
 * Database layer.
 *
 * The product is designed around a relational database with server-side
 * authorization (the PRD's "Row Level Security" equivalent). This module is
 * the single place that talks to the database, so it can be swapped for
 * Supabase/PostgreSQL later without touching route handlers or pages.
 */

let instance: DatabaseSync | null = null;

export function getDbPath(): string {
  const configured = process.env.DATABASE_PATH || ".data/rootquest.sqlite";
  return path.isAbsolute(configured)
    ? configured
    : path.join(process.cwd(), configured);
}

function sanitizeParam(param: unknown): SQLInputValue {
  if (param === undefined) return null;
  if (typeof param === "boolean") return param ? 1 : 0;
  if (param === null) return null;
  if (
    typeof param === "string" ||
    typeof param === "number" ||
    typeof param === "bigint"
  ) {
    return param;
  }
  if (param instanceof Uint8Array) return param;
  // Dates and other objects are serialized; this layer only ever passes
  // primitives, JSON strings, and null.
  return String(param);
}

export function getDb(): DatabaseSync {
  if (instance) return instance;
  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  instance = new DatabaseSync(dbPath);
  instance.exec("PRAGMA journal_mode = WAL;");
  instance.exec("PRAGMA foreign_keys = ON;");
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  instance.exec(fs.readFileSync(schemaPath, "utf8"));
  return instance;
}

/** Close and forget the cached connection (used by tests). */
export function resetDbConnection(): void {
  if (instance) {
    try {
      instance.close();
    } catch {
      // already closed
    }
  }
  instance = null;
}

/**
 * node:sqlite returns rows as null-prototype objects, which cannot be passed
 * from Server Components to Client Components (React serializes props with
 * JSON). Normalize every row to a plain object here, once, for all callers.
 */
function toPlain<T>(row: unknown): T {
  return (row === null || row === undefined ? row : { ...(row as object) }) as T;
}

export const db = {
  all<T = Record<string, unknown>>(
    sql: string,
    ...params: unknown[]
  ): T[] {
    const rows = getDb()
      .prepare(sql)
      .all(...params.map(sanitizeParam));
    return rows.map((row) => toPlain<T>(row));
  },
  get<T = Record<string, unknown>>(
    sql: string,
    ...params: unknown[]
  ): T | undefined {
    return toPlain<T>(
      getDb()
        .prepare(sql)
        .get(...params.map(sanitizeParam))
    );
  },
  run(
    sql: string,
    ...params: unknown[]
  ): { changes: number | bigint; lastInsertRowid: number | bigint } {
    return getDb().prepare(sql).run(...params.map(sanitizeParam));
  },
  exec(sql: string): void {
    getDb().exec(sql);
  },
};

/** Run a function inside a transaction; rolls back on error. */
export function withTransaction<T>(fn: () => T): T {
  const database = getDb();
  database.exec("BEGIN");
  try {
    const result = fn();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
