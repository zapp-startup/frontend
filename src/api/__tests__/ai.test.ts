import { describe, it, expect, vi, beforeEach } from "vitest";
import { createConversation, sendMessage } from "../ai.api";

describe("ai.api", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("createConversation returns conversation_id", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ conversation_id: 123 }),
      text: () => Promise.resolve(""),
      headers: new Headers(),
    } as Response);

    const result = await createConversation(
      { devUsername: "seed_user_0" },
      { context_type: "general" }
    );

    expect(result.conversation_id).toBe(123);
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/ai/conversations/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Dev-User": "seed_user_0",
        }),
      })
    );
  });

  it("sendMessage returns user_message and assistant_message", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          user_message: { id: 1, role: "user", content: "Hello" },
          assistant_message: { id: 2, role: "assistant", content: "Hi there!" },
        }),
      text: () => Promise.resolve(""),
      headers: new Headers(),
    } as Response);

    const result = await sendMessage({ devUsername: "seed_user_0" }, 1, "Hello");

    expect(result).toHaveProperty("user_message");
    expect(result).toHaveProperty("assistant_message");
    expect(result.user_message.content).toBe("Hello");
    expect(result.assistant_message.content).toBe("Hi there!");
  });
});
