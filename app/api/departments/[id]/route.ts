import { NextResponse } from "next/server";
import { db } from "@/db";
import { departments, equipment } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const departmentId = parseInt(id);

    const result = await db
      .select()
      .from(departments)
      .where(eq(departments.id, departmentId));

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    // Get equipment count for this department
    const equipmentCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipment)
      .where(eq(equipment.departmentId, departmentId));

    return NextResponse.json({
      ...result[0],
      equipmentCount: Number(equipmentCount[0]?.count || 0),
    });
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json(
      { error: "Failed to fetch department" },
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
    const departmentId = parseInt(id);
    const body = await request.json();

    const result = await db
      .update(departments)
      .set({
        name: body.name,
        description: body.description,
        location: body.location,
        headOfDepartment: body.headOfDepartment,
        contactNumber: body.contactNumber,
        email: body.email,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, departmentId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
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
    const departmentId = parseInt(id);

    const result = await db
      .delete(departments)
      .where(eq(departments.id, departmentId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}

