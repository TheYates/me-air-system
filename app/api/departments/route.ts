import { NextResponse } from "next/server";
import { db } from "@/db";
import { departments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET all departments
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      // Get single department
      const department = await db
        .select()
        .from(departments)
        .where(eq(departments.id, parseInt(id)))
        .limit(1);

      if (department.length === 0) {
        return NextResponse.json(
          { error: "Department not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(department[0]);
    }

    // Get all departments
    const allDepartments = await db
      .select()
      .from(departments)
      .orderBy(desc(departments.createdAt));

    return NextResponse.json(allDepartments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

// POST create new department
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newDepartment = await db
      .insert(departments)
      .values({
        name: body.name,
        manager: body.manager,
        email: body.email,
        phone: body.phone,
        description: body.description,
        subUnits: body.subUnits,
        budget: body.budget,
        employees: body.employees,
      })
      .returning();

    return NextResponse.json(newDepartment[0], { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}

// PUT update department
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }

    const updatedDepartment = await db
      .update(departments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, id))
      .returning();

    if (updatedDepartment.length === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDepartment[0]);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

// DELETE department
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }

    const deletedDepartment = await db
      .delete(departments)
      .where(eq(departments.id, parseInt(id)))
      .returning();

    if (deletedDepartment.length === 0) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: deletedDepartment[0] });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}

