import { mountWithSetup } from "@framework/test-helpers";

const mockPush = vi.fn();
const mockRoutes = [
  { path: "/products", name: "Products", meta: {} },
  { path: "/:sellerId/orders", name: "Orders", meta: {} },
  { path: "/", name: "Home", meta: { root: true } },
];
const mockRoute = { params: { sellerId: "abc" } };

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: mockPush,
    getRoutes: () => mockRoutes,
  }),
  useRoute: () => mockRoute,
}));

const mockOpenBlade = vi.fn();
vi.mock("@core/composables/useBlade", () => ({
  useBlade: () => ({
    openBlade: mockOpenBlade,
  }),
}));

const mockNavigateToMainRoute = vi.fn();
vi.mock("@core/blade-navigation/utils/navigateToMainRoute", () => ({
  navigateToMainRoute: (...args: any[]) => mockNavigateToMainRoute(...args),
}));

import { useShellNavigation } from "./useShellNavigation";

describe("useShellNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() => useShellNavigation());

    expect(result).toHaveProperty("handleMenuItemClick");
    expect(result).toHaveProperty("openRoot");
  });

  it("handleMenuItemClick opens blade by routeId", () => {
    const { result } = mountWithSetup(() => useShellNavigation());

    result.handleMenuItemClick({ routeId: "MyBlade" } as any);
    expect(mockOpenBlade).toHaveBeenCalledWith({ name: "MyBlade", isWorkspace: true });
  });

  it("handleMenuItemClick navigates by url when no routeId", () => {
    const { result } = mountWithSetup(() => useShellNavigation());

    result.handleMenuItemClick({ url: "/products" } as any);
    expect(mockPush).toHaveBeenCalledWith({ name: "Products", params: { sellerId: "abc" } });
  });

  it("handleMenuItemClick matches tenant-prefixed routes by static segments", () => {
    const { result } = mountWithSetup(() => useShellNavigation());

    result.handleMenuItemClick({ url: "/orders" } as any);
    expect(mockPush).toHaveBeenCalledWith({ name: "Orders", params: { sellerId: "abc" } });
  });

  it("handleMenuItemClick falls back to openRoot for unknown url", () => {
    const { result } = mountWithSetup(() => useShellNavigation());

    result.handleMenuItemClick({ url: "/unknown" } as any);
    expect(mockNavigateToMainRoute).toHaveBeenCalled();
  });

  it("openRoot calls navigateToMainRoute", async () => {
    const { result } = mountWithSetup(() => useShellNavigation());

    await result.openRoot();
    expect(mockNavigateToMainRoute).toHaveBeenCalledWith(
      expect.anything(),
      { sellerId: "abc" },
    );
  });
});
