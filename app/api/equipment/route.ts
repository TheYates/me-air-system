import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { equipment } from "@/db/schema";
import { eq, desc, like, and, sql } from "drizzle-orm";
import { addCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

export async function OPTIONS(request: NextRequest) {
  const preFlight = handleCorsPreFlight(request);
  if (preFlight) return preFlight;
}

// GET all equipment or search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const departmentId = searchParams.get("departmentId");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

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

    // Build conditions array first
    const conditions = [];

    if (departmentId) {
      conditions.push(eq(equipment.departmentId, parseInt(departmentId)));
    }

    if (status) {
      conditions.push(eq(equipment.status, status));
    }

    if (search) {
      conditions.push(
        sql`${equipment.name} ILIKE ${`%${search}%`} OR ${
          equipment.manufacturer
        } ILIKE ${`%${search}%`}`
      );
    }

    // Get total count before pagination
    const totalResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(equipment)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const total = totalResult[0]?.count || 0;

    // Apply ordering, pagination - build query with where clause upfront
    const offset = (page - 1) * limit;
    const allEquipment = await db
      .select({
        id: equipment.id,
        name: equipment.name,
        manufacturer: equipment.manufacturer,
        tagNumber: equipment.tagNumber,
        status: equipment.status,
        departmentId: equipment.departmentId,
        subUnit: equipment.subUnit,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        purchaseType: equipment.purchaseType,
        purchaseCost: equipment.purchaseCost,
        owner: equipment.owner,
        createdAt: equipment.createdAt,
        updatedAt: equipment.updatedAt,
      })
      .from(equipment)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(equipment.createdAt))
      .limit(limit)
      .offset(offset);

    const response = NextResponse.json({
      data: allEquipment,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    });

    // Cache for 5 minutes with stale-while-revalidate for another 55 minutes
    // This means: serve cached for 5min, then serve stale copy while updating in background for up to 60min
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=3300"
    );

    // Add CORS headers
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching equipment:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
    // Don't cache errors
    errorResponse.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    return addCorsHeaders(errorResponse, request);
  }
}

// Helper function to convert string dates to Date objects
const parseDate = (dateValue: any): Date | undefined => {
  if (!dateValue) return undefined;
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue === "string") {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
};

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
        warrantyExpiry: parseDate(body.warrantyExpiry),
        dateOfInstallation: parseDate(body.dateOfInstallation),
        departmentId: body.departmentId,
        subUnit: body.subUnit,
        model: body.model,
        mfgNumber: body.mfgNumber,
        serialNumber: body.serialNumber,
        status: body.status || "operational",
        purchaseType: body.purchaseType,
        purchaseDate: parseDate(body.purchaseDate),
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

    // Convert date fields
    const processedData = { ...updateData };
    const dateFields = ["warrantyExpiry", "dateOfInstallation", "purchaseDate"];
    dateFields.forEach((field) => {
      if (processedData[field]) {
        processedData[field] = parseDate(processedData[field]);
      }
    });

    const updatedEquipment = await db
      .update(equipment)
      .set({
        ...processedData,
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
