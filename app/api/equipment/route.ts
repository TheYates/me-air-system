import { NextResponse } from "next/server";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { eq, desc, like, and, sql } from "drizzle-orm";

// GET all equipment or search
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // Get single equipment by ID
    if (id) {
      const item = await db
        .select()
        .from(equipment)
        .where(eq(equipment.id, parseInt(id)))
        .limit(1);

      if (item.length === 0) {
        return NextResponse.json(
          { error: "Equipment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(item[0]);
    }

    // Build query with filters
    let query = db.select().from(equipment);
    const conditions = [];

    if (departmentId) {
      conditions.push(eq(equipment.departmentId, parseInt(departmentId)));
    }

    if (status) {
      conditions.push(eq(equipment.status, status));
    }

    if (search) {
      conditions.push(
        sql`${equipment.name} ILIKE ${`%${search}%`} OR ${equipment.manufacturer} ILIKE ${`%${search}%`}`
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allEquipment = await query.orderBy(desc(equipment.createdAt));

    return NextResponse.json(allEquipment);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

// POST create new equipment
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newEquipment = await db
      .insert(equipment)
      .values({
        name: body.name,
        manufacturer: body.manufacturer,
        countryOfOrigin: body.countryOfOrigin,
        yearOfManufacture: body.yearOfManufacture,
        tagNumber: body.tagNumber,
        owner: body.owner,
        maintainedBy: body.maintainedBy,
        warrantyInfo: body.warrantyInfo,
        warrantyExpiry: body.warrantyExpiry,
        dateOfInstallation: body.dateOfInstallation,
        departmentId: body.departmentId,
        subUnit: body.subUnit,
        model: body.model,
        mfgNumber: body.mfgNumber,
        serialNumber: body.serialNumber,
        status: body.status || "operational",
        purchaseType: body.purchaseType,
        purchaseDate: body.purchaseDate,
        purchaseOrderNumber: body.purchaseOrderNumber,
        purchaseCost: body.purchaseCost,
        leaseId: body.leaseId,
        photoUrl: body.photoUrl,
        hasServiceContract: body.hasServiceContract || 0,
        serviceOrganization: body.serviceOrganization,
        serviceTypes: body.serviceTypes,
        contactInfo: body.contactInfo,
        employeeNumber: body.employeeNumber,
      })
      .returning();

    return NextResponse.json(newEquipment[0], { status: 201 });
  } catch (error) {
    console.error("Error creating equipment:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}

// PUT update equipment
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Equipment ID is required" },
        { status: 400 }
      );
    }

    const updatedEquipment = await db
      .update(equipment)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(equipment.id, id))
      .returning();

    if (updatedEquipment.length === 0) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedEquipment[0]);
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { error: "Failed to update equipment" },
      { status: 500 }
    );
  }
}

// DELETE equipment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Equipment ID is required" },
        { status: 400 }
      );
    }

    const deletedEquipment = await db
      .delete(equipment)
      .where(eq(equipment.id, parseInt(id)))
      .returning();

    if (deletedEquipment.length === 0) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: deletedEquipment[0] });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}

