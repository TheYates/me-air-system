import postgres from "postgres";
import { config } from "dotenv";

// Load .env.local
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { prepare: false });

async function checkEquipment() {
  try {
    console.log("🔍 Checking equipment data...\n");

    // Get equipment with department info
    const equipment = await sql`
      SELECT
        e.id,
        e.name,
        e.department_id,
        d.name as department_name
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LIMIT 10;
    `;

    console.log(`✅ Found ${equipment.length} equipment records:\n`);

    equipment.forEach((eq: any) => {
      console.log(`  ID: ${eq.id}`);
      console.log(`  Name: ${eq.name}`);
      console.log(`  Department ID: ${eq.department_id || "NULL"}`);
      console.log(`  Department Name: ${eq.department_name || "NULL"}`);
      console.log("");
    });

    // Check how many equipment have no department
    const noDept = await sql`
      SELECT COUNT(*) as count
      FROM equipment
      WHERE department_id IS NULL
    `;

    console.log(`\n⚠️  Equipment without department: ${noDept[0].count}`);

    // Check total equipment
    const total = await sql`
      SELECT COUNT(*) as count
      FROM equipment
    `;

    console.log(`✅ Total equipment: ${total[0].count}`);

    // Check equipment with departments
    const withDept = await sql`
      SELECT COUNT(*) as count
      FROM equipment
      WHERE department_id IS NOT NULL
    `;

    console.log(`✅ Equipment with department: ${withDept[0].count}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

checkEquipment();
