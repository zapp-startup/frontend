import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  apiRequest,
  apiRequestPaginated,
  setApiAccessToken,
  PaginatedResponse,
  ApiError,
} from "../client";
import { addAuditSink, resetAuditSinks, type AuditEvent } from "@/shared/audit/audit";

const originalFetch = globalThis.fetch;

describe("client", () => {
  let events: AuditEvent[] = [];

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    setApiAccessToken("test-token");
    events = [];
    resetAuditSinks();
    addAuditSink((event) => {
      events.push(event);
    });
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
    expect(headers.get("X-Request-ID")).toBeTruthy();
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

  it("emits audit success events for audited requests", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify({ ok: true })),
      headers: new Headers({ "Content-Type": "application/json" }),
    } as Response);

    await apiRequest("/api/transactions/1/", {
      requireAuth: true,
      method: "PATCH",
      body: JSON.stringify({ amount: "12.00" }),
      audit: {
        eventName: "transaction.update",
        action: "update",
        resourceType: "transaction",
        resourceId: 1,
      },
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event_name: "transaction.update",
      outcome: "success",
      resource_type: "transaction",
      resource_id: 1,
      route: "/api/transactions/1/",
      method: "PATCH",
      status_code: 200,
    });
    expect(events[0].request_id).toBeTruthy();
  });

  it("emits audit failure events for failed audited requests", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve(JSON.stringify({ detail: "Forbidden" })),
      headers: new Headers({ "Content-Type": "application/json" }),
    } as Response);

    await expect(
      apiRequest("/api/gamification/groups/9/update_member_role/", {
        requireAuth: true,
        method: "POST",
        body: JSON.stringify({ membership_id: 2, role: "admin" }),
        audit: {
          eventName: "rbac.group_member_role_change",
          action: "update_role",
          resourceType: "group_membership",
          resourceId: 2,
        },
      })
    ).rejects.toBeInstanceOf(ApiError);

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event_name: "rbac.group_member_role_change",
      outcome: "failure",
      resource_type: "group_membership",
      resource_id: 2,
      status_code: 403,
      error_message: "Forbidden",
    });
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
