const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export interface ApiErrorBody {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export class ApiError extends Error {
  code: string;
  fields?: Record<string, string>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.code = body.code;
    this.fields = body.fields;
  }
}

// All requests go to the backend's own origin with credentials included —
// see specs/frontend-spec.md > Data Fetching Strategy.
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await response.json();
  if (!body.success) {
    throw new ApiError(body.error);
  }
  return body.data as T;
}

export const apiGet = <T>(path: string) => apiFetch<T>(path);

export const apiPost = <T>(path: string, data?: unknown) =>
  apiFetch<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined });

export const apiPatch = <T>(path: string, data: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(data) });

export const apiDelete = <T>(path: string) => apiFetch<T>(path, { method: "DELETE" });
