import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenanceRequests, equipment } from "@/db/schema";
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

// GET maintenance requests with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const equipmentId = searchParams.get("equipmentId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build conditions array
    const conditions = [];

    if (status) {
      conditions.push(eq(maintenanceRequests.status, status));
    }

    if (priority) {
      conditions.push(eq(maintenanceRequests.priority, priority));
    }

    if (equipmentId) {
      conditions.push(eq(maintenanceRequests.equipmentId, parseInt(equipmentId)));
    }

    // Count total before pagination
    let countQuery = db
      .select({ count: sql<number>`count(*)::int` })
      .from(maintenanceRequests);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    // Apply conditions and pagination
    let query = db
      .select({
        id: maintenanceRequests.id,
        equipmentId: maintenanceRequests.equipmentId,
        requestedBy: maintenanceRequests.requestedBy,
        requestDate: maintenanceRequests.requestDate,
        priority: maintenanceRequests.priority,
        description: maintenanceRequests.description,
        status: maintenanceRequests.status,
        assignedTo: maintenanceRequests.assignedTo,
        createdAt: maintenanceRequests.createdAt,
        updatedAt: maintenanceRequests.updatedAt,
      })
      .from(maintenanceRequests);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const offset = (page - 1) * limit;
    const result = await query
      .orderBy(desc(maintenanceRequests.requestDate))
      .limit(limit)
      .offset(offset);

    const response = NextResponse.json({
      data: result,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    });

    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=900"
    );

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maintenance requests" },
      { status: 500 }
    );
    errorResponse.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(errorResponse, request);
  }
}

// POST a new maintenance request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.equipmentId) {
      return NextResponse.json(
        { error: "Equipment ID is required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(maintenanceRequests)
      .values({
        equipmentId: body.equipmentId,
        requestedBy: body.requestedBy,
        requestDate: body.requestDate ? new Date(body.requestDate) : new Date(),
        priority: body.priority || "medium",
        description: body.description,
        status: body.status || "pending",
        assignedTo: body.assignedTo,
      })
      .returning();

    const response = NextResponse.json(result[0], { status: 201 });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to create maintenance request" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}

