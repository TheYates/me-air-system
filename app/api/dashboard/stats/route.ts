import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { equipment, departments, maintenance, activities } from "@/db/schema";
import { sql, eq, desc, gte } from "drizzle-orm";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  const preFlight = handleCorsPreFlight(request);
  if (preFlight) return preFlight;
}

export async function GET(request: NextRequest) {
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
    const underMaintenance = Number(maintenanceResult[0]?.count || 0);

    // Get broken equipment count
    const brokenResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipment)
      .where(eq(equipment.status, "broken"));
    const broken = Number(brokenResult[0]?.count || 0);

    // Get total value of equipment
    const equipmentValueResult = await db
      .select({ total: sql<number>`sum(${equipment.purchaseCost})::numeric` })
      .from(equipment);
    const equipmentValue = Number(equipmentValueResult[0]?.total || 0);

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
    const statusBreakdown = {
      operational,
      maintenance: underMaintenance,
      broken,
      retired: totalEquipment - operational - underMaintenance - broken,
    };

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

    // Get recent activities (last 10)
    const recentActivitiesData = await db
      .select({
        id: activities.id,
        type: activities.type,
        description: activities.description,
        date: activities.date,
      })
      .from(activities)
      .orderBy(desc(activities.date))
      .limit(10);

    const recentActivities = recentActivitiesData.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      date: activity.date || new Date(),
    }));

    // Get upcoming maintenance (scheduled maintenance records)
    const upcomingMaintenanceData = await db
      .select({
        id: maintenance.id,
        equipmentId: maintenance.equipmentId,
        equipmentName: equipment.name,
        maintenanceType: maintenance.type,
        scheduledDate: maintenance.scheduledDate,
        maintenanceDate: maintenance.date,
        status: maintenance.status,
      })
      .from(maintenance)
      .leftJoin(equipment, eq(maintenance.equipmentId, equipment.id))
      .where(eq(maintenance.status, "scheduled"))
      .orderBy(sql`COALESCE(${maintenance.scheduledDate}, ${maintenance.date})`)
      .limit(10);

    const upcomingMaintenance = upcomingMaintenanceData.map((item) => ({
      id: item.id,
      equipment_id: item.equipmentId,
      equipment_name: item.equipmentName || "Unknown Equipment",
      maintenance_type: item.maintenanceType,
      due_date: item.scheduledDate || item.maintenanceDate || new Date(),
      status: item.status,
    }));

    const response = NextResponse.json({
      totalEquipment,
      operational,
      underMaintenance,
      broken,
      totalDepartments,
      maintenanceRecords,
      equipmentValue,
      statusBreakdown,
      equipmentByDepartment: departmentData,
      upcomingMaintenance,
      recentActivities,
      serviceDue: 0, // Can be calculated from warranty data
    });

    // Cache for 1 minute (dashboard stats update fairly frequently)
    response.headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );

    // Add CORS headers
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
    errorResponse.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    return addCorsHeaders(errorResponse, request);
  }
}
