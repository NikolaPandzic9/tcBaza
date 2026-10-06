/**
 * Local PostgreSQL for development and tests — a real Postgres server
 * (embedded-postgres ships the binaries), so local behaviour matches Neon
 * in production. Data lives in .data/postgres (git-ignored).
 *
 *   npm run db:dev      → starts the server and keeps it running
 *
 * Connection string for .env.local:
 *   DATABASE_URL=postgres://postgres:postgres@localhost:5433/tcbaza
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { join } from "node:path";

const dataDir = join(process.cwd(), ".data", "postgres");
const port = Number(process.env.DEV_DB_PORT ?? 5433);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port,
  persistent: true,
  // Windows defaults initdb to the system code page (WIN1252), which can't
  // store č/ć/š/đ/ž — force UTF-8, matching Neon in production.
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: () => {},
});

async function main() {
  const fresh = !existsSync(join(dataDir, "PG_VERSION"));
  if (fresh) await pg.initialise();
  await pg.start();

  for (const name of ["tcbaza", "tcbaza_test"]) {
    try {
      await pg.createDatabase(name);
    } catch {
      // Already exists.
    }
  }

  console.log(`PostgreSQL radi na postgres://postgres:postgres@localhost:${port}/tcbaza`);

  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
