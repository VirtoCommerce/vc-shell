import { mountWithSetup } from "@framework/test-helpers";
import { ref } from "vue";

const mockRoute = {
  path: "/products",
  params: {},
};

vi.mock("vue-router", () => ({
  useRoute: () => mockRoute,
}));

import { useMenuActiveState, stripTenantPrefix } from "./useMenuActiveState";

describe("stripTenantPrefix", () => {
  it("strips tenant prefix from path", () => {
    const route = { path: "/tenant123/products", params: { sellerId: "tenant123" } } as any;
    expect(stripTenantPrefix(route)).toBe("/products");
  });

  it("returns '/' when path is just the tenant", () => {
    const route = { path: "/tenant123", params: { sellerId: "tenant123" } } as any;
    expect(stripTenantPrefix(route)).toBe("/");
  });

  it("returns path unchanged when no tenant param", () => {
    const route = { path: "/products", params: {} } as any;
    expect(stripTenantPrefix(route)).toBe("/products");
  });

  it("handles array params by using empty string as tenant", () => {
    const route = { path: "/products", params: { ids: ["a", "b"] } } as any;
    expect(stripTenantPrefix(route)).toBe("/products");
  });
});

describe("useMenuActiveState", () => {
  beforeEach(() => {
    mockRoute.path = "/products";
    mockRoute.params = {};
  });

  it("returns isActive computed", () => {
    const { result } = mountWithSetup(() => useMenuActiveState("/products"));
    expect(result).toHaveProperty("isActive");
  });

  it("isActive is true for exact match", () => {
    mockRoute.path = "/products";
    const { result } = mountWithSetup(() => useMenuActiveState("/products"));
    expect(result.isActive.value).toBe(true);
  });

  it("isActive is true for prefix match", () => {
    mockRoute.path = "/products/edit/123";
    const { result } = mountWithSetup(() => useMenuActiveState("/products"));
    expect(result.isActive.value).toBe(true);
  });

  it("isActive is false for non-matching path", () => {
    mockRoute.path = "/orders";
    const { result } = mountWithSetup(() => useMenuActiveState("/products"));
    expect(result.isActive.value).toBe(false);
  });

  it("isActive is false when url is undefined", () => {
    const { result } = mountWithSetup(() => useMenuActiveState(undefined));
    expect(result.isActive.value).toBe(false);
  });

  it("does not match partial segment names", () => {
    mockRoute.path = "/products-extra";
    const { result } = mountWithSetup(() => useMenuActiveState("/products"));
    // "/products-extra" does NOT start with "/products/"
    expect(result.isActive.value).toBe(false);
  });
});
