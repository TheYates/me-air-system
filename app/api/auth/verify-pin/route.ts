import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  setSessionCookie,
  verifyPin,
} from "@/lib/edit-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pin = typeof body?.pin === "string" ? body.pin : "";

    if (!verifyPin(pin)) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const { token, expiresAt } = await createSessionToken();
    const response = NextResponse.json({ success: true, expiresAt });
    setSessionCookie(response, token, expiresAt);
    return response;
  } catch (error) {
    console.error("PIN verification failed:", error);
    return NextResponse.json(
      { error: "Failed to verify PIN" },
      { status: 500 }
    );
  }
}
