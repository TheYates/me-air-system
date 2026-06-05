import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromRequest,
  isMutationExempt,
  isMutationMethod,
  refreshSessionCookie,
} from "@/lib/edit-auth";

function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  isLocalhost: boolean
) {
  if (isLocalhost) {
    const origin = request.headers.get("origin");
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const isLocalhost =
    !origin ||
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.includes("0.0.0.0");

  if (request.method === "OPTIONS") {
    if (isLocalhost) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods":
            "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
  }

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") &&
    isMutationMethod(request.method) &&
    !isMutationExempt(pathname)
  ) {
    const session = await getSessionFromRequest(request);

    if (!session.valid) {
      const unauthorized = NextResponse.json(
        { error: "PIN required" },
        { status: 401 }
      );
      return applyCorsHeaders(unauthorized, request, isLocalhost);
    }

    const response = NextResponse.next();
    await refreshSessionCookie(response);
    return applyCorsHeaders(response, request, isLocalhost);
  }

  const response = NextResponse.next();
  return applyCorsHeaders(response, request, isLocalhost);
}

export const config = {
  matcher: "/api/:path*",
};
