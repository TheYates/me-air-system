import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  return authHeader.slice(7) === cronSecret;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    const timestamp =
      (result[0] as { current_time?: string })?.current_time ??
      new Date().toISOString();

    return NextResponse.json({ success: true, timestamp });
  } catch (error) {
    console.error("DB ping failed:", error);
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
