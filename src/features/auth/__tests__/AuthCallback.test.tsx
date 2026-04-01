import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthCallback } from "../pages/AuthCallback";

const { mockNavigate, mockCheckComplete, mockRefreshSession } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockCheckComplete: vi.fn(),
  mockRefreshSession: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/onboarding.api", () => ({
  OnboardingAPI: {
    checkComplete: mockCheckComplete,
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    refreshSession: mockRefreshSession,
  }),
}));

describe("AuthCallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefreshSession.mockResolvedValue(true);
  });

  it("navigates home when onboarding is complete", async () => {
    mockCheckComplete.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
    });

    expect(mockRefreshSession.mock.invocationCallOrder[0]).toBeLessThan(mockCheckComplete.mock.invocationCallOrder[0]);
  });

  it("navigates to onboarding when onboarding is incomplete", async () => {
    mockCheckComplete.mockResolvedValue(false);

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/onboarding", { replace: true });
    });
  });

  it("returns to login when the onboarding check fails", async () => {
    mockCheckComplete.mockRejectedValue(new Error("session missing"));

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });
  });

  it("returns to login without checking onboarding when session bootstrap fails", async () => {
    mockRefreshSession.mockResolvedValue(false);

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
    });

    expect(mockCheckComplete).not.toHaveBeenCalled();
  });
});
