/**
 * Apply supabase/schema.sql using direct Postgres connection.
 *
 * 1. Supabase Dashboard → Project Settings → Database
 * 2. Copy "Connection string" (URI mode, Session pooler)
 * 3. Add to .env as DATABASE_URL=postgresql://...
 * 4. Run: npm run db:setup
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "supabase", "schema.sql");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(`
❌ DATABASE_URL is missing from .env

Get it from Supabase Dashboard:
  Project Settings → Database → Connection string → URI

Example:
  DATABASE_URL=postgresql://postgres.dsavwopzaqvdickqjmew:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

Or run supabase/schema.sql manually in SQL Editor:
  https://supabase.com/dashboard/project/dsavwopzaqvdickqjmew/sql/new
`);
  process.exit(1);
}

const sql = readFileSync(schemaPath, "utf8");
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

try {
  console.log("Connecting to Supabase Postgres...");
  await client.connect();
  console.log("Applying schema...");
  await client.query(sql);
  console.log("✅ Schema applied successfully!");
  console.log("   Run: npm run seed   (optional test data)");
} catch (err) {
  console.error("❌ Schema apply failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end();
}
