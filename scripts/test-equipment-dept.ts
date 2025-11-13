import { db } from "@/db";
import { equipment, departments } from "@/db/schema";
import { eq } from "drizzle-orm";

async function testEquipmentDept() {
  console.log("🔍 Testing Equipment with Department Join...\n");

  try {
    // Get first equipment with department join
    const result = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        departmentId: equipment.departmentId,
        department_name: departments.name,
      })
      .from(equipment)
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .limit(5);

    console.log("✅ Equipment with Departments:");
    result.forEach((item) => {
      console.log(`   ID: ${item.id}`);
      console.log(`   Name: ${item.name}`);
      console.log(`   Department ID: ${item.departmentId}`);
      console.log(`   Department Name: ${item.department_name || "NULL"}`);
      console.log();
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testEquipmentDept();

