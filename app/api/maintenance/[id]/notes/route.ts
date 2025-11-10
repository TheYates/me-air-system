import { NextResponse } from "next/server";
import { db } from "@/db";
import { maintenanceNotes } from "@/db/schema";
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
      .from(maintenanceNotes)
      .where(eq(maintenanceNotes.maintenanceId, maintenanceId))
      .orderBy(maintenanceNotes.createdAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching maintenance notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance notes" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenanceId = parseInt(id);
    const { note, createdBy } = await request.json();

    const result = await db
      .insert(maintenanceNotes)
      .values({
        maintenanceId,
        note,
        createdBy,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance note:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance note" },
      { status: 500 }
    );
  }
}

