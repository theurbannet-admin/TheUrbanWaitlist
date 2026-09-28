// Applies migrations/001_init.sql against DATABASE_URL.
//
// Run once after the Vercel Postgres (Neon) database exists:
//   vercel env pull .env.development.local        (pulls DATABASE_URL from Vercel)
//   node --env-file=.env.development.local scripts/migrate.mjs
//
// (Node 20.6+ is required for --env-file. On an older Node, `export` the
// variables from .env.development.local into the shell instead.)

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  console.error(
    "DATABASE_URL is not set. Run `vercel env pull .env.development.local` " +
      "first, then re-run this script with " +
      "`node --env-file=.env.development.local scripts/migrate.mjs`.",
  );
  process.exit(1);
}

const { sql } = await import("../lib/sql.js");

const migrationPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
  "001_init.sql",
);

const migration = await readFile(migrationPath, "utf8");

// Neon's HTTP driver runs one statement per call, so a multi-statement file
// is split on `;` and applied in order. None of migrations/001_init.sql's
// statements contain a semicolon inside a string or comment, so a plain
// split is safe here — this is not a general-purpose SQL statement splitter.
const statements = migration
  .split(";")
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Migration applied: 001_init.sql (${statements.length} statement(s))`);
process.exit(0);
