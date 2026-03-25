import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  apiRequest,
  apiRequestPaginated,
  setApiAccessToken,
  PaginatedResponse,
  ApiError,
} from "../client";

const originalFetch = globalThis.fetch;

describe("client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    setApiAccessToken("test-token");
  });

  it("injects Authorization header when token is set", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "ok" }),
      text: () => Promise.resolve(""),
      headers: new Headers(),
    } as Response);

    await apiRequest("/api/test/", { requireAuth: true });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.any(Headers),
      })
    );
    const call = mockFetch.mock.calls[0];
    const headers = call[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("does not add Content-Type for bodyless requests", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "ok" }),
      text: () => Promise.resolve(""),
      headers: new Headers({ "Content-Type": "application/json" }),
    } as Response);

    await apiRequest("/api/test/");

    const call = mockFetch.mock.calls[0];
    const headers = call[1]?.headers as Headers;
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("adds Content-Type for JSON request bodies", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "ok" }),
      text: () => Promise.resolve(""),
      headers: new Headers({ "Content-Type": "application/json" }),
    } as Response);

    await apiRequest("/api/test/", {
      method: "POST",
      body: JSON.stringify({ ok: true }),
    });

    const call = mockFetch.mock.calls[0];
    const headers = call[1]?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws when requireAuth is true and no token", async () => {
    setApiAccessToken(null);
    vi.stubGlobal("fetch", vi.fn());

    await expect(apiRequest("/api/test/", { requireAuth: true })).rejects.toThrow(
      /Authentication required/
    );
  });

  it("throws ApiError with safe message and rawBody on error responses", async () => {
    const mockFetch = vi.mocked(fetch);
    const raw = JSON.stringify({ detail: "Invalid token." });
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve(raw),
      headers: new Headers({ "Content-Type": "application/json" }),
    } as Response);

    try {
      await apiRequest("/api/test/", { requireAuth: true });
      expect.fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(401);
      expect(err.message).toBe("Invalid token.");
      expect(err.rawBody).toBe(raw);
    }
  });

  it("throws ApiError with generic message for HTML error bodies", async () => {
    const mockFetch = vi.mocked(fetch);
    const raw = "<!DOCTYPE html><html><body>Error</body></html>";
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve(raw),
      headers: new Headers({ "Content-Type": "text/html" }),
    } as Response);

    try {
      await apiRequest("/api/broken/");
      expect.fail("expected throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.status).toBe(500);
      expect(err.rawBody).toBe(raw);
      expect(err.message).toBe("Something went wrong on our end. Please try again later.");
    }
  });

  it("returns null for 204 No Content", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () => Promise.resolve(null),
      text: () => Promise.resolve(""),
      headers: new Headers(),
    } as Response);

    const result = await apiRequest<any>("/api/test/");
    expect(result).toBeNull();
  });

  it("returns text for non-JSON responses", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(null),
      text: () => Promise.resolve("ok"),
      headers: new Headers({ "Content-Type": "text/plain" }),
    } as Response);

    const result = await apiRequest<string>("/api/test/");
    expect(result).toBe("ok");
  });

  it("apiRequestPaginated unwraps array when response is plain array", async () => {
    const mockFetch = vi.mocked(fetch);
    const payload = [{ id: 1 }, { id: 2 }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(payload),
      text: () => Promise.resolve(JSON.stringify(payload)),
      headers: new Headers({ "Content-Type": "application/json" }),
    } as Response);

    const result = await apiRequestPaginated<{ id: number }>("/api/items/", undefined, {
      requireAuth: true,
    });
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("apiRequestPaginated unwraps results when response is paginated", async () => {
    const mockFetch = vi.mocked(fetch);
    const paginated: PaginatedResponse<{ id: number }> = {
      count: 2,
      next: null,
      previous: null,
      results: [{ id: 1 }, { id: 2 }],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(paginated),
      text: () => Promise.resolve(JSON.stringify(paginated)),
      headers: new Headers({ "Content-Type": "application/json" }),
    } as Response);

    const result = await apiRequestPaginated<{ id: number }>("/api/items/", undefined, {
      requireAuth: true,
    });
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
