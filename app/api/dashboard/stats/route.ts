import { NextResponse } from "next/server";
import { db } from "@/db";
import { equipment, departments, maintenance } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get total equipment count
    const totalEquipmentResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipment);
    const totalEquipment = Number(totalEquipmentResult[0]?.count || 0);

    // Get operational equipment count
    const operationalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipment)
      .where(eq(equipment.status, "operational"));
    const operational = Number(operationalResult[0]?.count || 0);

    // Get maintenance equipment count
    const maintenanceResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipment)
      .where(eq(equipment.status, "maintenance"));
    const inMaintenance = Number(maintenanceResult[0]?.count || 0);

    // Get broken equipment count
    const brokenResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipment)
      .where(eq(equipment.status, "broken"));
    const broken = Number(brokenResult[0]?.count || 0);

    // Get total departments count
    const totalDepartmentsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(departments);
    const totalDepartments = Number(totalDepartmentsResult[0]?.count || 0);

    // Get maintenance records count
    const maintenanceRecordsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(maintenance);
    const maintenanceRecords = Number(maintenanceRecordsResult[0]?.count || 0);

    // Get equipment by status for chart
    const equipmentByStatus = [
      { name: "Operational", value: operational, color: "#10b981" },
      { name: "Maintenance", value: inMaintenance, color: "#f59e0b" },
      { name: "Broken", value: broken, color: "#ef4444" },
    ];

    // Get equipment by department
    const equipmentByDepartment = await db
      .select({
        department: departments.name,
        count: sql<number>`count(${equipment.id})::int`,
      })
      .from(equipment)
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .groupBy(departments.name)
      .orderBy(sql`count(${equipment.id}) DESC`)
      .limit(10);

    const departmentData = equipmentByDepartment.map((item) => ({
      department: item.department || "Unassigned",
      count: Number(item.count || 0),
    }));

    return NextResponse.json({
      totalEquipment,
      operational,
      maintenance: inMaintenance,
      broken,
      totalDepartments,
      maintenanceRecords,
      equipmentByStatus,
      equipmentByDepartment: departmentData,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

