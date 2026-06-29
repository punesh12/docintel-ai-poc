import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

dotenv.config({ path: join(root, ".env.local") });
dotenv.config({ path: join(root, ".env") });

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(
  /https:\/\/([^.]+)\.supabase\.co/
)?.[1];

const connectionString =
  process.env.DATABASE_URL ??
  process.env.SUPABASE_DB_URL ??
  (process.env.SUPABASE_DB_PASSWORD && projectRef
    ? `postgresql://postgres:${encodeURIComponent(process.env.SUPABASE_DB_PASSWORD)}@db.${projectRef}.supabase.co:5432/postgres`
    : undefined);

if (!connectionString) {
  console.error(
    "Missing database connection. Add one of these to .env.local:\n" +
      "  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres\n" +
      "  SUPABASE_DB_PASSWORD=[your database password]\n\n" +
      "Find the password in Supabase Dashboard → Project Settings → Database."
  );
  process.exit(1);
}

const migrationPath = join(
  root,
  "supabase/migrations/20240628000000_documents_and_storage.sql"
);
const sql = readFileSync(migrationPath, "utf8");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected. Running migration...");
  await client.query(sql);
  console.log("Migration completed successfully.");
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.end();
}
