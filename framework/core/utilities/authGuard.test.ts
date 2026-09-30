import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computed, ref } from "vue";
import type { RouteLocationNormalized } from "vue-router";
import { requireAuthentication } from "./authGuard";

const route = (meta: Record<string, unknown>, fullPath = "/products") =>
  ({ meta, fullPath }) as unknown as RouteLocationNormalized;

function userManagement(options: { signedIn: boolean; loadSucceeds: boolean }) {
  const userName = ref<string | undefined>(options.signedIn ? "seller" : undefined);
  return {
    isAuthenticated: computed(() => userName.value != null),
    loadUser: vi.fn(async () => {
      if (options.loadSucceeds) userName.value = "seller";
      return { userName: userName.value };
    }),
  };
}

// A stubbed global rather than jsdom's storage: on Node 25+ Node's own `localStorage` global,
// undefined without --localstorage-file, shadows jsdom's.
let stored: Record<string, string> = {};
beforeEach(() => {
  stored = {};
  vi.stubGlobal("localStorage", {
    setItem: (key: string, value: string) => {
      stored[key] = String(value);
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("requireAuthentication", () => {
  it("lets a signed-in user through without asking the server again", async () => {
    const users = userManagement({ signedIn: true, loadSucceeds: true });

    expect(await requireAuthentication(route({ root: true }), users)).toBeUndefined();
    expect(users.loadUser).not.toHaveBeenCalled();
  });

  it("loads the user before deciding, so a failed load at startup does not end a live session", async () => {
    // The app's own startup `loadUser()` failed (a 5xx or a dropped connection), so no user is
    // held — but the session cookie is alive and the next request for the user succeeds.
    const users = userManagement({ signedIn: false, loadSucceeds: true });

    expect(await requireAuthentication(route({ root: true }), users)).toBeUndefined();
    expect(users.loadUser).toHaveBeenCalledOnce();
    expect(stored.redirectAfterLogin).toBeUndefined();
  });

  it("sends a user the server does not know to the login page, remembering where they were going", async () => {
    const users = userManagement({ signedIn: false, loadSucceeds: false });

    expect(await requireAuthentication(route({ root: true }, "/orders/order/1"), users)).toEqual({ name: "Login" });
    expect(stored.redirectAfterLogin).toBe("/orders/order/1");
  });

  it("sends the user to the login page when loading the user throws", async () => {
    const users = userManagement({ signedIn: false, loadSucceeds: false });
    users.loadUser.mockRejectedValueOnce(new Error("network down"));

    expect(await requireAuthentication(route({ root: true }), users)).toEqual({ name: "Login" });
  });

  it("does not guard routes outside the app's root", async () => {
    const users = userManagement({ signedIn: false, loadSucceeds: false });

    expect(await requireAuthentication(route({}), users)).toBeUndefined();
    expect(users.loadUser).not.toHaveBeenCalled();
  });
});
