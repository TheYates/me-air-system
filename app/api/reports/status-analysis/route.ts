import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { equipment, departments, maintenance } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");

    // Build conditions for department filter
    const conditions = [];
    if (departmentId && departmentId !== "all") {
      conditions.push(eq(equipment.departmentId, parseInt(departmentId)));
    }

    // Fetch equipment status breakdown
    const statusBreakdown = await db
      .select({
        status: equipment.status,
        count: sql<number>`COUNT(*)`,
        totalValue: sql<number>`COALESCE(SUM(CAST(${equipment.purchaseCost} AS NUMERIC)), 0)`,
      })
      .from(equipment)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(equipment.status);

    // Fetch status breakdown by department
    const statusByDepartment = await db
      .select({
        departmentName: departments.name,
        status: equipment.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(equipment)
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(departments.name, equipment.status);

    // Fetch equipment age analysis
    const ageAnalysis = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        status: equipment.status,
        purchaseDate: equipment.purchaseDate,
        departmentName: departments.name,
      })
      .from(equipment)
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Calculate age categories
    const today = new Date();
    const ageCategorized = ageAnalysis.map((item) => {
      const purchaseDate = item.purchaseDate ? new Date(item.purchaseDate) : null;
      let ageInYears = 0;
      let ageCategory = "unknown";

      if (purchaseDate) {
        ageInYears = (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

        if (ageInYears < 1) {
          ageCategory = "0-1 years";
        } else if (ageInYears < 3) {
          ageCategory = "1-3 years";
        } else if (ageInYears < 5) {
          ageCategory = "3-5 years";
        } else if (ageInYears < 10) {
          ageCategory = "5-10 years";
        } else {
          ageCategory = "10+ years";
        }
      }

      return {
        ...item,
        ageInYears: Math.floor(ageInYears * 10) / 10,
        ageCategory,
      };
    });

    // Get maintenance frequency by status
    const maintenanceByStatus = await db
      .select({
        status: equipment.status,
        maintenanceCount: sql<number>`COUNT(${maintenance.id})`,
        avgCost: sql<number>`COALESCE(AVG(CAST(${maintenance.cost} AS NUMERIC)), 0)`,
      })
      .from(equipment)
      .leftJoin(maintenance, eq(equipment.id, maintenance.equipmentId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(equipment.status);

    // Organize data for charts
    const statusDistribution = statusBreakdown.map((item) => ({
      status: item.status || "unknown",
      count: Number(item.count),
      totalValue: Number(item.totalValue),
    }));

    const ageDistribution = ageCategorized.reduce((acc: Record<string, number>, item) => {
      acc[item.ageCategory] = (acc[item.ageCategory] || 0) + 1;
      return acc;
    }, {});

    const summary = {
      totalEquipment: statusBreakdown.reduce((sum, item) => sum + Number(item.count), 0),
      statusDistribution,
      ageDistribution,
      statusByDepartment: statusByDepartment.map((item) => ({
        department: item.departmentName || "Unassigned",
        status: item.status || "unknown",
        count: Number(item.count),
      })),
      maintenanceByStatus: maintenanceByStatus.map((item) => ({
        status: item.status || "unknown",
        maintenanceCount: Number(item.maintenanceCount),
        avgCost: Number(item.avgCost),
      })),
    };

    return NextResponse.json({
      success: true,
      data: ageCategorized,
      summary,
    });
  } catch (error) {
    console.error("Error fetching status analysis report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch status analysis report",
      },
      { status: 500 }
    );
  }
}
