import { readdir, readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL;

if (!databaseUrl) {
  throw new Error("POSTGRES_URL_NON_POOLING or POSTGRES_URL is required.");
}

const migrationsDirectory = new URL("../supabase/migrations/", import.meta.url);
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((file) => file.endsWith(".sql"))
  .sort();
const sql = postgres(databaseUrl, {
  max: 1,
  ssl: "require",
  prepare: false,
});

try {
  for (const file of migrationFiles) {
    const migration = await readFile(new URL(file, migrationsDirectory), "utf8");
    await sql.unsafe(migration);
    console.log(`Applied ${file}`);
  }
  console.log("Supabase schema migrations completed.");
} finally {
  await sql.end();
}
