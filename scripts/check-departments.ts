import { db } from "@/db";
import { equipment, departments } from "@/db/schema";
import { sql } from "drizzle-orm";

async function checkDepartments() {
  console.log("🔍 Checking Department IDs in Equipment...\n");

  try {
    // Get all departments
    const allDepts = await db.select().from(departments);
    console.log("📋 Available Departments:");
    allDepts.forEach((dept) => {
      console.log(`   ID: ${dept.id} - ${dept.name}`);
    });
    console.log();

    // Get equipment with null or 0 departmentId
    const unassignedEquip = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        departmentId: equipment.departmentId,
      })
      .from(equipment)
      .where(sql`${equipment.departmentId} IS NULL OR ${equipment.departmentId} = 0`);

    console.log(`⚠️  Equipment with NULL/0 departmentId: ${unassignedEquip.length}`);
    if (unassignedEquip.length > 0) {
      console.log("   First 5:");
      unassignedEquip.slice(0, 5).forEach((equip) => {
        console.log(`      - ${equip.name} (departmentId: ${equip.departmentId})`);
      });
    }
    console.log();

    // Get distribution of departmentIds
    const distribution = await db
      .select({
        departmentId: equipment.departmentId,
        count: sql<number>`count(*)::int`,
      })
      .from(equipment)
      .groupBy(equipment.departmentId);

    console.log("📊 Department ID Distribution:");
    distribution.forEach((row) => {
      const deptName =
        allDepts.find((d) => d.id === row.departmentId)?.name ||
        "NOT FOUND";
      console.log(
        `   ID ${row.departmentId}: ${row.count} items (${deptName})`
      );
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

checkDepartments();

