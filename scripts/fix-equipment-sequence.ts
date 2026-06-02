import postgres from "postgres";
import { config } from "dotenv";

config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });

const before = await sql`
  SELECT
    (SELECT COALESCE(MAX(id), 0) FROM equipment) AS max_id,
    (SELECT last_value FROM equipment_id_seq) AS seq_last_value
`;

await sql`
  SELECT setval(
    'equipment_id_seq',
    COALESCE((SELECT MAX(id) FROM equipment), 1),
    true
  )
`;

const after = await sql`
  SELECT
    (SELECT COALESCE(MAX(id), 0) FROM equipment) AS max_id,
    (SELECT last_value FROM equipment_id_seq) AS seq_last_value,
    (SELECT is_called FROM equipment_id_seq) AS seq_is_called
`;

console.log("Before:", before[0]);
console.log("After:", after[0]);
await sql.end();
