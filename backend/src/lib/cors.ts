const allowedOrigin = process.env.ALLOWED_ORIGIN as string;

export function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export function handlePreflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// CSRF defense: sameSite=none cookies are sent cross-site, so the SameSite
// attribute alone doesn't block forged requests — verify Origin explicitly
// on every mutating request. See backend-spec.md > Security Considerations.
export function hasAllowedOrigin(request: Request): boolean {
  return request.headers.get("origin") === allowedOrigin;
}
