import { describe, it, expect, vi } from "vitest";
import { computed } from "vue";
import type { Router } from "vue-router";
import {
  buildUrlFromStack,
  parseBladeUrl,
  buildQueryString,
  createRouterUrlSink,
  createUrlSync,
} from "@core/blade-navigation/utils/urlSync";
import type { BladeDescriptor, IBladeStack } from "@core/blade-navigation/types";
import { createBladeStack } from "@core/blade-navigation/useBladeStack";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";

// ── Helper ──────────────────────────────────────────────────────────────────────

function makeDescriptor(overrides: Partial<BladeDescriptor> = {}): BladeDescriptor {
  return {
    id: "blade_1",
    name: "TestBlade",
    visible: true,
    ...overrides,
  };
}

// ── buildUrlFromStack ───────────────────────────────────────────────────────────

describe("buildUrlFromStack", () => {
  it("returns root path for empty stack", () => {
    const result = buildUrlFromStack("", []);
    expect(result.path).toBe("/");
    expect(result.query).toEqual({});
  });

  it("returns tenant root for empty stack with tenant prefix", () => {
    const result = buildUrlFromStack("tenant-abc", []);
    expect(result.path).toBe("/tenant-abc");
  });

  it("builds workspace-only URL", () => {
    const stack = [makeDescriptor({ name: "Orders", url: "/orders" })];
    const result = buildUrlFromStack("", stack);
    expect(result.path).toBe("/orders");
  });

  it("builds workspace-only URL with tenant", () => {
    const stack = [makeDescriptor({ name: "Orders", url: "/orders" })];
    const result = buildUrlFromStack("seller-123", stack);
    expect(result.path).toBe("/seller-123/orders");
  });

  it("builds workspace + child blade URL", () => {
    const stack = [
      makeDescriptor({ id: "ws", name: "Orders", url: "/orders" }),
      makeDescriptor({ id: "child", name: "OrderDetails", url: "/order", param: "uuid-1", parentId: "ws" }),
    ];
    const result = buildUrlFromStack("", stack);
    expect(result.path).toBe("/orders/order/uuid-1");
  });

  it("builds workspace + child blade URL with tenant", () => {
    const stack = [
      makeDescriptor({ id: "ws", name: "Orders", url: "/orders" }),
      makeDescriptor({ id: "child", name: "OrderDetails", url: "/order", param: "abc-123", parentId: "ws" }),
    ];
    const result = buildUrlFromStack("seller-1", stack);
    expect(result.path).toBe("/seller-1/orders/order/abc-123");
  });

  it("skips invisible child blades", () => {
    const stack = [
      makeDescriptor({ id: "ws", name: "Orders", url: "/orders" }),
      makeDescriptor({ id: "child", name: "OrderDetails", url: "/order", param: "x", visible: false }),
    ];
    const result = buildUrlFromStack("", stack);
    expect(result.path).toBe("/orders");
  });

  it("uses last visible child blade", () => {
    const stack = [
      makeDescriptor({ id: "ws", name: "Orders", url: "/orders" }),
      makeDescriptor({ id: "c1", name: "OldBlade", url: "/old", param: "old-id", visible: false }),
      makeDescriptor({ id: "c2", name: "NewBlade", url: "/new", param: "new-id" }),
    ];
    const result = buildUrlFromStack("", stack);
    expect(result.path).toBe("/orders/new/new-id");
  });

  it("normalizes URLs with leading/trailing slashes", () => {
    const stack = [makeDescriptor({ name: "Orders", url: "//orders/" })];
    const result = buildUrlFromStack("", stack);
    expect(result.path).toBe("/orders");
  });

  it("merges query params from visible blades", () => {
    const stack = [
      makeDescriptor({ name: "Orders", url: "/orders", query: { page: "1" } }),
      makeDescriptor({ name: "Details", url: "/order", query: { tab: "info" }, parentId: "ws" }),
    ];
    const result = buildUrlFromStack("", stack);
    expect(result.query).toEqual({ page: "1", tab: "info" });
  });

  it("ignores query from invisible blades", () => {
    const stack = [
      makeDescriptor({ name: "Orders", url: "/orders", query: { page: "1" } }),
      makeDescriptor({ name: "Details", url: "/order", query: { tab: "info" }, visible: false }),
    ];
    const result = buildUrlFromStack("", stack);
    expect(result.query).toEqual({ page: "1" });
  });
});

// ── parseBladeUrl ───────────────────────────────────────────────────────────────

