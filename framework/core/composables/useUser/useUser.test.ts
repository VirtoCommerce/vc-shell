import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Stable mock function references ---
// These live at module scope so the SecurityClient mock factory can close over them.
// Each test configures getCurrentUser behavior via mockImplementationOnce / mockResolvedValueOnce.
const mockGetCurrentUser = vi.fn();
const mockPerformanceMark = vi.fn();

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

vi.mock("@shared/components/sign-in/useExternalProvider", () => ({
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

// Import after mocks are registered
import { _createInternalUserLogic } from "./index";

// Use a single store reference accessible across tests for localStorage mock
let localStorageStore: Record<string, string> = {};

beforeEach(() => {
  // Reset only the mock functions' call history and implementation queues.
  // Do NOT call vi.restoreAllMocks() — it also restores vi.mock()-created mocks
  // (including SecurityClient), breaking them for subsequent tests.
  mockGetCurrentUser.mockReset();
  mockPerformanceMark.mockReset();

  // Fresh localStorage per test
  localStorageStore = {};
  vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) => localStorageStore[key] ?? null);
  vi.spyOn(Storage.prototype, "setItem").mockImplementation((key, value) => {
    localStorageStore[key] = value;
  });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation((key) => {
    delete localStorageStore[key];
  });

  // Stub performance.mark globally (jsdom exposes performance.mark natively,
  // but we want to spy on it to verify it's called with the right marks)
  vi.stubGlobal("performance", { mark: mockPerformanceMark });
});

// NOTE: No afterEach with vi.restoreAllMocks() — this would restore SecurityClient
// mock and break subsequent tests. Each beforeEach resets what it needs.

describe("loadUser() - parallelization", () => {
  it("Test 1: getCurrentUser() starts immediately when loadUser() is called", async () => {
    let getCurrentUserStarted = false;
    let resolveCurrentUser!: (value: any) => void;

    mockGetCurrentUser.mockImplementationOnce(
      () =>
        new Promise<any>((resolve) => {
          getCurrentUserStarted = true;
          resolveCurrentUser = resolve;
        }),
    );

    const logic = _createInternalUserLogic();
    const loadUserPromise = logic.loadUser();

    // After one microtask, getCurrentUser should already have been called
    await Promise.resolve();
    expect(getCurrentUserStarted).toBe(true);
    expect(mockGetCurrentUser).toHaveBeenCalledTimes(1);

    // Resolve to let loadUser complete
    resolveCurrentUser({ userName: "concurrent@vc.com", isAdministrator: false });
    await loadUserPromise;
  });

  it("Test 2: loadUser() returns the UserDetail from getCurrentUser()", async () => {
    const expectedUser = { userName: "admin@vc.com", isAdministrator: true };
    mockGetCurrentUser.mockResolvedValueOnce(expectedUser);

    const logic = _createInternalUserLogic();
    const result = await logic.loadUser();

    expect(result.userName).toBe("admin@vc.com");
    expect(result.isAdministrator).toBe(true);
  });

  it("Test 3: loadUser() sets user.value to the getCurrentUser() result", async () => {
    const expectedUser = { userName: "user@vc.com", isAdministrator: false };
    mockGetCurrentUser.mockResolvedValueOnce(expectedUser);

    const logic = _createInternalUserLogic();
    await logic.loadUser();

    // user is module-level ref; loadUser sets it to the getCurrentUser() result
    expect(logic.user.value?.userName).toBe("user@vc.com");
    expect(logic.user.value?.isAdministrator).toBe(false);
  });

  it("Test 4: loadUser() catches errors from getCurrentUser() and does not throw", async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error("Network error"));

    const logic = _createInternalUserLogic();

    // Should not throw — error is caught internally and logged
    await expect(logic.loadUser()).resolves.not.toThrow();
  });

  it("Test 5: loadUser() resets loading to false in finally block — even after error", async () => {
    mockGetCurrentUser.mockRejectedValueOnce(new Error("Server error"));

    const logic = _createInternalUserLogic();
    await logic.loadUser();

    expect(logic.loading.value).toBe(false);
  });

  it("emits vc:auth-start and vc:auth-done performance marks in correct order", async () => {
    const expectedUser = { userName: "perf@vc.com", isAdministrator: false };
    mockGetCurrentUser.mockResolvedValueOnce(expectedUser);

    const logic = _createInternalUserLogic();
    await logic.loadUser();

    expect(mockPerformanceMark).toHaveBeenCalledWith("vc:auth-start");
    expect(mockPerformanceMark).toHaveBeenCalledWith("vc:auth-done");

    // auth-start must come before auth-done
    const calls = mockPerformanceMark.mock.calls.map((c: string[]) => c[0]);
    const startIdx = calls.indexOf("vc:auth-start");
    const doneIdx = calls.indexOf("vc:auth-done");
    expect(startIdx).toBeGreaterThanOrEqual(0);
    expect(doneIdx).toBeGreaterThanOrEqual(0);
    expect(startIdx).toBeLessThan(doneIdx);
  });
});
