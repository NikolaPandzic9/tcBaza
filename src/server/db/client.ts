import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

/** True once a database is configured. Without it the public site serves
 * its built-in default content and the ERP shows a setup notice. */
export const hasDatabase = Boolean(process.env.DATABASE_URL);

const globalForDb = globalThis as unknown as { __tcbazaDb?: Database; __tcbazaSql?: postgres.Sql };

function createDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL nije postavljen.");

  const client = postgres(url, {
    // Serverless functions are short-lived and Neon's pooler multiplexes;
    // a small per-instance pool is enough and avoids exhausting it.
    max: Number(process.env.DATABASE_POOL_SIZE ?? 5),
    idle_timeout: 20,
    connect_timeout: 10,
    // Neon's transaction-mode pooler doesn't support prepared statements.
    prepare: false,
    onnotice: () => {},
  });

  globalForDb.__tcbazaSql = client;
  return drizzle(client, { schema });
}

/** Closes the pool — for CLI scripts, so the process can exit. */
export async function closeDb() {
  await globalForDb.__tcbazaSql?.end();
  globalForDb.__tcbazaDb = undefined;
  globalForDb.__tcbazaSql = undefined;
}

/** One client per process — also survives Next dev hot reloads. */
export function getDb(): Database {
  globalForDb.__tcbazaDb ??= createDb();
  return globalForDb.__tcbazaDb;
}
