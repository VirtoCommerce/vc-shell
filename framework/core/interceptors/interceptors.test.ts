import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computed } from "vue";

const signOut = vi.fn();
const loggerError = vi.fn();
const loggerWarn = vi.fn();
const notificationError = vi.fn();

// Mutable so a test can exercise a 401 arriving while nobody is signed in.
let authenticated = true;

vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => ({
    signOut,
    isAuthenticated: computed(() => authenticated),
  }),
}));

vi.mock("@core/composables/useSlowNetworkDetection", () => ({
  useSlowNetworkDetection: () => ({
    trackRequest: vi.fn(),
    untrackRequest: vi.fn(),
  }),
}));

vi.mock("@core/notifications/notification", () => ({
  notification: {
    error: (...args: unknown[]) => notificationError(...args),
    warning: vi.fn(),
  },
}));

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    error: (...args: unknown[]) => loggerError(...args),
    warn: (...args: unknown[]) => loggerWarn(...args),
    debug: vi.fn(),
    info: vi.fn(),
  }),
}));

import { registerInterceptors } from "./index";
import { isSessionExpired, resetSessionExpired } from "@core/utilities/sessionExpiration";

function flushMicrotasks() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function createRouter() {
  const push = vi.fn();
  return {
    push,
    getRoutes: () => [{ path: "/login", name: "Login" }],
    currentRoute: { value: { path: "/dashboard" } },
  } as any;
}

describe("registerInterceptors — 401 handling", () => {
  let originalFetch: typeof window.fetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    signOut.mockReset();
    loggerError.mockReset();
    loggerWarn.mockReset();
    notificationError.mockReset();
    authenticated = true;
    resetSessionExpired();
  });

  afterEach(() => {
    window.fetch = originalFetch;
    authenticated = true;
    resetSessionExpired();
  });

  it("marks the session expired on a 401 so data-load errors get suppressed", async () => {
    signOut.mockResolvedValue(undefined);
    const router = createRouter();
    const originalImpl = vi.fn().mockResolvedValue({ status: 401 });
    window.fetch = originalImpl as unknown as typeof window.fetch;

    expect(isSessionExpired()).toBe(false);

    const patched = registerInterceptors(router);
    await patched("/api/platform/test");
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(true);
  });

  it("redirects and notifies even when signOut rejects", async () => {
    signOut.mockRejectedValue(new Error("network down"));
    const router = createRouter();
    const originalImpl = vi.fn().mockResolvedValue({ status: 401 });
    window.fetch = originalImpl as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/api/platform/test");
    await flushMicrotasks();

    expect(signOut).toHaveBeenCalledOnce();
    expect(loggerError).toHaveBeenCalledWith("signOut failed after 401:", expect.any(Error));
    expect(router.push).toHaveBeenCalledWith("/login");
    expect(notificationError).toHaveBeenCalledOnce();
  });

  it("redirects and notifies on the signOut success path", async () => {
    signOut.mockResolvedValue(undefined);
    const router = createRouter();
    const originalImpl = vi.fn().mockResolvedValue({ status: 401 });
    window.fetch = originalImpl as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/api/platform/test");
    await flushMicrotasks();

    expect(signOut).toHaveBeenCalledOnce();
    expect(loggerError).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/login");
    expect(notificationError).toHaveBeenCalledOnce();
  });

  it("handles concurrent 401s from the same dead session exactly once", async () => {
    signOut.mockResolvedValue(undefined);
    const router = createRouter();
    const originalImpl = vi.fn().mockResolvedValue({ status: 401 });
    window.fetch = originalImpl as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    // Three blade loads racing on the page we were navigating to
    await Promise.all([patched("/api/platform/a"), patched("/api/platform/b"), patched("/api/platform/c")]);
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(true);
    expect(signOut).toHaveBeenCalledOnce();
    expect(router.push).toHaveBeenCalledOnce();
    expect(notificationError).toHaveBeenCalledOnce();
  });

  it("does not flag the session when a 401 arrives while nobody is signed in", async () => {
    authenticated = false;
    const router = createRouter();
    const originalImpl = vi.fn().mockResolvedValue({ status: 401 });
    window.fetch = originalImpl as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/api/platform/test");
    await flushMicrotasks();

    // Nothing to sign out of, no redirect to perform — and crucially no latched flag,
    // which would silence every error in the app for the rest of the page's life.
    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
    expect(notificationError).not.toHaveBeenCalled();
  });
});

describe("registerInterceptors — idempotency", () => {
  let originalFetch: typeof window.fetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    loggerWarn.mockReset();
  });

  afterEach(() => {
    window.fetch = originalFetch;
  });

  it("ignores a second install and returns the existing patched fetch", () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue({ status: 200 }) as unknown as typeof window.fetch;

    const first = registerInterceptors(router);
    const second = registerInterceptors(router);

    expect(second).toBe(first);
    expect(loggerWarn).toHaveBeenCalledWith("registerInterceptors called twice — ignoring second install");
  });
});
