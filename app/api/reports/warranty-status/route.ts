import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { equipment, departments } from "@/db/schema";
import { eq, and, gte, lte, sql, desc, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");
    const warrantyStatus = searchParams.get("warrantyStatus"); // 'active', 'expiring', 'expired'

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);

    // Build conditions array
    const conditions = [isNotNull(equipment.warrantyExpiry)];

    if (departmentId && departmentId !== "all") {
      conditions.push(eq(equipment.departmentId, parseInt(departmentId)));
    }

    // Fetch all equipment with warranty information
    const result = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        manufacturer: equipment.manufacturer,
        model: equipment.model,
        tagNumber: equipment.tagNumber,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        warrantyExpiry: equipment.warrantyExpiry,
        warrantyInfo: equipment.warrantyInfo,
        purchaseDate: equipment.purchaseDate,
        purchaseCost: equipment.purchaseCost,
        departmentId: equipment.departmentId,
        departmentName: departments.name,
        subUnit: equipment.subUnit,
      })
      .from(equipment)
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(equipment.warrantyExpiry);

    // Categorize warranties
    const categorized = result.map((item) => {
      const expiryDate = item.warrantyExpiry ? new Date(item.warrantyExpiry) : null;
      let warrantyStatus = "unknown";
      let daysUntilExpiry = 0;

      if (expiryDate) {
        daysUntilExpiry = Math.floor(
          (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry < 0) {
          warrantyStatus = "expired";
        } else if (daysUntilExpiry <= 30) {
          warrantyStatus = "expiring-soon"; // Within 30 days
        } else if (daysUntilExpiry <= 90) {
          warrantyStatus = "expiring"; // Within 90 days
        } else {
          warrantyStatus = "active";
        }
      }

      return {
        ...item,
        warrantyStatus,
        daysUntilExpiry,
      };
    });

    // Filter by warranty status if specified
    let filteredResult = categorized;
    if (warrantyStatus && warrantyStatus !== "all") {
      filteredResult = categorized.filter((item) => {
        if (warrantyStatus === "expiring") {
          return item.warrantyStatus === "expiring" || item.warrantyStatus === "expiring-soon";
        }
        return item.warrantyStatus === warrantyStatus;
      });
    }

    // Calculate summary statistics
    const summary = {
      total: categorized.length,
      active: categorized.filter((item) => item.warrantyStatus === "active").length,
      expiringSoon: categorized.filter((item) => item.warrantyStatus === "expiring-soon")
        .length,
      expiring: categorized.filter((item) => item.warrantyStatus === "expiring").length,
      expired: categorized.filter((item) => item.warrantyStatus === "expired").length,
      byDepartment: categorized.reduce((acc: Record<string, number>, item) => {
        const dept = item.departmentName || "Unassigned";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json({
      success: true,
      data: filteredResult,
      summary,
    });
  } catch (error) {
    console.error("Error fetching warranty status report:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch warranty status report",
      },
      { status: 500 }
    );
  }
}
