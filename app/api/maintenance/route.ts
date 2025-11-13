import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenance, equipment, departments } from "@/db/schema";
import { sql, eq, and, ilike, desc } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const equipmentId = searchParams.get("equipmentId");
    const upcoming = searchParams.get("upcoming");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = db
      .select({
        id: maintenance.id,
        equipmentId: maintenance.equipmentId,
        type: maintenance.type,
        description: maintenance.description,
        technician: maintenance.technician,
        date: maintenance.date,
        scheduledDate: maintenance.scheduledDate,
        completedDate: maintenance.completedDate,
        cost: maintenance.cost,
        status: maintenance.status,
        notes: maintenance.notes,
        priority: maintenance.priority,
        progress: maintenance.progress,
        estimatedDuration: maintenance.estimatedDuration,
        actualDuration: maintenance.actualDuration,
        createdAt: maintenance.createdAt,
        updatedAt: maintenance.updatedAt,
      })
      .from(maintenance);

    // Apply filters
    const conditions = [];

    if (status) {
      conditions.push(eq(maintenance.status, status));
    }

    if (type) {
      conditions.push(ilike(maintenance.type, `%${type}%`));
    }

    if (equipmentId) {
      conditions.push(eq(maintenance.equipmentId, parseInt(equipmentId)));
    }

    if (upcoming === "true") {
      const today = new Date();
      conditions.push(
        sql`${maintenance.scheduledDate} >= ${today} AND ${maintenance.scheduledDate} <= ${new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)}`
      );
    }

    // Count total before pagination
    let countQuery = db.select({ count: sql<number>`count(*)::int` }).from(maintenance);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions)) as any;
    }
    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    // Apply conditions and pagination
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const offset = (page - 1) * limit;
    const result = await query
      .orderBy(desc(maintenance.date))
      .limit(limit)
      .offset(offset);

    const response = NextResponse.json({
      data: result,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    });
    
    // Cache maintenance records for 5 minutes
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=900"
    );

    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching maintenance records:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maintenance records" },
      { status: 500 }
    );
    errorResponse.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return errorResponse;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await db
      .insert(maintenance)
      .values({
        equipmentId: body.equipmentId,
        type: body.type || body.maintenanceType, // Support both field names
        description: body.description,
        technician: body.technician || body.performedBy, // Support both field names
        date: body.date ? new Date(body.date) : (body.performedDate ? new Date(body.performedDate) : new Date()),
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        completedDate: body.completedDate ? new Date(body.completedDate) : null,
        cost: body.cost,
        status: body.status || "scheduled",
        notes: body.notes,
        priority: body.priority,
        progress: body.progress || 0,
        estimatedDuration: body.estimatedDuration,
        actualDuration: body.actualDuration,
      })
      .returning();

    // Also update equipment status if provided
    if (body.equipmentStatus && body.equipmentId) {
      await db
        .update(equipment)
        .set({ status: body.equipmentStatus, updatedAt: new Date() })
        .where(eq(equipment.id, body.equipmentId));
    }

    const response = NextResponse.json(result[0], { status: 201 });
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to create maintenance record" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}

