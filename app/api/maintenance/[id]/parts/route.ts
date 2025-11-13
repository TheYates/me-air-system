import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenanceParts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

// GET all parts for a maintenance record
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

    const parts = await db
      .select()
      .from(maintenanceParts)
      .where(eq(maintenanceParts.maintenanceId, maintenanceId))
      .orderBy(desc(maintenanceParts.createdAt));

    const response = NextResponse.json(parts);
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching maintenance parts:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maintenance parts" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// POST a new part for a maintenance record
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

    const result = await db
      .insert(maintenanceParts)
      .values({
        maintenanceId,
        partName: body.partName,
        partNumber: body.partNumber,
        quantity: body.quantity,
        cost: body.cost,
        supplier: body.supplier,
      })
      .returning();

    const response = NextResponse.json(result[0], { status: 201 });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error creating maintenance part:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to create maintenance part" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}
