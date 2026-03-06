import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

let authToken: string | null = null;

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
    console.error("getSession error while preparing API request:", error);
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

function buildRequestHeaders(headersInit: HeadersInit | undefined, token: string | null) {
  const headers = new Headers(headersInit);

  if (!headers.has("Content-Type")) {
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

  const res = await fetch(`${BASE_URL}${path}`, {
    ...requestOptions,
    headers: buildRequestHeaders(requestOptions.headers, token),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
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