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

async function testEquipmentAPI() {
  try {
    console.log("🔍 Testing equipment API query...\n");

    // Check for equipment with NULL department_name
    const nullDeptEquipment = await sql`
      SELECT
        e.id,
        e.name,
        e.department_id,
        d.name as "department_name",
        e.sub_unit
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE d.name IS NULL
      LIMIT 5
    `;

    console.log(
      `⚠️  Equipment with NULL department_name: ${nullDeptEquipment.length}\n`
    );

    if (nullDeptEquipment.length > 0) {
      console.log("Sample of equipment with NULL department:");
      nullDeptEquipment.forEach((eq: any) => {
        console.log(
          `  - ${eq.name} (ID: ${eq.id}, Dept ID: ${eq.department_id})`
        );
      });
      console.log("");
    }

    // Simulate the API query
    const equipment = await sql`
      SELECT
        e.id,
        e.name,
        e.manufacturer,
        e.tag_number as "tagNumber",
        e.status,
        e.department_id as "departmentId",
        d.name as "department_name",
        e.sub_unit as "subUnit",
        e.sub_unit as "sub_unit",
        e.model,
        e.serial_number as "serialNumber",
        e.purchase_type as "purchaseType",
        e.purchase_cost as "purchaseCost",
        e.purchase_cost as "purchase_cost",
        e.owner,
        e.created_at as "createdAt",
        e.updated_at as "updatedAt"
      FROM equipment e
      LEFT JOIN departments d ON e.department_id = d.id
      LIMIT 5;
    `;

    console.log(`✅ Found ${equipment.length} equipment records:\n`);

    equipment.forEach((eq: any) => {
      console.log(`Equipment: ${eq.name}`);
      console.log(`  Department ID: ${eq.departmentId}`);
      console.log(`  Department Name: ${eq.department_name}`);
      console.log(`  Sub Unit: ${eq.sub_unit}`);
      console.log("");
    });

    // Check the raw JSON structure
    console.log("\n📋 Raw JSON structure of first equipment:");
    if (equipment.length > 0) {
      console.log(JSON.stringify(equipment[0], null, 2));
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sql.end();
  }
}

testEquipmentAPI();
