import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { ZappBot } from "../components/ZappBot";
import { PanelProvider } from "../context/PanelContext";

const mockUseAuth = vi.fn();

vi.mock("@/features/auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/api/ai.api", () => ({
  createConversation: vi.fn(),
  sendMessage: vi.fn(),
}));

vi.mock("motion/react", () => {
  const React = require("react") as typeof import("react");
  return {
    motion: {
      div: (props: React.ComponentProps<"div">) =>
        React.createElement("div", props, props.children),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useMotionValue: (v: number) => ({ set: vi.fn(), get: () => v }),
    useSpring: (v: unknown) => v,
    useTransform: () => 0,
    useReducedMotion: () => false,
  };
});

describe("ZappBot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("scopes conversation id in localStorage by supabaseUid", async () => {
    mockUseAuth.mockReturnValue({
      user: { supabaseUid: "uid-abc", username: "seed_user_0", name: "T", email: "t@e.com", id: "x", createdAt: "" },
    });

    localStorage.setItem("zapp_conversation_id_uid-abc", "42");

    render(
      <PanelProvider>
        <ZappBot />
      </PanelProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem("zapp_conversation_id_uid-abc")).toBe("42");
    });
  });

  it("does not reuse a different user's stored conversation id", async () => {
    localStorage.setItem("zapp_conversation_id_uid-other", "99");

    mockUseAuth.mockReturnValue({
      user: { supabaseUid: "uid-me", username: "seed_user_0", name: "T", email: "t@e.com", id: "x", createdAt: "" },
    });

    render(
      <PanelProvider>
        <ZappBot />
      </PanelProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem("zapp_conversation_id_uid-me")).toBeNull();
    });
    expect(localStorage.getItem("zapp_conversation_id_uid-other")).toBe("99");
  });
});
