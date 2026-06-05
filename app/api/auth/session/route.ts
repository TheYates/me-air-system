import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/edit-auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  return NextResponse.json({
    unlocked: session.valid,
    expiresAt: session.expiresAt ?? null,
  });
}
