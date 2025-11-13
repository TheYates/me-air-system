import { NextResponse } from "next/server";
import { db } from "@/db";
import { equipment, departments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipmentId = parseInt(id);

    const result = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        manufacturer: equipment.manufacturer,
        tagNumber: equipment.tagNumber,
        status: equipment.status,
        departmentId: equipment.departmentId,
        department_name: departments.name,
        subUnit: equipment.subUnit,
        sub_unit: equipment.subUnit,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        purchaseType: equipment.purchaseType,
        purchaseCost: equipment.purchaseCost,
        purchase_cost: equipment.purchaseCost,
        owner: equipment.owner,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
        countryOfOrigin: equipment.countryOfOrigin,
        yearOfManufacture: equipment.yearOfManufacture,
        warrantyInfo: equipment.warrantyInfo,
        warrantyExpiry: equipment.warrantyExpiry,
        dateOfInstallation: equipment.dateOfInstallation,
        mfgNumber: equipment.mfgNumber,
        purchaseDate: equipment.purchaseDate,
        purchaseOrderNumber: equipment.purchaseOrderNumber,
        leaseId: equipment.leaseId,
        photoUrl: equipment.photoUrl,
        hasServiceContract: equipment.hasServiceContract,
        serviceOrganization: equipment.serviceOrganization,
        serviceTypes: equipment.serviceTypes,
        contactInfo: equipment.contactInfo,
        employeeNumber: equipment.employeeNumber,
        maintainedBy: equipment.maintainedBy,
      })
      .from(equipment)
      .leftJoin(departments, eq(equipment.departmentId, departments.id))
      .where(eq(equipment.id, equipmentId));

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
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
    const equipmentId = parseInt(id);
    const body = await request.json();

    const result = await db
      .update(equipment)
      .set({
        ...body,
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
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { error: "Failed to update equipment" },
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
    const equipmentId = parseInt(id);

    const result = await db
      .delete(equipment)
      .where(eq(equipment.id, equipmentId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}

