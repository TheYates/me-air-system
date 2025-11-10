import { NextResponse } from "next/server";
import { db } from "@/db";
import { departments, equipment } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Test database connection
    const result = await db.execute(sql`SELECT NOW() as current_time`);

    // Get counts
    const deptCount = await db.select({ count: sql<number>`count(*)::int` }).from(departments);
    const equipCount = await db.select({ count: sql<number>`count(*)::int` }).from(equipment);

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      timestamp: result[0]?.current_time || new Date().toISOString(),
      stats: {
        departments: Number(deptCount[0]?.count || 0),
        equipment: Number(equipCount[0]?.count || 0),
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

