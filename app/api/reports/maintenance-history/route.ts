import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenance, equipment, departments } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");
    const maintenanceType = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build conditions array
    const conditions = [];

    if (maintenanceType && maintenanceType !== "all") {
      conditions.push(eq(maintenance.type, maintenanceType));
    }

    if (startDate) {
      conditions.push(gte(maintenance.date, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(maintenance.date, new Date(endDate)));
    }

    // Fetch maintenance records with equipment and department info
    let query = db
      .select({
        id: maintenance.id,
        type: maintenance.type,
        status: maintenance.status,
        priority: maintenance.priority,
        date: maintenance.date,
        scheduledDate: maintenance.scheduledDate,
        completedDate: maintenance.completedDate,
        technician: maintenance.technician,
        cost: maintenance.cost,
        description: maintenance.description,
        notes: maintenance.notes,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentTag: equipment.tagNumber,
        departmentId: departments.id,
        departmentName: departments.name,
      })
      .from(maintenance)
      .leftJoin(equipment, eq(maintenance.equipmentId, equipment.id))
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(maintenance.date));

    // Apply department filter if needed
    let result = await query;

    if (departmentId && departmentId !== "all") {
      result = result.filter((r) => r.departmentId === parseInt(departmentId));
    }

    // Calculate monthly statistics
    const monthlyStats: Record<string, Record<string, number>> = {};

    result.forEach((record) => {
      if (record.date) {
        const monthKey = new Date(record.date).toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            preventive: 0,
            repair: 0,
            calibration: 0,
            inspection: 0,
            total: 0,
          };
        }

        const type = record.type?.toLowerCase() || "other";
        if (type in monthlyStats[monthKey]) {
          monthlyStats[monthKey][type]++;
        }
        monthlyStats[monthKey].total++;
      }
    });

    // Calculate summary statistics
    const summary = {
      totalMaintenance: result.length,
      totalCost: result.reduce((sum, item) => {
        const cost = item.cost ? parseFloat(item.cost.toString()) : 0;
        return sum + cost;
      }, 0),
      byType: result.reduce((acc: Record<string, number>, item) => {
        const type = item.type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      byStatus: result.reduce((acc: Record<string, number>, item) => {
        const status = item.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      monthlyStats,
    };

    return NextResponse.json({
      success: true,
      data: result,
      summary,
    });
  } catch (error) {
    console.error("Error fetching maintenance history report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch maintenance history report",
      },
      { status: 500 }
    );
  }
}
