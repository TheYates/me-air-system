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
        maintenanceType: body.maintenanceType,
        description: body.description,
        performedBy: body.performedBy,
        performedDate: body.performedDate ? new Date(body.performedDate) : undefined,
        nextMaintenanceDate: body.nextMaintenanceDate
          ? new Date(body.nextMaintenanceDate)
          : undefined,
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
