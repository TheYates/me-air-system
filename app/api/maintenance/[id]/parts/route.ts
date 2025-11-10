import { NextResponse } from "next/server";
import { db } from "@/db";
import { maintenanceParts } from "@/db/schema";
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
      .from(maintenanceParts)
      .where(eq(maintenanceParts.maintenanceId, maintenanceId))
      .orderBy(maintenanceParts.createdAt);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching maintenance parts:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance parts" },
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
    const { partName, partNumber, quantity, cost, supplier } =
      await request.json();

    const result = await db
      .insert(maintenanceParts)
      .values({
        maintenanceId,
        partName,
        partNumber,
        quantity,
        cost,
        supplier,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance part:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance part" },
      { status: 500 }
    );
  }
}