describe("parseBladeUrl", () => {
  it("returns empty for root path", () => {
    expect(parseBladeUrl("/")).toEqual({});
  });

  it("returns empty for empty string", () => {
    expect(parseBladeUrl("")).toEqual({});
  });

  it("parses workspace-only path", () => {
    expect(parseBladeUrl("/orders")).toEqual({ workspaceUrl: "orders" });
  });

  it("parses workspace + blade path", () => {
    expect(parseBladeUrl("/orders/order")).toEqual({
      workspaceUrl: "orders",
      bladeUrl: "order",
    });
  });

  it("parses workspace + blade + param path", () => {
    expect(parseBladeUrl("/orders/order/uuid-123")).toEqual({
      workspaceUrl: "orders",
      bladeUrl: "order",
      param: "uuid-123",
    });
  });

  it("strips tenant prefix", () => {
    expect(parseBladeUrl("/seller-1/orders/order/id-1", "seller-1")).toEqual({
      workspaceUrl: "orders",
      bladeUrl: "order",
      param: "id-1",
    });
  });

  it("handles missing tenant prefix gracefully", () => {
    expect(parseBladeUrl("/orders", "non-existent-tenant")).toEqual({
      workspaceUrl: "orders",
    });
  });

  it("handles path without leading slash", () => {
    expect(parseBladeUrl("orders/order")).toEqual({
      workspaceUrl: "orders",
      bladeUrl: "order",
    });
  });
});

// ── buildQueryString ────────────────────────────────────────────────────────────

describe("buildQueryString", () => {
  it("returns empty string for empty object", () => {
    expect(buildQueryString({})).toBe("");
  });

  it("builds single-param string", () => {
    expect(buildQueryString({ page: "1" })).toBe("?page=1");
  });

  it("builds multi-param string", () => {
    const result = buildQueryString({ page: "1", sort: "name" });
    expect(result).toContain("page=1");
    expect(result).toContain("sort=name");
    expect(result.startsWith("?")).toBe(true);
  });

  it("encodes special characters", () => {
    expect(buildQueryString({ q: "hello world" })).toBe("?q=hello%20world");
  });

  it("skips empty string values", () => {
    expect(buildQueryString({ page: "1", empty: "" })).toBe("?page=1");
  });
});

// ── createRouterUrlSink ─────────────────────────────────────────────────────────

