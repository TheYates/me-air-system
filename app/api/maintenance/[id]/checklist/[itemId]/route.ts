import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenanceChecklist } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

// GET a specific checklist item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { itemId } = params;
    const checklistItemId = parseInt(itemId);

    if (isNaN(checklistItemId)) {
      return NextResponse.json(
        { error: "Invalid checklist item ID" },
        { status: 400 }
      );
    }

    const item = await db
      .select()
      .from(maintenanceChecklist)
      .where(eq(maintenanceChecklist.id, checklistItemId))
      .limit(1);

    if (item.length === 0) {
      return NextResponse.json(
        { error: "Checklist item not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(item[0]);
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching checklist item:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch checklist item" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// UPDATE a specific checklist item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { itemId } = params;
    const checklistItemId = parseInt(itemId);
    const body = await request.json();

    if (isNaN(checklistItemId)) {
      return NextResponse.json(
        { error: "Invalid checklist item ID" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(maintenanceChecklist)
      .set({
        itemDescription: body.itemDescription,
        isCompleted: body.isCompleted !== undefined ? body.isCompleted : undefined,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceChecklist.id, checklistItemId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Checklist item not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(updated[0]);
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// DELETE a specific checklist item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const { itemId } = params;
    const checklistItemId = parseInt(itemId);

    if (isNaN(checklistItemId)) {
      return NextResponse.json(
        { error: "Invalid checklist item ID" },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(maintenanceChecklist)
      .where(eq(maintenanceChecklist.id, checklistItemId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Checklist item not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, deleted: deleted[0] });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}

