import { supabase } from "./supabaseClient";
import { getValidatedUrlOrThrow, resolveApiBaseUrl } from "@/config/apiEnv";

const apiEnvResult = resolveApiBaseUrl();

/** Non-null when production (or misconfigured) API URL is invalid. Surfaces in UI; requests throw. */
export function getApiConfigurationError(): string | null {
  return apiEnvResult.ok ? null : apiEnvResult.message;
}

function getBaseUrlForRequests(): string {
  return getValidatedUrlOrThrow(apiEnvResult);
}

let authToken: string | null = null;

/** Normalized API failure: safe `message` for UI; `rawBody` for debugging only. */
export class ApiError extends Error {
  readonly status: number;
  readonly rawBody?: string;

  constructor(message: string, status: number, rawBody?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.rawBody = rawBody;
  }
}

function safeMessageForHttpStatus(status: number): string {
  if (status === 400) return "The request could not be processed.";
  if (status === 401) return "Authentication required. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find that resource.";
  if (status === 409) return "This action conflicts with existing data.";
  if (status === 422) return "Please check your input and try again.";
  if (status === 429) return "Too many requests. Please try again later.";
  if (status >= 500) return "Something went wrong on our end. Please try again later.";
  return "Something went wrong. Please try again.";
}

function looksLikeHtml(text: string): boolean {
  const t = text.trim().toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html") || (t.includes("<") && t.includes(">") && t.length > 80);
}

/** Derive a short, user-safe message from JSON error bodies (e.g. DRF). */
function tryParseUserFacingDetail(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || looksLikeHtml(trimmed)) return null;

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === "string") return parsed.length <= 500 ? parsed : null;

    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      const detail = o.detail;
      if (typeof detail === "string" && detail.length <= 500) return detail;
      if (Array.isArray(detail) && typeof detail[0] === "string") return detail[0];

      for (const v of Object.values(o)) {
        if (Array.isArray(v) && typeof v[0] === "string") return v[0];
        if (typeof v === "string") return v;
      }
    }
  } catch {
    // not JSON
  }

  if (trimmed.length <= 300 && !looksLikeHtml(trimmed)) return trimmed;
  return null;
}

function buildApiError(status: number, rawBody: string): ApiError {
  const detail = tryParseUserFacingDetail(rawBody);
  const message = detail ?? safeMessageForHttpStatus(status);
  return new ApiError(message, status, rawBody || undefined);
}

export function setApiAccessToken(token: string | null) {
  authToken = token;
}

export function getApiAccessToken() {
  return authToken;
}

export async function getCurrentApiAccessToken() {
  if (authToken) return authToken;

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }

  const token = data.session?.access_token ?? null;
  if (token) {
    setApiAccessToken(token);
  }
  return token;
}

async function resolveRequestToken(requireAuth: boolean) {
  if (authToken) return authToken;
  if (!requireAuth) return null;
  return getCurrentApiAccessToken();
}

function shouldSetJsonContentType(body: BodyInit | null | undefined) {
  return body != null && !(body instanceof FormData);
}

function buildRequestHeaders(
  headersInit: HeadersInit | undefined,
  token: string | null,
  body: BodyInit | null | undefined
) {
  const headers = new Headers(headersInit);

  if (!headers.has("Content-Type") && shouldSetJsonContentType(body)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

type ApiRequestOptions = RequestInit & {
  requireAuth?: boolean;
};

export async function apiRequest<T = any>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { requireAuth = false, ...requestOptions } = options;
  const token = await resolveRequestToken(requireAuth);

  if (requireAuth && !token) {
    throw new Error(`Authentication required for ${path}, but no Supabase access token is available.`);
  }

  const res = await fetch(`${getBaseUrlForRequests()}${path}`, {
    ...requestOptions,
    headers: buildRequestHeaders(requestOptions.headers, token, requestOptions.body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw buildApiError(res.status, text);
  }

  if (res.status === 204 || res.status === 205) return null as T;

  const text = await res.text();
  if (!text) return null as T;

  const contentType = res.headers.get("Content-Type") ?? "";
  const expectsJson = contentType.includes("application/json") || contentType.includes("+json");
  if (expectsJson) {
    return JSON.parse(text) as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

/** DRF-style paginated response. */
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type PaginatedParams = {
  page?: number;
  page_size?: number;
};

/** Fetches paginated endpoint and returns results array. Handles both paginated and plain array responses. */
export async function apiRequestPaginated<T>(
  path: string,
  params?: PaginatedParams,
  options: ApiRequestOptions = {}
): Promise<T[]> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.page_size != null) search.set("page_size", String(params.page_size));
  const qs = search.toString();
  const fullPath = path + (qs ? (path.includes("?") ? "&" : "?") + qs : "");
  const data = await apiRequest<PaginatedResponse<T> | T[]>(fullPath, options);
  if (Array.isArray(data)) return data;
  return (data as PaginatedResponse<T>).results ?? [];
}
