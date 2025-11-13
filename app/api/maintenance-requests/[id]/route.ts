import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenanceRequests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

// GET a specific maintenance request
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(maintenanceRequests)
      .where(eq(maintenanceRequests.id, requestId))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Maintenance request not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(result[0]);
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=900"
    );
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching maintenance request:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maintenance request" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// UPDATE a maintenance request
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const requestId = parseInt(id);
    const body = await request.json();

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const updated = await db
      .update(maintenanceRequests)
      .set({
        requestedBy: body.requestedBy,
        requestDate: body.requestDate ? new Date(body.requestDate) : undefined,
        priority: body.priority,
        description: body.description,
        status: body.status,
        assignedTo: body.assignedTo,
        updatedAt: new Date(),
      })
      .where(eq(maintenanceRequests.id, requestId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Maintenance request not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(updated[0]);
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error updating maintenance request:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to update maintenance request" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// DELETE a maintenance request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(maintenanceRequests)
      .where(eq(maintenanceRequests.id, requestId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Maintenance request not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json({ success: true, deleted: deleted[0] });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error deleting maintenance request:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to delete maintenance request" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}

