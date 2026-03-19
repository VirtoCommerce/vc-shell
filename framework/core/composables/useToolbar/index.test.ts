import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, provide } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { ToolbarServiceKey } from "@framework/injection-keys";
import type { IToolbarService, IToolbarItem } from "@core/services/toolbar-service";

// Mock the toolbar service creation so global fallback works
vi.mock("@core/services/toolbar-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@core/services/toolbar-service")>();
  return {
    ...actual,
    // Keep the real createToolbarService so useToolbar can create a global fallback
  };
});

vi.mock("@core/constants", () => ({
  FALLBACK_BLADE_ID: "__fallback__",
}));

import { useToolbar, provideToolbarService } from "./index";

function createMockToolbarService(): IToolbarService {
  return {
    registerToolbarItem: vi.fn(),
    unregisterToolbarItem: vi.fn(),
    getToolbarItems: vi.fn().mockReturnValue([]),
    clearBladeToolbarItems: vi.fn(),
    registeredToolbarItems: [],
    isToolbarItemRegistered: vi.fn().mockReturnValue(false),
    updateToolbarItem: vi.fn(),
  };
}

describe("useToolbar", () => {
  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() => useToolbar());
    expect(result).toHaveProperty("registerToolbarItem");
    expect(result).toHaveProperty("unregisterToolbarItem");
    expect(result).toHaveProperty("updateToolbarItem");
    expect(result).toHaveProperty("getToolbarItems");
    expect(result).toHaveProperty("clearBladeToolbarItems");
    expect(result).toHaveProperty("isToolbarItemRegistered");
    expect(result).toHaveProperty("registeredToolbarItems");
  });

  it("uses injected toolbar service when provided", () => {
    const mockService = createMockToolbarService();
    let result: ReturnType<typeof useToolbar>;

    const Inner = defineComponent({
      setup() {
        result = useToolbar();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provide(ToolbarServiceKey, mockService);
        return () => h(Inner);
      },
    });

    mount(Outer);

    const item: IToolbarItem = { id: "btn1", title: "Save" } as IToolbarItem;
    result!.registerToolbarItem(item);
    expect(mockService.registerToolbarItem).toHaveBeenCalledWith(
      item,
      expect.any(String),
    );
  });

  it("delegates unregisterToolbarItem to service", () => {
    const mockService = createMockToolbarService();
    let result: ReturnType<typeof useToolbar>;

    const Inner = defineComponent({
      setup() {
        result = useToolbar();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provide(ToolbarServiceKey, mockService);
        return () => h(Inner);
      },
    });

    mount(Outer);
    result!.unregisterToolbarItem("btn1");
    expect(mockService.unregisterToolbarItem).toHaveBeenCalledWith(
      "btn1",
      expect.any(String),
    );
  });

  it("delegates getToolbarItems to service", () => {
    const mockService = createMockToolbarService();
    let result: ReturnType<typeof useToolbar>;

    const Inner = defineComponent({
      setup() {
        result = useToolbar();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provide(ToolbarServiceKey, mockService);
        return () => h(Inner);
      },
    });

    mount(Outer);
    result!.getToolbarItems();
    expect(mockService.getToolbarItems).toHaveBeenCalled();
  });

  it("clears toolbar items on unmount when autoCleanup is true (default)", () => {
    const mockService = createMockToolbarService();

    const Inner = defineComponent({
      setup() {
        useToolbar(); // autoCleanup defaults to true
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provide(ToolbarServiceKey, mockService);
        return () => h(Inner);
      },
    });

    const wrapper = mount(Outer);
    wrapper.unmount();
    expect(mockService.clearBladeToolbarItems).toHaveBeenCalled();
  });

  it("does not clear toolbar items on unmount when autoCleanup is false", () => {
    const mockService = createMockToolbarService();

    const Inner = defineComponent({
      setup() {
        useToolbar({ autoCleanup: false });
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provide(ToolbarServiceKey, mockService);
        return () => h(Inner);
      },
    });

    const wrapper = mount(Outer);
    wrapper.unmount();
    expect(mockService.clearBladeToolbarItems).not.toHaveBeenCalled();
  });
});

describe("provideToolbarService", () => {
  it("creates and provides a toolbar service", () => {
    const { result } = mountWithSetup(() => provideToolbarService());
    expect(result).toHaveProperty("registerToolbarItem");
    expect(result).toHaveProperty("getToolbarItems");
  });
});
