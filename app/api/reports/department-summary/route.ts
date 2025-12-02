import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { departments, equipment, maintenance } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");

    // Build conditions for department filter
    const conditions = [];
    if (departmentId && departmentId !== "all") {
      conditions.push(eq(departments.id, parseInt(departmentId)));
    }

    // Fetch departments with equipment and maintenance counts
    const result = await db
      .select({
        id: departments.id,
        name: departments.name,
        manager: departments.manager,
        email: departments.email,
        phone: departments.phone,
        description: departments.description,
        budget: departments.budget,
        employees: departments.employees,
        equipmentCount: sql<number>`COALESCE(COUNT(DISTINCT ${equipment.id}), 0)`,
        totalValue: sql<number>`COALESCE(SUM(CAST(${equipment.purchaseCost} AS NUMERIC)), 0)`,
        operationalCount: sql<number>`COALESCE(SUM(CASE WHEN ${equipment.status} = 'operational' THEN 1 ELSE 0 END), 0)`,
        maintenanceCount: sql<number>`COALESCE(SUM(CASE WHEN ${equipment.status} = 'under_maintenance' THEN 1 ELSE 0 END), 0)`,
        brokenCount: sql<number>`COALESCE(SUM(CASE WHEN ${equipment.status} = 'broken' THEN 1 ELSE 0 END), 0)`,
        retiredCount: sql<number>`COALESCE(SUM(CASE WHEN ${equipment.status} = 'retired' THEN 1 ELSE 0 END), 0)`,
      })
      .from(departments)
      .leftJoin(equipment, eq(departments.id, equipment.departmentId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(
        departments.id,
        departments.name,
        departments.manager,
        departments.email,
        departments.phone,
        departments.description,
        departments.budget,
        departments.employees
      );

    // Get maintenance count per department
    const maintenanceCounts = await db
      .select({
        departmentId: equipment.departmentId,
        maintenanceCount: sql<number>`COUNT(${maintenance.id})`,
      })
      .from(maintenance)
      .leftJoin(equipment, eq(maintenance.equipmentId, equipment.id))
      .where(equipment.departmentId !== null)
      .groupBy(equipment.departmentId);

    // Merge maintenance counts
    const enrichedResult = result.map((dept) => {
      const maintenanceData = maintenanceCounts.find(
        (m) => m.departmentId === dept.id
      );
      return {
        ...dept,
        totalMaintenanceCount: maintenanceData?.maintenanceCount || 0,
      };
    });

    // Calculate distribution data for charts
    const distribution = enrichedResult.map((dept) => ({
      name: dept.name,
      value: Number(dept.equipmentCount),
      totalValue: Number(dept.totalValue),
    }));

    // Calculate summary statistics
    const summary = {
      totalDepartments: enrichedResult.length,
      totalEquipment: enrichedResult.reduce(
        (sum, dept) => sum + Number(dept.equipmentCount),
        0
      ),
      totalValue: enrichedResult.reduce(
        (sum, dept) => sum + Number(dept.totalValue),
        0
      ),
      totalOperational: enrichedResult.reduce(
        (sum, dept) => sum + Number(dept.operationalCount),
        0
      ),
      totalUnderMaintenance: enrichedResult.reduce(
        (sum, dept) => sum + Number(dept.maintenanceCount),
        0
      ),
      totalBroken: enrichedResult.reduce(
        (sum, dept) => sum + Number(dept.brokenCount),
        0
      ),
      distribution,
    };

    return NextResponse.json({
      success: true,
      data: enrichedResult,
      summary,
    });
  } catch (error) {
    console.error("Error fetching department summary report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch department summary report",
      },
      { status: 500 }
    );
  }
}
