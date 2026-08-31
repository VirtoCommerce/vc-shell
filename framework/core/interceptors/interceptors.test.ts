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
    expect(loggerError).toHaveBeenCalledWith("signOut failed after session expiry:", expect.any(Error));
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

describe("registerInterceptors — session expiry without a 401", () => {
  let originalFetch: typeof window.fetch;

  // A platform that redirects instead of answering 401: fetch follows the
  // redirect transparently, so the interceptor sees a 200 carrying HTML.
  function loginPageResponse(overrides: Record<string, unknown> = {}) {
    return {
      status: 200,
      ok: true,
      redirected: true,
      url: "http://localhost:3000/account/login?ReturnUrl=%2Fapi%2Fplatform%2Ftest",
      headers: { get: (name: string) => (name.toLowerCase() === "content-type" ? "text/html; charset=utf-8" : null) },
      ...overrides,
    };
  }

  function jsonResponse(status = 200) {
    return {
      status,
      ok: status < 400,
      redirected: false,
      url: "http://localhost:3000/api/platform/test",
      headers: { get: (name: string) => (name.toLowerCase() === "content-type" ? "application/json" : null) },
    };
  }

  beforeEach(() => {
    originalFetch = window.fetch;
    signOut.mockReset();
    loggerError.mockReset();
    notificationError.mockReset();
    authenticated = true;
    resetSessionExpired();
  });

  afterEach(() => {
    window.fetch = originalFetch;
    authenticated = true;
    resetSessionExpired();
  });

  it("treats an API call answered with an HTML login page as an expired session", async () => {
    signOut.mockResolvedValue(undefined);
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue(loginPageResponse()) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await expect(patched("/api/platform/test")).rejects.toMatchObject({ name: "SessionExpiredError" });
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(true);
    expect(signOut).toHaveBeenCalledOnce();
    expect(router.push).toHaveBeenCalledWith("/login");
    expect(notificationError).toHaveBeenCalledOnce();
  });

  // The caller asked for data and got a document. Handing the HTML back made every caller
  // JSON.parse it, so a burst produced one "Unexpected token '<'" toast per request on a page
  // that was already redirecting to login (VCST-5688).
  it("fails the request instead of handing the login page's HTML to the caller", async () => {
    signOut.mockResolvedValue(undefined);
    const router = createRouter();
    const response = loginPageResponse();
    window.fetch = vi.fn().mockResolvedValue(response) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    const settled = await patched("/api/platform/test").then(
      (value) => ({ ok: true as const, value }),
      (error) => ({ ok: false as const, error }),
    );

    expect(settled.ok).toBe(false);
    if (!settled.ok) {
      expect(settled.error).not.toBe(response);
      expect((settled.error as Error).name).toBe("SessionExpiredError");
    }
  });

  it("recognises the login page by its URL when the content type is absent", async () => {
    signOut.mockResolvedValue(undefined);
    const router = createRouter();
    window.fetch = vi
      .fn()
      .mockResolvedValue(loginPageResponse({ headers: { get: () => null } })) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await expect(patched("/api/platform/test")).rejects.toMatchObject({ name: "SessionExpiredError" });
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(true);
  });

  it("acts once for a burst of concurrent requests that all land on the login page", async () => {
    signOut.mockResolvedValue(undefined);
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue(loginPageResponse()) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    const results = await Promise.allSettled([
      patched("/api/platform/a"),
      patched("/api/platform/b"),
      patched("/api/platform/c"),
    ]);
    await flushMicrotasks();

    // Every request in the burst fails, and with the same error — so a consumer that does
    // surface it shows one de-duplicated message rather than one per request.
    expect(results.map((r) => r.status)).toEqual(["rejected", "rejected", "rejected"]);
    const messages = new Set(results.map((r) => (r as PromiseRejectedResult).reason.message));
    expect(messages.size).toBe(1);

    expect(signOut).toHaveBeenCalledOnce();
    expect(router.push).toHaveBeenCalledOnce();
    expect(notificationError).toHaveBeenCalledOnce();
  });

  // A 401 body is not a document, so nothing parses markup, and callers may branch on the
  // status themselves — that contract is deliberately unchanged.
  it("still returns a 401 response to the caller", async () => {
    signOut.mockResolvedValue(undefined);
    const router = createRouter();
    const response = jsonResponse(401);
    window.fetch = vi.fn().mockResolvedValue(response) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await expect(patched("/api/platform/test")).resolves.toBe(response);
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(true);
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("leaves an ordinary JSON response alone", async () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue(jsonResponse()) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/api/platform/test");
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  // 403 means authenticated-but-unauthorized. Signing the user out would be wrong.
  it("does not sign out on a 403", async () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue(jsonResponse(403)) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/api/platform/test");
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
    expect(notificationError).not.toHaveBeenCalled();
  });

  // An endpoint that legitimately serves HTML (a rendered template, an export)
  // must not be mistaken for a session death — the redirect is what makes it one.
  it("leaves an HTML response that was not redirected alone", async () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue(
      loginPageResponse({
        redirected: false,
        url: "http://localhost:3000/api/platform/notifications/template/preview",
      }),
    ) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/api/platform/notifications/template/preview");
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  it("does not act on a login page while nobody is signed in", async () => {
    authenticated = false;
    const router = createRouter();
    const response = loginPageResponse();
    window.fetch = vi.fn().mockResolvedValue(response) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    // Also must not fail the request: before sign-in a login page is an expected answer,
    // not a session death.
    await expect(patched("/api/platform/test")).resolves.toBe(response);
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });

  // The sign-in POST goes to /api/platform/security/login, whose pathname matches the
  // login-page pattern, so its own 200 looks exactly like a session death. It survives only
  // because useUser.signIn calls resetSessionExpired() BEFORE issuing the request. If that
  // order is ever swapped, sign-in breaks — this test is here to catch that.
  it("does not fail the sign-in request itself", async () => {
    authenticated = false;
    const router = createRouter();
    const response = {
      status: 200,
      ok: true,
      redirected: false,
      url: "http://localhost:3000/api/platform/security/login",
      headers: { get: () => "application/json" },
    };
    window.fetch = vi.fn().mockResolvedValue(response) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await expect(patched("/api/platform/security/login", { method: "POST" })).resolves.toBe(response);

    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });
});

describe("registerInterceptors — a dead session revealed outside /api/", () => {
  let originalFetch: typeof window.fetch;

  beforeEach(() => {
    originalFetch = window.fetch;
    signOut.mockReset();
    signOut.mockResolvedValue(undefined);
    loggerError.mockReset();
    notificationError.mockReset();
    authenticated = true;
    resetSessionExpired();
  });

  afterEach(() => {
    window.fetch = originalFetch;
    authenticated = true;
    resetSessionExpired();
  });

  // The bug this covers: SignalR negotiates against /pushNotificationHub, so its
  // 401 never reached the check, and when the API answered the same dead session
  // with a 403 nothing signed the user out at all.
  it("signs out on a 401 from the notification hub", async () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue({ status: 401 }) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/pushNotificationHub/negotiate?negotiateVersion=1", { method: "POST" });
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(true);
    expect(signOut).toHaveBeenCalledOnce();
    expect(router.push).toHaveBeenCalledWith("/login");
  });

  it("still hands the 401 back to the caller", async () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue({ status: 401 }) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    const response = await patched("/pushNotificationHub/negotiate");

    expect(response.status).toBe(401);
  });

  it("acts once when the hub retries against the same dead session", async () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue({ status: 401 }) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/pushNotificationHub/negotiate");
    await patched("/pushNotificationHub/negotiate");
    await patched("/pushNotificationHub/negotiate");
    await flushMicrotasks();

    expect(signOut).toHaveBeenCalledOnce();
    expect(notificationError).toHaveBeenCalledOnce();
  });

  it("leaves a cross-origin 401 alone", async () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue({ status: 401 }) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("https://third-party.example.com/whoami");
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  // The login-page heuristic stays API-only: a non-API same-origin request may
  // legitimately answer with a redirect to HTML, and failing those would break
  // ordinary page loads.
  it("does not treat a redirected HTML response outside /api/ as expiry", async () => {
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      redirected: true,
      url: "https://localhost/some/page",
      headers: { get: () => "text/html" },
    }) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/some/page");
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("does not act on a hub 401 while nobody is signed in", async () => {
    authenticated = false;
    const router = createRouter();
    window.fetch = vi.fn().mockResolvedValue({ status: 401 }) as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/pushNotificationHub/negotiate");
    await flushMicrotasks();

    expect(isSessionExpired()).toBe(false);
    expect(signOut).not.toHaveBeenCalled();
  });

  it("does not apply the API timeout to a hub request", async () => {
    const router = createRouter();
    const impl = vi.fn().mockResolvedValue({ status: 200 });
    window.fetch = impl as unknown as typeof window.fetch;

    const patched = registerInterceptors(router);
    await patched("/pushNotificationHub/negotiate");

    // Hardening stays scoped to /api/: the hub's own long-lived requests must not
    // be aborted after 30s, so no AbortSignal is injected here.
    expect(impl).toHaveBeenCalledWith("/pushNotificationHub/negotiate");
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
