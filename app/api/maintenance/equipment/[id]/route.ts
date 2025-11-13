import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipmentId = parseInt(id);

    const result = await db
      .select()
      .from(maintenance)
      .where(eq(maintenance.equipmentId, equipmentId))
      .orderBy(desc(maintenance.date));

    const response = NextResponse.json(result);
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=900"
    );
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching equipment maintenance history:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maintenance history" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}

