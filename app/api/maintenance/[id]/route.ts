import { NextResponse } from "next/server";
import { db } from "@/db";
import { maintenance } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenanceId = parseInt(id);

    const result = await db
      .select()
      .from(maintenance)
      .where(eq(maintenance.id, maintenanceId));

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Maintenance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
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
        equipmentId: body.equipmentId,
        maintenanceType: body.maintenanceType,
        description: body.description,
        performedBy: body.performedBy,
        performedDate: body.performedDate ? new Date(body.performedDate) : null,
        nextMaintenanceDate: body.nextMaintenanceDate
          ? new Date(body.nextMaintenanceDate)
          : null,
        cost: body.cost,
        status: body.status,
        notes: body.notes,
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

    return NextResponse.json(result[0]);
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting maintenance record:", error);
    return NextResponse.json(
      { error: "Failed to delete maintenance record" },
      { status: 500 }
    );
  }
}

