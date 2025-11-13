import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenanceChecklist } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

// GET all checklist items for a maintenance record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const maintenanceId = parseInt(id);

    if (isNaN(maintenanceId)) {
      return NextResponse.json({ error: "Invalid maintenance ID" }, { status: 400 });
    }

    const items = await db
      .select()
      .from(maintenanceChecklist)
      .where(eq(maintenanceChecklist.maintenanceId, maintenanceId))
      .orderBy(desc(maintenanceChecklist.createdAt));

    const response = NextResponse.json(items);
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching maintenance checklist:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maintenance checklist" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// POST a new checklist item for a maintenance record
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const maintenanceId = parseInt(id);
    const body = await request.json();

    if (isNaN(maintenanceId)) {
      return NextResponse.json({ error: "Invalid maintenance ID" }, { status: 400 });
    }

    if (!body.itemDescription) {
      return NextResponse.json(
        { error: "Item description is required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(maintenanceChecklist)
      .values({
        maintenanceId,
        itemDescription: body.itemDescription,
        isCompleted: body.isCompleted || 0,
      })
      .returning();

    const response = NextResponse.json(result[0], { status: 201 });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error creating maintenance checklist item:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to create maintenance checklist item" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}

