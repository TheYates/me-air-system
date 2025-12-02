import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { equipment, departments } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build conditions array
    const conditions = [];

    if (departmentId && departmentId !== "all") {
      conditions.push(eq(equipment.departmentId, parseInt(departmentId)));
    }

    if (status && status !== "all") {
      conditions.push(eq(equipment.status, status));
    }

    // Date filters are optional - don't filter by date if equipment doesn't have purchaseDate
    // This ensures all equipment is included in reports even if they don't have dates set

    // Fetch equipment with department info
    const result = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        tagNumber: equipment.tagNumber,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        purchaseCost: equipment.purchaseCost,
        purchaseDate: equipment.purchaseDate,
        warrantyExpiry: equipment.warrantyExpiry,
        warrantyInfo: equipment.warrantyInfo,
        departmentId: equipment.departmentId,
        departmentName: departments.name,
        subUnit: equipment.subUnit,
        dateOfInstallation: equipment.dateOfInstallation,
        owner: equipment.owner,
        maintainedBy: equipment.maintainedBy,
      })
      .from(equipment)
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(equipment.createdAt));

    // Calculate summary statistics
    const summary = {
      totalEquipment: result.length,
      totalValue: result.reduce((sum, item) => {
        const cost = item.purchaseCost ? parseFloat(item.purchaseCost.toString()) : 0;
        return sum + cost;
      }, 0),
      byStatus: result.reduce((acc: Record<string, number>, item) => {
        const status = item.status || "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      byDepartment: result.reduce((acc: Record<string, number>, item) => {
        const dept = item.departmentName || "Unassigned";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json({
      success: true,
      data: result,
      summary,
    });
  } catch (error) {
    console.error("Error fetching equipment inventory report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch equipment inventory report",
      },
      { status: 500 }
    );
  }
}
