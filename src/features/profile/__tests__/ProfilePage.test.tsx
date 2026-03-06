import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProfilePage } from "../pages/ProfilePage";
import * as api from "@/api";

vi.mock("@/api", () => ({
  RawExplicitAPI: { list: vi.fn(), patch: vi.fn() },
  PreferencesAPI: { list: vi.fn(), remove: vi.fn(), create: vi.fn() },
}));

vi.mock("@/features/auth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User", email: "test@example.com", tier: "Intentional Tier" },
    logout: vi.fn(),
    updateProfile: vi.fn(),
  }),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.RawExplicitAPI.list).mockResolvedValue([]);
    vi.mocked(api.PreferencesAPI.list).mockResolvedValue([]);
  });

  it("loads and displays profile form", async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(api.RawExplicitAPI.list).toHaveBeenCalled();
      expect(api.PreferencesAPI.list).toHaveBeenCalled();
    });

    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Financial Profile/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Preferences/i })).toBeInTheDocument();
  });
});
