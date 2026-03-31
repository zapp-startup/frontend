import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerBackendAuditSink, resetBackendAuditSinkForTests } from "../backendSink";
import { emitAuditEvent, resetAuditSinks } from "../audit";
import { setApiAccessToken } from "@/api/client";

describe("backend audit sink", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true } as Response)));
    resetAuditSinks();
    resetBackendAuditSinkForTests();
    setApiAccessToken(null);
  });

  it("posts emitted audit events to the backend endpoint", async () => {
    registerBackendAuditSink();

    emitAuditEvent({
      event_name: "transaction.create",
      outcome: "success",
      source_system: "frontend-web",
      route: "/api/transactions/",
      method: "POST",
    });

    await Promise.resolve();

    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/audit/events/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("includes the bearer token when available", async () => {
    setApiAccessToken("test-token");
    registerBackendAuditSink();

    emitAuditEvent({
      event_name: "transaction.update",
      outcome: "failure",
      source_system: "frontend-web",
      route: "/api/transactions/9/",
      method: "PATCH",
    });

    await Promise.resolve();

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      })
    );
  });
});
