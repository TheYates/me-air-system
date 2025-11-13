import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Add CORS headers to response for localhost development
 * Middleware handles preflight, this adds headers to actual responses
 */
export function addCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin");
  const isLocalhost =
    origin?.includes("localhost") || origin?.includes("127.0.0.1");

  if (isLocalhost) {
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

/**
 * Preflight handler (kept for compatibility but middleware is primary handler)
 */
export function handleCorsPreFlight(request: NextRequest) {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    const isLocalhost =
      origin?.includes("localhost") || origin?.includes("127.0.0.1");

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
  return null;
}
