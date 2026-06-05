import { NextResponse } from "next/server";
import { db } from "@/db";
import { maintenance, equipment, departments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenanceId = parseInt(id);

    const result = await db
      .select({
        id: maintenance.id,
        equipmentId: maintenance.equipmentId,
        type: maintenance.type,
        description: maintenance.description,
        technician: maintenance.technician,
        date: maintenance.date,
        scheduledDate: maintenance.scheduledDate,
        completedDate: maintenance.completedDate,
        cost: maintenance.cost,
        status: maintenance.status,
        notes: maintenance.notes,
        priority: maintenance.priority,
        progress: maintenance.progress,
        estimatedDuration: maintenance.estimatedDuration,
        actualDuration: maintenance.actualDuration,
        createdAt: maintenance.createdAt,
        updatedAt: maintenance.updatedAt,
        equipment_name: sql<string | null>`${equipment.name}`,
        tag_number: sql<string | null>`${equipment.tagNumber}`,
        department: sql<string | null>`${departments.name}`,
      })
      .from(maintenance)
      .leftJoin(equipment, eq(maintenance.equipmentId, equipment.id))
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .where(eq(maintenance.id, maintenanceId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Maintenance record not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(result[0]);
    response.headers.set("Cache-Control", "public, max-age=300");
    return response;
  } catch (error) {
    console.error("Error fetching maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance record" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenanceId = parseInt(id);
    const body = await request.json();

    const result = await db
      .update(maintenance)
      .set({
        type: body.type ?? body.maintenanceType,
        description: body.description,
        technician: body.technician ?? body.performedBy,
        date: body.date
          ? new Date(body.date)
          : body.performedDate
            ? new Date(body.performedDate)
            : undefined,
        scheduledDate: body.scheduledDate
          ? new Date(body.scheduledDate)
          : undefined,
        completedDate: body.completedDate
          ? new Date(body.completedDate)
          : body.status === "completed"
            ? new Date()
            : undefined,
        cost: body.cost,
        status: body.status,
        notes: body.notes,
        priority: body.priority,
        progress: body.progress,
        estimatedDuration: body.estimatedDuration,
        actualDuration: body.actualDuration,
        updatedAt: new Date(),
      })
      .where(eq(maintenance.id, maintenanceId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Maintenance record not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(result[0]);
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (error) {
    console.error("Error updating maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to update maintenance record" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenanceId = parseInt(id);

    const result = await db
      .delete(maintenance)
      .where(eq(maintenance.id, maintenanceId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Maintenance record not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, deleted: result[0] });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return response;
  } catch (error) {
    console.error("Error deleting maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance record" },
      { status: 500 }
    );
  }
}
