import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities, equipment, departments } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");
    const activityType = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.get("limit") || "100";

    // Build conditions array
    const conditions = [];

    if (activityType && activityType !== "all") {
      conditions.push(eq(activities.type, activityType));
    }

    if (startDate) {
      conditions.push(gte(activities.date, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(activities.date, new Date(endDate)));
    }

    // Fetch activities with equipment and department info
    let query = db
      .select({
        id: activities.id,
        type: activities.type,
        description: activities.description,
        date: activities.date,
        createdAt: activities.createdAt,
        equipmentId: activities.equipmentId,
        equipmentName: equipment.name,
        equipmentTag: equipment.tagNumber,
        departmentId: activities.departmentId,
        departmentName: departments.name,
      })
      .from(activities)
      .leftJoin(equipment, eq(activities.equipmentId, equipment.id))
      .leftJoin(departments, eq(activities.departmentId, departments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(activities.date), desc(activities.createdAt))
      .limit(parseInt(limit));

    let result = await query;

    // Apply department filter if needed
    if (departmentId && departmentId !== "all") {
      result = result.filter(
        (r) => r.departmentId === parseInt(departmentId)
      );
    }

    // Calculate summary statistics
    const summary = {
      totalActivities: result.length,
      byType: result.reduce((acc: Record<string, number>, item) => {
        const type = item.type || "unknown";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
      byDepartment: result.reduce((acc: Record<string, number>, item) => {
        const dept = item.departmentName || "Unassigned";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}),
      recentActivities: result.slice(0, 10), // Top 10 most recent
    };

    return NextResponse.json({
      success: true,
      data: result,
      summary,
    });
  } catch (error) {
    console.error("Error fetching activities log report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch activities log report",
      },
      { status: 500 }
    );
  }
}
