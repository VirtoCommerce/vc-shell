import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import type { RouteLocationNormalized } from "vue-router";
import type { AuthState } from "@core/composables/useUser";
import { authGuard } from "./authGuard";

function route(root: boolean, fullPath = "/orders"): RouteLocationNormalized {
  return { meta: { root }, fullPath } as unknown as RouteLocationNormalized;
}

/** A guard's dependencies, with `loadUser` moving the state to `afterLoad` the way a real load would. */
function deps(initial: AuthState, afterLoad: AuthState = initial) {
  const authState = ref<AuthState>(initial);
  return {
    authState,
    loadUser: vi.fn(async () => {
      authState.value = afterLoad;
    }),
    onSessionCheckFailed: vi.fn(),
  };
}

// An in-memory storage stubbed per test: under Node 26 the global `localStorage` is not jsdom's.
let store: Record<string, string>;

describe("authGuard (VM-1829)", () => {
  beforeEach(() => {
    store = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("lets an authenticated session through without loading the user again", async () => {
    const d = deps("authenticated");

    await expect(authGuard(route(true), d)).resolves.toBeUndefined();
    expect(d.loadUser).not.toHaveBeenCalled();
  });

  it("sends an anonymous session to Login and remembers where it was going", async () => {
    const d = deps("anonymous");

    await expect(authGuard(route(true, "/orders/42"), d)).resolves.toEqual({ name: "Login" });
    expect(localStorage.getItem("redirectAfterLogin")).toBe("/orders/42");
    expect(d.loadUser).not.toHaveBeenCalled();
  });

  it("asks for the user once more while the session is unknown, and lets it through when it is signed in", async () => {
    const d = deps("unknown", "authenticated");

    await expect(authGuard(route(true), d)).resolves.toBeUndefined();
    expect(d.loadUser).toHaveBeenCalledTimes(1);
    expect(d.onSessionCheckFailed).not.toHaveBeenCalled();
  });

  it("sends an unknown session to Login when the second load says it is not signed in", async () => {
    const d = deps("unknown", "anonymous");

    await expect(authGuard(route(true), d)).resolves.toEqual({ name: "Login" });
  });

  it("cancels the navigation and reports, but never sends to Login, when the session still cannot be checked", async () => {
    const d = deps("unknown", "unknown");

    await expect(authGuard(route(true), d)).resolves.toBe(false);
    expect(d.onSessionCheckFailed).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("redirectAfterLogin")).toBeNull();
  });

  it("leaves non-root routes alone, whatever the session", async () => {
    const d = deps("anonymous");

    await expect(authGuard(route(false), d)).resolves.toBeUndefined();
    expect(d.loadUser).not.toHaveBeenCalled();
  });
});
