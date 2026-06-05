import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { maintenancePhotos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { addCorsHeaders } from "@/lib/cors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const maintenanceId = parseInt(id);

    if (isNaN(maintenanceId)) {
      return NextResponse.json(
        { error: "Invalid maintenance ID" },
        { status: 400 }
      );
    }

    const photos = await db
      .select()
      .from(maintenancePhotos)
      .where(eq(maintenancePhotos.maintenanceId, maintenanceId))
      .orderBy(desc(maintenancePhotos.createdAt));

    const response = NextResponse.json(photos);
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=900"
    );
    return addCorsHeaders(response, request);
  } catch (error) {
    console.error("Error fetching maintenance photos:", error);
    const errorResponse = NextResponse.json(
      { error: "Failed to fetch maintenance photos" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request);
  }
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
}
