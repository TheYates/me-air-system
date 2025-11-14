import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

// Bulk assign department to unassigned equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { departmentId, equipmentIds } = body;

    if (!departmentId) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }

    let result;

    if (equipmentIds && Array.isArray(equipmentIds) && equipmentIds.length > 0) {
      // Assign to specific equipment
      result = await db
        .update(equipment)
        .set({
          departmentId: departmentId,
          updatedAt: new Date(),
        })
        .where(eq(equipment.id, equipmentIds[0]))
        .returning();

      // Update remaining equipment
      for (let i = 1; i < equipmentIds.length; i++) {
        await db
          .update(equipment)
          .set({
            departmentId: departmentId,
            updatedAt: new Date(),
          })
          .where(eq(equipment.id, equipmentIds[i]));
      }
    } else {
      // Assign to all unassigned equipment
      result = await db
        .update(equipment)
        .set({
          departmentId: departmentId,
          updatedAt: new Date(),
        })
        .where(isNull(equipment.departmentId))
        .returning();
    }

    return NextResponse.json({
      success: true,
      message: `Successfully assigned ${result.length} equipment to department`,
      count: result.length,
    });
  } catch (error) {
    console.error("Error bulk assigning department:", error);
    return NextResponse.json(
      { error: "Failed to bulk assign department" },
      { status: 500 }
    );
  }
}

