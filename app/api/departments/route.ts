import { NextResponse } from "next/server";
import { db } from "@/db";
import { departments, equipment, maintenance } from "@/db/schema";
import { eq, desc, sql, count, sum } from "drizzle-orm";

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

    // Get all departments with counts
    const allDepartments = await db
      .select({
        id: departments.id,
        name: departments.name,
        manager: departments.manager,
        email: departments.email,
        phone: departments.phone,
        description: departments.description,
        sub_units: departments.subUnits,
        budget: departments.budget,
        employees: departments.employees,
        createdAt: departments.createdAt,
        updatedAt: departments.updatedAt,
        equipment_count: sql<number>`COALESCE(eq_counts.equipment_count, 0)`,
        maintenance_count: sql<number>`COALESCE(maint_counts.maintenance_count, 0)`,
        total_value: sql<number>`COALESCE(eq_counts.total_value, 0)`
      })
      .from(departments)
      .leftJoin(
        sql`(
          SELECT 
            department_id,
            COUNT(*) as equipment_count,
            COALESCE(SUM(CAST(purchase_cost AS NUMERIC)), 0) as total_value
          FROM equipment 
          WHERE department_id IS NOT NULL 
          GROUP BY department_id
        ) eq_counts`,
        sql`eq_counts.department_id = ${departments.id}`
      )
      .leftJoin(
        sql`(
          SELECT 
            e.department_id,
            COUNT(m.*) as maintenance_count
          FROM maintenance m
          JOIN equipment e ON m.equipment_id = e.id
          WHERE e.department_id IS NOT NULL
          GROUP BY e.department_id
        ) maint_counts`,
        sql`maint_counts.department_id = ${departments.id}`
      )
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

