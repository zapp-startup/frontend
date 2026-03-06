import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  apiRequest,
  apiRequestPaginated,
  getAiDevUser,
  setApiAccessToken,
  PaginatedResponse,
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

  it("throws when requireAuth is true and no token", async () => {
    setApiAccessToken(null);
    vi.stubGlobal("fetch", vi.fn());

    await expect(apiRequest("/api/test/", { requireAuth: true })).rejects.toThrow(
      /Authentication required/
    );
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

  it("apiRequestPaginated unwraps array when response is plain array", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ id: 1 }, { id: 2 }]),
      text: () => Promise.resolve(""),
      headers: new Headers(),
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
      text: () => Promise.resolve(""),
      headers: new Headers(),
    } as Response);

    const result = await apiRequestPaginated<{ id: number }>("/api/items/", undefined, {
      requireAuth: true,
    });
    expect(result).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("getAiDevUser returns null when env is not set", () => {
    const result = getAiDevUser();
    expect(result).toBeNull();
  });
});
