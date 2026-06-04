import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });

try {
  const result = await sql`SELECT NOW() as current_time`;
  console.log("DB ping successful:", result[0].current_time);
} catch (error) {
  console.error("DB ping failed:", error);
  process.exit(1);
} finally {
  await sql.end();
}
