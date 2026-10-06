/**
 * Tests run against a separate database (never the dev or production one):
 * TEST_DATABASE_URL, or the local dev server's tcbaza_test database
 * (started with `npm run db:dev`).
 */
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5433/tcbaza_test";
