import { computed } from "vue";

// Mock the internal user logic
const mockInternals = {
  user: computed(() => ({ id: "u1", userName: "admin" })),
  loading: computed(() => false),
  isAdministrator: computed(() => true),
  isAuthenticated: computed(() => true),
  validateToken: vi.fn().mockResolvedValue(true),
  validatePassword: vi.fn().mockResolvedValue({ succeeded: true }),
  resetPasswordByToken: vi.fn().mockResolvedValue({ succeeded: true }),
  getLoginType: vi.fn().mockResolvedValue([]),
  loadUser: vi.fn().mockResolvedValue({ id: "u1", userName: "admin" }),
  requestPasswordReset: vi.fn().mockResolvedValue({ succeeded: true }),
  changeUserPassword: vi.fn().mockResolvedValue({ succeeded: true }),
  signIn: vi.fn().mockResolvedValue({ succeeded: true }),
  signOut: vi.fn().mockResolvedValue(undefined),
};

vi.mock("@core/composables/useUser", () => ({
  _sharedInternalUserLogic: () => mockInternals,
}));

import { useUserManagement } from "./index";

describe("useUserManagement", () => {
  it("returns the expected API surface", () => {
    const result = useUserManagement();
    expect(result.user).toBeDefined();
    expect(result.loading).toBeDefined();
    expect(result.isAdministrator).toBeDefined();
    expect(result.isAuthenticated).toBeDefined();
    expect(result.validateToken).toBeTypeOf("function");
    expect(result.validatePassword).toBeTypeOf("function");
    expect(result.resetPasswordByToken).toBeTypeOf("function");
    expect(result.getLoginType).toBeTypeOf("function");
    expect(result.loadUser).toBeTypeOf("function");
    expect(result.requestPasswordReset).toBeTypeOf("function");
    expect(result.changeUserPassword).toBeTypeOf("function");
    expect(result.signIn).toBeTypeOf("function");
    expect(result.signOut).toBeTypeOf("function");
  });

  it("user computed returns user data", () => {
    const { user } = useUserManagement();
    expect(user.value).toEqual({ id: "u1", userName: "admin" });
  });

  it("loading computed returns false", () => {
    const { loading } = useUserManagement();
    expect(loading.value).toBe(false);
  });

  it("isAdministrator computed returns true", () => {
    const { isAdministrator } = useUserManagement();
    expect(isAdministrator.value).toBe(true);
  });

  it("isAuthenticated computed returns true", () => {
    const { isAuthenticated } = useUserManagement();
    expect(isAuthenticated.value).toBe(true);
  });

  it("validateToken delegates to internals", async () => {
    const { validateToken } = useUserManagement();
    const result = await validateToken("u1", "token-abc");
    expect(mockInternals.validateToken).toHaveBeenCalledWith("u1", "token-abc");
    expect(result).toBe(true);
  });

  it("signIn delegates to internals", async () => {
    const { signIn } = useUserManagement();
    const result = await signIn("admin", "password123");
    expect(mockInternals.signIn).toHaveBeenCalledWith("admin", "password123");
    expect(result).toEqual({ succeeded: true });
  });

  it("signOut delegates to internals", async () => {
    const { signOut } = useUserManagement();
    await signOut();
    expect(mockInternals.signOut).toHaveBeenCalled();
  });

  it("loadUser delegates to internals", async () => {
    const { loadUser } = useUserManagement();
    const result = await loadUser();
    expect(mockInternals.loadUser).toHaveBeenCalled();
    expect(result).toEqual({ id: "u1", userName: "admin" });
  });

  it("changeUserPassword delegates to internals", async () => {
    const { changeUserPassword } = useUserManagement();
    const result = await changeUserPassword("old", "new");
    expect(mockInternals.changeUserPassword).toHaveBeenCalledWith("old", "new");
    expect(result).toEqual({ succeeded: true });
  });
});
