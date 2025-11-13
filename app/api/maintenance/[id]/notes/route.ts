import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenanceNotes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

// GET all notes for a maintenance record
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

    const notes = await db
      .select()
      .from(maintenanceNotes)
      .where(eq(maintenanceNotes.maintenanceId, maintenanceId))
      .orderBy(desc(maintenanceNotes.createdAt));

    const response = NextResponse.json(notes);
    response.headers.set("Cache-Control", "public, max-age=300, stale-while-revalidate=900");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching maintenance notes:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maintenance notes" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// POST a new note for a maintenance record
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

    if (!body.note) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(maintenanceNotes)
      .values({
        maintenanceId,
        note: body.note,
        createdBy: body.createdBy,
      })
      .returning();

    const response = NextResponse.json(result[0], { status: 201 });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error creating maintenance note:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to create maintenance note" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}
