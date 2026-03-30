/**
 * Production API URL validation. Local development may use http://127.0.0.1.
 * Does not replace TLS on the wire; only blocks obviously unsafe production config.
 */

export type ApiBaseUrlValidation = {
  ok: true;
  url: string;
} | {
  ok: false;
  message: string;
};

function isLocalhost(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "[::1]";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(url);
  }
}

/**
 * Validates API base URL for production builds. Returns error message if invalid.
 */
export function validateProductionApiBaseUrl(raw: string | undefined): string | null {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return "VITE_API_URL is required in production. Set it to your HTTPS API origin.";
  }
  if (isLocalhost(trimmed)) {
    return "VITE_API_URL must not point to localhost in production.";
  }
  if (trimmed.startsWith("http://")) {
    return "VITE_API_URL must use https:// in production.";
  }
  if (!trimmed.startsWith("https://")) {
    return "VITE_API_URL must be a valid https:// URL in production.";
  }
  return null;
}

/**
 * Resolves the API base URL for the current environment.
 */
export function resolveApiBaseUrl(): ApiBaseUrlValidation {
  const fallback = "http://127.0.0.1:8000";
  const raw = import.meta.env.VITE_API_URL?.trim() || fallback;

  if (import.meta.env.PROD) {
    const err = validateProductionApiBaseUrl(raw);
    if (err) return { ok: false, message: err };
    return { ok: true, url: raw };
  }

  return { ok: true, url: raw };
}
