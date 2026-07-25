import { readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("POSTGRES_URL_NON_POOLING or POSTGRES_URL is required.");
}

const migration = await readFile(
  new URL("../supabase/migrations/20260726000000_initial_schema.sql", import.meta.url),
  "utf8",
);
const sql = postgres(databaseUrl, {
  max: 1,
  ssl: "require",
  prepare: false,
});

try {
  await sql.unsafe(migration);
  console.log("Supabase schema migration completed.");
} finally {
  await sql.end();
}
