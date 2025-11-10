import { NextResponse } from "next/server";
import { db } from "@/db";
import { maintenance, equipment, departments } from "@/db/schema";
import { sql, eq, and, ilike } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const equipmentId = searchParams.get("equipmentId");
    const upcoming = searchParams.get("upcoming");

    let query = db
      .select({
        id: maintenance.id,
        equipmentId: maintenance.equipmentId,
        maintenanceType: maintenance.maintenanceType,
        description: maintenance.description,
        performedBy: maintenance.performedBy,
        performedDate: maintenance.performedDate,
        nextMaintenanceDate: maintenance.nextMaintenanceDate,
        cost: maintenance.cost,
        status: maintenance.status,
        notes: maintenance.notes,
        createdAt: maintenance.createdAt,
        updatedAt: maintenance.updatedAt,
      })
      .from(maintenance);

    // Apply filters
    const conditions = [];

    if (status) {
      conditions.push(eq(maintenance.status, status));
    }

    if (type) {
      conditions.push(ilike(maintenance.maintenanceType, `%${type}%`));
    }

    if (equipmentId) {
      conditions.push(eq(maintenance.equipmentId, parseInt(equipmentId)));
    }

    if (upcoming === "true") {
      const today = new Date();
      conditions.push(
        sql`${maintenance.nextMaintenanceDate} >= ${today} AND ${maintenance.nextMaintenanceDate} <= ${new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(sql`${maintenance.performedDate} DESC`);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await db
      .insert(maintenance)
      .values({
        equipmentId: body.equipmentId,
        maintenanceType: body.maintenanceType,
        description: body.description,
        performedBy: body.performedBy,
        performedDate: body.performedDate ? new Date(body.performedDate) : null,
        nextMaintenanceDate: body.nextMaintenanceDate
          ? new Date(body.nextMaintenanceDate)
          : null,
        cost: body.cost,
        status: body.status || "scheduled",
        notes: body.notes,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance record" },
      { status: 500 }
    );
  }
}

