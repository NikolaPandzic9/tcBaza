import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { getDb } from "@/server/db/client";

let migrated = false;

/** Fresh, migrated, empty test database for each test file. */
export async function resetDatabase() {
  const db = getDb();
  if (!migrated) {
    await migrate(db, { migrationsFolder: "./drizzle" });
    migrated = true;
  }
  await db.execute(sql`
    truncate table enrollments, payments, memberships, members, inquiries,
      content_versions, content_documents, media, audit_log, login_attempts,
      sessions, users, app_meta restart identity cascade
  `);
  return db;
}
