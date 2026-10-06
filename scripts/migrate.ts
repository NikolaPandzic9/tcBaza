/**
 * Applies database migrations, imports the initial content and creates the
 * first admin — all idempotent, so it runs safely before every build.
 *
 *   npm run db:migrate
 *
 * Without DATABASE_URL it does nothing (the site then serves its built-in
 * content), so local builds without a database keep working.
 */
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDb, getDb } from "@/server/db/client";
import { ensureInitialAdmin, seedContent } from "@/server/seed";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL nije postavljen — preskačem migracije.");
    return;
  }
  const db = getDb();
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migracije primijenjene.");
  await seedContent(db);
  await ensureInitialAdmin(db);
  await closeDb();
}

main().catch((error) => {
  const cause = error instanceof Error && error.cause ? ` — ${String(error.cause)}` : "";
  console.error(error instanceof Error ? `${error.message}${cause}` : error);
  process.exit(1);
});
