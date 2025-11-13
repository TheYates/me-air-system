import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  
  // Allow all localhost origins (any port)
  const isLocalhost = 
    !origin || 
    origin.includes("localhost") || 
    origin.includes("127.0.0.1") ||
    origin.includes("0.0.0.0");
  
  // Handle preflight
  if (request.method === "OPTIONS") {
    if (isLocalhost) {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin || "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
  }

  // For non-OPTIONS requests, pass through and let the response headers be added by endpoints
  const response = NextResponse.next();
  
  // Add CORS headers to all responses for localhost
  if (isLocalhost) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  
  return response;
}

export const config = {
  matcher: "/api/:path*",
};

