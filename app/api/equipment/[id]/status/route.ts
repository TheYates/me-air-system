import { NextResponse } from "next/server";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipmentId = parseInt(id);
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const result = await db
      .update(equipment)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(equipment.id, equipmentId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating equipment status:", error);
    return NextResponse.json(
      { error: "Failed to update equipment status" },
      { status: 500 }
    );
  }
}

