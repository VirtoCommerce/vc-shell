import { describe, it, expect, vi } from "vitest";

// Module-scope so behavioral tests below can configure getCurrentUser per-call.
const mockGetCurrentUser = vi.fn();

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock("@core/composables/useExternalProvider", () => ({
  useExternalProvider: () => ({
    storage: { value: null },
    signOut: vi.fn(),
  }),
}));

vi.mock("@core/api/platform", () => ({
  SecurityClient: vi.fn().mockImplementation(() => ({
    getCurrentUser: mockGetCurrentUser,
    login: vi.fn(),
    logout: vi.fn(),
    validatePasswordResetToken: vi.fn(),
    validatePassword: vi.fn(),
    resetPasswordByToken: vi.fn(),
    requestPasswordReset: vi.fn(),
    changeCurrentUserPassword: vi.fn(),
    getLoginTypes: vi.fn(),
  })),
  LoginRequest: vi.fn().mockImplementation((args: unknown) => args),
}));

// Imported AFTER mocks are registered
import { useUser } from "@core/composables/useUser";
import { useUserManagement } from "@core/composables/useUserManagement";

describe("useUser + useUserManagement — singleton invariants", () => {
  it("share the same `loading` ComputedRef instance", () => {
    const u = useUser();
    const m = useUserManagement();
    expect(u.loading).toBe(m.loading);
  });

  it("share the same `user` ComputedRef instance", () => {
    const u = useUser();
    const m = useUserManagement();
    expect(u.user).toBe(m.user);
  });

  it("share the same `isAuthenticated` ComputedRef instance", () => {
    const u = useUser();
    const m = useUserManagement();
    expect(u.isAuthenticated).toBe(m.isAuthenticated);
  });

  it("share the same `isAdministrator` ComputedRef instance", () => {
    const u = useUser();
    const m = useUserManagement();
    expect(u.isAdministrator).toBe(m.isAdministrator);
  });

  it("share the same `loadUser` function reference", () => {
    const u = useUser();
    const m = useUserManagement();
    expect(u.loadUser).toBe(m.loadUser);
  });

  it("share the same `signOut` function reference", () => {
    const u = useUser();
    const m = useUserManagement();
    expect(u.signOut).toBe(m.signOut);
  });

  // Behavioral check: reference identity implies shared state, but an accidental
  // readonly() wrapper on one selector could pass identity checks while breaking
  // mutation propagation. This test exercises the end-to-end path.
  it("mutation via useUserManagement.loadUser is visible through useUser", async () => {
    const u = useUser();
    const m = useUserManagement();

    const fetchedUser = { userName: "shared@vc.com", isAdministrator: true };
    mockGetCurrentUser.mockResolvedValueOnce(fetchedUser);

    await m.loadUser();

    expect(u.user.value?.userName).toBe("shared@vc.com");
    expect(u.isAuthenticated.value).toBe(true);
    expect(u.isAdministrator.value).toBe(true);
  });
});