describe("createRouterUrlSink", () => {
  function makeRouter(params: Record<string, string> = {}) {
    return {
      currentRoute: { value: { params } },
      push: vi.fn(),
      replace: vi.fn(),
    } as unknown as Router & { push: ReturnType<typeof vi.fn>; replace: ReturnType<typeof vi.fn> };
  }

  function makeStack(blades: BladeDescriptor[]): IBladeStack {
    return { blades: computed(() => blades) } as unknown as IBladeStack;
  }

  /** Registry stub for the cases that drive a real stack through the sink. */
  function createRouteRegistry(routes: Record<string, string>): IBladeRegistry {
    const map = new Map(
      Object.entries(routes).map(([name, route]) => [name, { component: {} as never, route, isWorkspace: true }]),
    );
    return {
      registeredBladesMap: computed(() => map),
      getBlade: (name: string) => map.get(name),
      getBladeComponent: (name: string) => map.get(name)?.component,
      getBladeByRoute: () => undefined,
    } as unknown as IBladeRegistry;
  }

  const stack = () =>
    makeStack([
      makeDescriptor({ id: "ws", name: "Orders", url: "/orders", query: { orders_page: "2" } }),
      makeDescriptor({ id: "child", name: "OrderDetails", url: "/order", param: "1" }),
    ]);

  it("push sends the location built from the stack", () => {
    const router = makeRouter();
    const sink = createRouterUrlSink(router, stack);

    sink.push();

    expect(router.push).toHaveBeenCalledWith({ path: "/orders/order/1", query: { orders_page: "2" } });
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("replace sends the same location without a history entry", () => {
    const router = makeRouter();
    const sink = createRouterUrlSink(router, stack);

    sink.replace();

    expect(router.replace).toHaveBeenCalledWith({ path: "/orders/order/1", query: { orders_page: "2" } });
    expect(router.push).not.toHaveBeenCalled();
  });

  it("prefixes the tenant segment from the current route params", () => {
    const router = makeRouter({ sellerId: "acme" });
    const sink = createRouterUrlSink(router, stack);

    sink.push();

    expect(router.push).toHaveBeenCalledWith({ path: "/acme/orders/order/1", query: { orders_page: "2" } });
  });

  it("reads the stack at call time, not at construction time", () => {
    const router = makeRouter();
    let current = makeStack([makeDescriptor({ id: "ws", name: "Orders", url: "/orders" })]);
    const sink = createRouterUrlSink(router, () => current);

    current = stack();
    sink.push();

    expect(router.push).toHaveBeenCalledWith({ path: "/orders/order/1", query: { orders_page: "2" } });
  });

  describe("suppressWhile", () => {
    it("swallows writes for the duration and returns the result", async () => {
      const router = makeRouter();
      const sink = createRouterUrlSink(router, stack);

      const result = await sink.suppressWhile(async () => {
        sink.push();
        sink.replace();
        return "done";
      });

      expect(result).toBe("done");
      expect(router.push).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });

    it("writes again after the callback resolves", async () => {
      const router = makeRouter();
      const sink = createRouterUrlSink(router, stack);

      await sink.suppressWhile(async () => sink.push());
      sink.push();

      expect(router.push).toHaveBeenCalledOnce();
    });

    it("restores suppression after a throw", async () => {
      const router = makeRouter();
      const sink = createRouterUrlSink(router, stack);

      await expect(
        sink.suppressWhile(async () => {
          throw new Error("guard blew up");
        }),
      ).rejects.toThrow("guard blew up");

      sink.push();
      expect(router.push).toHaveBeenCalledOnce();
    });

    it("nests without unsuppressing early", async () => {
      const router = makeRouter();
      const sink = createRouterUrlSink(router, stack);

      await sink.suppressWhile(async () => {
        await sink.suppressWhile(async () => sink.push());
        sink.push();
      });

      expect(router.push).not.toHaveBeenCalled();
    });

    it("stays suppressed while overlapping windows are open, and lifts once both close", async () => {
      // Two navigations can overlap: vue-router cancels the pending one but its
      // async guard runs on. The window opened first may also close first.
      const router = makeRouter();
      const sink = createRouterUrlSink(router, stack);

      let releaseFirst!: () => void;
      let releaseSecond!: () => void;
      const first = new Promise<void>((r) => (releaseFirst = r));
      const second = new Promise<void>((r) => (releaseSecond = r));

      const a = sink.suppressWhile(() => first);
      const b = sink.suppressWhile(() => second);

      releaseFirst();
      await a;
      sink.push();
      expect(router.push).not.toHaveBeenCalled();

      releaseSecond();
      await b;
      sink.push();
      expect(router.push).toHaveBeenCalledOnce();
    });

    it("a stack mutation inside the window writes nothing, and the next one writes once", async () => {
      const router = makeRouter();
      const holder: { current?: IBladeStack } = {};
      const sink = createRouterUrlSink(router, () => holder.current);
      const bladeStack = createBladeStack(
        createRouteRegistry({ Orders: "/orders", OrderDetails: "/order" }),
        undefined,
        sink,
      );
      holder.current = bladeStack;

      await sink.suppressWhile(async () => {
        await bladeStack.openWorkspace({ name: "Orders" });
        await bladeStack.openBlade({ name: "OrderDetails", param: "1" });
      });

      expect(router.push).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();

      await bladeStack.closeBlade(bladeStack.activeBlade.value!.id);

      expect(router.replace).toHaveBeenCalledOnce();
      expect(router.replace).toHaveBeenCalledWith({ path: "/orders", query: {} });
    });
  });
});

// ── createUrlSync (kept for the two callers that build their own) ───────────────

describe("createUrlSync", () => {
  it("syncUrlPush and syncUrlReplace write the stack's location", () => {
    const router = {
      currentRoute: { value: { params: {} } },
      push: vi.fn(),
      replace: vi.fn(),
    } as unknown as Router & { push: ReturnType<typeof vi.fn>; replace: ReturnType<typeof vi.fn> };
    const bladeStack = {
      blades: computed(() => [makeDescriptor({ id: "ws", name: "Orders", url: "/orders" })]),
    } as unknown as IBladeStack;

    const { syncUrlPush, syncUrlReplace } = createUrlSync(router, bladeStack);
    syncUrlPush();
    syncUrlReplace();

    expect(router.push).toHaveBeenCalledWith({ path: "/orders", query: {} });
    expect(router.replace).toHaveBeenCalledWith({ path: "/orders", query: {} });
  });
});
