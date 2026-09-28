import { neon } from "@neondatabase/serverless";

// Vercel's native Neon integration sets DATABASE_URL. POSTGRES_URL is kept as
// a fallback for older Vercel Postgres projects that haven't been relabelled.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL (or POSTGRES_URL) is not set.");
}

export const sql = neon(connectionString);
