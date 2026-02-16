const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

let authToken: string | null = null;

export function setApiAccessToken(token: string | null) {
  authToken = token;
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = authToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}
