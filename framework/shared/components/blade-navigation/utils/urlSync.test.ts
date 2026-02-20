import { describe, it, expect } from "vitest";
import { buildUrlFromStack, parseBladeUrl, buildQueryString } from "@shared/components/blade-navigation/utils/urlSync";
import type { BladeDescriptor } from "@shared/components/blade-navigation/types";

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
