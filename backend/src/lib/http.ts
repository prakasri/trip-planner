import { NextResponse } from "next/server";
import { corsHeaders } from "./cors";

// Mirrors the envelope and error codes defined in specs/api-contract-spec.md
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "USERNAME_TAKEN"
  | "INVALID_CREDENTIALS"
  | "UNAUTHENTICATED"
  | "FORBIDDEN_ORIGIN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const statusByCode: Record<ErrorCode, number> = {
  VALIDATION_ERROR: 400,
  USERNAME_TAKEN: 400,
  INVALID_CREDENTIALS: 401,
  UNAUTHENTICATED: 401,
  FORBIDDEN_ORIGIN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export function jsonSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status, headers: corsHeaders() });
}

export function jsonError(
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>,
): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message, ...(fields ? { fields } : {}) } },
    { status: statusByCode[code], headers: corsHeaders() },
  );
}
