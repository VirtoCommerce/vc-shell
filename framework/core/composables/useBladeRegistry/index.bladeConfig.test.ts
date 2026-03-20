import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createBladeRegistry } from "@core/composables/useBladeRegistry";
import {
  __registerBladeConfig,
  __clearBladeConfigRegistry,
} from "@core/blade-navigation/bladeConfigRegistry";

vi.mock("@core/composables/useMenuService", () => ({
  addMenuItem: vi.fn(),
}));
import { addMenuItem } from "@core/composables/useMenuService";

function makeBlade(name = "TestBlade") {
  return defineComponent({ name, render: () => h("div") });
}

function createTestApp() {
  return createApp({ render: () => h("div") });
}

describe("registerBlade with bladeConfigRegistry", () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
    __clearBladeConfigRegistry();
    vi.mocked(addMenuItem).mockClear();
  });

  it("reads config from bladeConfigRegistry when available", () => {
    const registry = createBladeRegistry(app);
    const blade = makeBlade("Orders");

    __registerBladeConfig("Orders", {
      url: "/orders",
      isWorkspace: true,
      permissions: ["seller:orders:view"],
    });

    registry._registerBladeFn("Orders", { component: blade as any });

    const data = registry.getBlade("Orders");
    expect(data?.route).toBe("/orders");
    expect(data?.isWorkspace).toBe(true);
    expect(data?.permissions).toEqual(["seller:orders:view"]);
  });

  it("falls back to registrationData when no config in registry", () => {
    const registry = createBladeRegistry(app);
    const blade = makeBlade("Legacy");

    registry._registerBladeFn("Legacy", {
      component: blade as any,
      route: "/legacy",
      isWorkspace: true,
    });

    const data = registry.getBlade("Legacy");
    expect(data?.route).toBe("/legacy");
    expect(data?.isWorkspace).toBe(true);
  });

  it("calls addMenuItem when config has menuItem", () => {
    const registry = createBladeRegistry(app);
    const blade = makeBlade("Orders");

    __registerBladeConfig("Orders", {
      url: "/orders",
      isWorkspace: true,
      menuItem: {
        title: "Orders",
        icon: "lucide-shopping-cart",
        priority: 1,
      },
    });

    registry._registerBladeFn("Orders", { component: blade as any });

    expect(addMenuItem).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Orders",
        icon: "lucide-shopping-cart",
        priority: 1,
        url: "/orders",
        routeId: "Orders",
      }),
    );
  });

  it("does NOT call addMenuItem when no menuItem in config", () => {
    const registry = createBladeRegistry(app);
    const blade = makeBlade("Details");

    __registerBladeConfig("Details", { url: "/detail" });
    registry._registerBladeFn("Details", { component: blade as any });

    expect(addMenuItem).not.toHaveBeenCalled();
  });

  it("registry config takes priority over registrationData", () => {
    const registry = createBladeRegistry(app);
    const blade = makeBlade("Orders");

    __registerBladeConfig("Orders", { url: "/orders-new", isWorkspace: true });
    registry._registerBladeFn("Orders", {
      component: blade as any,
      route: "/orders-old",
      isWorkspace: false,
    });

    const data = registry.getBlade("Orders");
    expect(data?.route).toBe("/orders-new");
    expect(data?.isWorkspace).toBe(true);
  });
});
