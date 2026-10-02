import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, hasAllowedOrigin, handlePreflight } from "@/lib/cors";

const MUTATING_METHODS = new Set(["POST", "PATCH", "DELETE"]);

export function middleware(request: NextRequest) {
  if (request.method === "OPTIONS") {
    return handlePreflight();
  }

  // CSRF defense for sameSite=none cookies — see src/lib/cors.ts
  if (MUTATING_METHODS.has(request.method) && !hasAllowedOrigin(request)) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN_ORIGIN", message: "Request origin not allowed" } },
      { status: 403, headers: corsHeaders() },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
