import { describe, it, expect, vi } from "vitest";
import { createMemoryHistory, createRouter, type Router, type RouteRecordRaw } from "vue-router";
import { mainRouteLocation, navigateToMainRoute, resolveMainRoute } from "./navigateToMainRoute";

function routerWith(routes: Array<{ name?: string; path: string; meta?: object; aliasOf?: { path: string } }>) {
  const replace = vi.fn();
  return {
    router: { getRoutes: () => routes, replace } as unknown as Router,
    replace,
  };
}

const Empty = { render: () => null };

/** An app whose main route renders its default page as an empty-path child */
function appRouter(mainPath = "/"): Router {
  const routes: RouteRecordRaw[] = [
    { path: "/login", name: "Login", component: Empty },
    {
      path: mainPath,
      name: "App",
      component: Empty,
      meta: { root: true },
      children: [{ path: "", name: "Home", component: Empty }],
    },
  ];
  return createRouter({ history: createMemoryHistory(), routes });
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

describe("mainRouteLocation", () => {
  // Resolved by name, Vue Router matches only the named record, not its empty-path child,
  // and the main route's <router-view> renders nothing. By path, the default page is matched.
  it("is the main route's path, so its default child page is matched", () => {
    const router = appRouter();

    const location = mainRouteLocation(router);

    expect(location).toEqual({ path: "/" });
    expect(router.resolve(location!).matched.map((r) => r.name)).toEqual(["App", "Home"]);
  });

  it("keeps the tenant prefix", () => {
    const router = appRouter("/:sellerId");

    const location = mainRouteLocation(router, { sellerId: "acme" });

    expect(location).toEqual({ path: "/acme" });
    expect(router.resolve(location!).matched.map((r) => r.name)).toEqual(["App", "Home"]);
  });

  it("is undefined when no route declares meta.root", () => {
    const { router } = routerWith([{ name: "Login", path: "/login" }]);

    expect(mainRouteLocation(router)).toBeUndefined();
  });
});

describe("navigateToMainRoute", () => {
  it("lands on the main route's default child page", async () => {
    const router = appRouter();
    await router.push("/login");

    navigateToMainRoute(router);
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe("Home"));

    expect(router.currentRoute.value.fullPath).toBe("/");
    expect(router.currentRoute.value.matched.map((r) => r.name)).toEqual(["App", "Home"]);
  });

  it("replaces with the main route's path, passing params through", () => {
    const router = appRouter("/:sellerId");
    const replace = vi.spyOn(router, "replace");

    navigateToMainRoute(router, { sellerId: "acme" });

    expect(replace).toHaveBeenCalledWith({ path: "/acme" });
  });

  it("does not navigate when no route declares meta.root", () => {
    const { router, replace } = routerWith([{ name: "Login", path: "/login" }]);

    navigateToMainRoute(router);

    expect(replace).not.toHaveBeenCalled();
  });
});
