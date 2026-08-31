import { describe, it, expect, vi } from "vitest";
import type { Router } from "vue-router";
import { navigateToMainRoute, resolveMainRoute } from "./navigateToMainRoute";

function routerWith(routes: Array<{ name?: string; path: string; meta?: object; aliasOf?: { path: string } }>) {
  const replace = vi.fn();
  return {
    router: { getRoutes: () => routes, replace } as unknown as Router,
    replace,
  };
}

describe("resolveMainRoute", () => {
  it("returns the route marked meta.root", () => {
    const { router } = routerWith([
      { name: "Login", path: "/login" },
      { name: "App", path: "/", meta: { root: true } },
    ]);

    expect(resolveMainRoute(router)?.name).toBe("App");
  });

  it("prefers an alias of the root route", () => {
    const { router } = routerWith([
      { name: "App", path: "/", meta: { root: true } },
      { name: "AppAlias", path: "/:sellerId", aliasOf: { path: "/" } },
    ]);

    expect(resolveMainRoute(router)?.name).toBe("AppAlias");
  });

  // With no root route the alias predicate reads `r.aliasOf?.path === undefined`,
  // which is true for every route that has no alias — so an unguarded `find`
  // hands back whatever was registered first, and "go home" lands on Login.
  it("returns nothing when no route declares meta.root", () => {
    const { router } = routerWith([
      { name: "Login", path: "/login" },
      { name: "Reset", path: "/reset" },
    ]);

    expect(resolveMainRoute(router)).toBeUndefined();
  });
});

describe("navigateToMainRoute", () => {
  it("replaces with the root route, passing params through", () => {
    const { router, replace } = routerWith([{ name: "App", path: "/", meta: { root: true } }]);

    navigateToMainRoute(router, { sellerId: "acme" });

    expect(replace).toHaveBeenCalledWith({ name: "App", params: { sellerId: "acme" } });
  });

  it("does not navigate when no route declares meta.root", () => {
    const { router, replace } = routerWith([{ name: "Login", path: "/login" }]);

    navigateToMainRoute(router);

    expect(replace).not.toHaveBeenCalled();
  });
});
