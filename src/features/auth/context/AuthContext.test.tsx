import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./AuthContext";
import { addAuditSink, resetAuditSinks, type AuditEvent } from "@/shared/audit/audit";

const {
  mockApiRequest,
  mockFetchAuthAssurance,
  mockGetApiAccessToken,
  mockGetMfaSnapshot,
  mockSetApiAccessToken,
  mockGetSession,
  mockOnAuthStateChange,
  mockSignUp,
  mockSignInWithPassword,
  mockSignOut,
  mockUpdateUser,
} = vi.hoisted(() => ({
  mockApiRequest: vi.fn(),
  mockFetchAuthAssurance: vi.fn(),
  mockGetApiAccessToken: vi.fn(),
  mockGetMfaSnapshot: vi.fn(),
  mockSetApiAccessToken: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignOut: vi.fn(),
  mockUpdateUser: vi.fn(),
}));

vi.mock("@/api/client", () => ({
  apiRequest: mockApiRequest,
  getApiAccessToken: mockGetApiAccessToken,
  setApiAccessToken: mockSetApiAccessToken,
  getApiConfigurationError: vi.fn().mockReturnValue(null),
}));

vi.mock("@/api/compliance.api", () => ({
  fetchAuthAssurance: mockFetchAuthAssurance,
}));

vi.mock("@/features/auth/mfa/mfaOperations", () => ({
  getMfaSnapshot: mockGetMfaSnapshot,
  enrollTotpFactor: vi.fn(),
  verifyTotpEnrollment: vi.fn(),
  verifyMfaChallenge: vi.fn(),
  unenrollFactor: vi.fn(),
}));

vi.mock("@/api/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signUp: mockSignUp,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      updateUser: mockUpdateUser,
    },
  },
}));

function LoginHarness() {
  const { login } = useAuth();

  return (
    <button
      type="button"
      onClick={() => {
        void login("user@example.com", "secret12");
      }}
    >
      Sign in
    </button>
  );
}

function SignUpHarness() {
  const { signUp } = useAuth();
  const [result, setResult] = React.useState<string>("");

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const response = await signUp({
            name: "Test User",
            email: "user@example.com",
            password: "secret12",
            confirmPassword: "secret12",
          });
          setResult(JSON.stringify(response));
        }}
      >
        Sign up
      </button>
      <output>{result}</output>
    </>
  );
}

function RefreshMfaHarness() {
  const { refreshMfa, mfaError, mfaLoading } = useAuth();
  const [result, setResult] = React.useState("");

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const response = await refreshMfa();
          setResult(JSON.stringify(response));
        }}
      >
        Refresh MFA
      </button>
      <output data-testid="mfa-loading">{String(mfaLoading)}</output>
      <output data-testid="mfa-error">{mfaError ?? ""}</output>
      <output data-testid="mfa-result">{result}</output>
    </>
  );
}

describe("AuthProvider", () => {
  let events: AuditEvent[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    events = [];
    resetAuditSinks();
    addAuditSink((event) => {
      events.push(event);
    });
    mockApiRequest.mockResolvedValue({
      id: 7,
      email: "user@example.com",
      username: "tester",
      supabase_uid: "uid-123",
    });
    mockFetchAuthAssurance.mockResolvedValue({
      mfa_required_by_policy: false,
      consent_required_by_policy: true,
      financial_consent_valid: true,
      assurance: { aal: null, amr: [], mfa_factors_count: 0 },
      aal_normalized: null,
      banking_allowed: true,
      blocking_code: null,
    });
    mockGetApiAccessToken.mockReturnValue("token-123");
    mockGetMfaSnapshot.mockResolvedValue({
      currentLevel: "aal1",
      nextLevel: "aal2",
      factors: [],
    });
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
    mockSignUp.mockResolvedValue({ error: null, data: { session: null } });
    mockSignOut.mockResolvedValue({ error: null });
    mockUpdateUser.mockResolvedValue({ error: null, data: { user: null } });
  });

  it("deduplicates backend sync when sign-in and auth listener race", async () => {
    let authListener:
      | ((event: string, session: { access_token: string; user: { id: string; email: string; user_metadata: Record<string, unknown>; created_at: string } } | null) => Promise<void>)
      | undefined;

    mockOnAuthStateChange.mockImplementation((callback) => {
      authListener = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    mockSignInWithPassword.mockImplementation(async () => {
      const session = {
        access_token: "token-123",
        user: {
          id: "uid-123",
          email: "user@example.com",
          user_metadata: { name: "Test User", username: "tester" },
          created_at: "2026-03-24T00:00:00Z",
        },
      };

      await authListener?.("SIGNED_IN", session);

      return {
        error: null,
        data: { session },
      };
    });

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginHarness />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledTimes(1);
    });

    expect(mockApiRequest).toHaveBeenCalledWith("/api/auth/sync/", {
      requireAuth: true,
      method: "POST",
    });
  });

  it("returns requiresVerification when signup succeeds without a session", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <SignUpHarness />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText('{"ok":true,"requiresVerification":true}')).toBeInTheDocument();
    });

    expect(events).toContainEqual(
      expect.objectContaining({
        event_name: "auth.signup",
        outcome: "success",
      })
    );
  });

  it("clears MFA loading when the snapshot refresh fails", async () => {
    const user = userEvent.setup();
    mockGetMfaSnapshot.mockRejectedValueOnce(new Error("MFA status unavailable"));

    render(
      <AuthProvider>
        <RefreshMfaHarness />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: /refresh mfa/i }));

    await waitFor(() => {
      expect(screen.getByTestId("mfa-loading")).toHaveTextContent("false");
      expect(screen.getByTestId("mfa-error")).toHaveTextContent("MFA status unavailable");
      expect(screen.getByTestId("mfa-result")).toHaveTextContent('"reason":"auth_assurance_unavailable"');
    });

    expect(mockFetchAuthAssurance).not.toHaveBeenCalled();
  });

  it("records failed login attempts without logging secrets", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: "Invalid login credentials" },
      data: { session: null, user: null },
    });
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginHarness />
      </AuthProvider>
    );

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(events).toContainEqual(
        expect.objectContaining({
          event_name: "auth.login",
          outcome: "failure",
          error_message: "Invalid login credentials",
        })
      );
    });
    expect(JSON.stringify(events)).not.toMatch(/secret12/);
  });
});
