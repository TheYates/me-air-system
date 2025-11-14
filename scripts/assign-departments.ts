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

async function assignDepartments() {
  try {
    console.log("🔍 Checking departments...\n");

    // Get all departments
    const departments = await sql`
      SELECT id, name 
      FROM departments 
      ORDER BY id
    `;

    if (departments.length === 0) {
      console.error("❌ No departments found. Please create departments first.");
      process.exit(1);
    }

    console.log(`✅ Found ${departments.length} departments:\n`);
    departments.forEach((dept: any) => {
      console.log(`  - ${dept.name} (ID: ${dept.id})`);
    });

    // Get unassigned equipment count
    const unassignedCount = await sql`
      SELECT COUNT(*) as count 
      FROM equipment 
      WHERE department_id IS NULL
    `;

    console.log(`\n⚠️  Unassigned equipment: ${unassignedCount[0].count}\n`);

    if (unassignedCount[0].count === 0) {
      console.log("✅ All equipment already assigned!");
      process.exit(0);
    }

    // Use the first department as default
    const defaultDept = departments[0];
    console.log(`📝 Assigning all unassigned equipment to: ${defaultDept.name}\n`);

    // Assign all unassigned equipment to the first department
    const result = await sql`
      UPDATE equipment 
      SET department_id = ${defaultDept.id}, updated_at = NOW()
      WHERE department_id IS NULL
      RETURNING id, name, department_id
    `;

    console.log(`✅ Successfully assigned ${result.length} equipment to ${defaultDept.name}\n`);

    // Show sample of assigned equipment
    console.log("Sample of assigned equipment:");
    result.slice(0, 5).forEach((eq: any) => {
      console.log(`  - ${eq.name} (ID: ${eq.id})`);
    });

    if (result.length > 5) {
      console.log(`  ... and ${result.length - 5} more`);
    }

    console.log("\n✅ Department assignment complete!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

assignDepartments();

