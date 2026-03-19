import { describe, it, expect, vi } from "vitest";
import { computed, defineComponent, h, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import { WidgetIdKey, WidgetServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { useWidget } from "./index";
import type { IWidgetService } from "@core/services/widget-service";

function createMockWidgetService(overrides: Partial<IWidgetService> = {}): IWidgetService {
  return {
    registerWidget: vi.fn(),
    unregisterWidget: vi.fn(),
    getWidgets: vi.fn(() => []),
    clearBladeWidgets: vi.fn(),
    registeredWidgets: [],
    isActiveWidget: vi.fn(() => false),
    setActiveWidget: vi.fn(),
    updateActiveWidget: vi.fn(),
    isWidgetRegistered: vi.fn(() => false),
    updateWidget: vi.fn(),
    resolveWidgetProps: vi.fn(() => ({})),
    getExternalWidgetsForBlade: vi.fn(() => []),
    getAllExternalWidgets: vi.fn(() => []),
    cloneWidget: vi.fn((w) => w),
    ...overrides,
  };
}

/**
 * Mounts an Outer (provider) → Inner (consumer) pair.
 * The Inner component calls setupFn which invokes useWidget().
 */
function mountWithProviders<T>(
  setupFn: () => T,
  providers: { widgetId?: string; widgetService?: IWidgetService; bladeId?: string } = {},
) {
  let result: T;
  const Inner = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const Outer = defineComponent({
    setup() {
      if (providers.widgetId) provide(WidgetIdKey, providers.widgetId);
      if (providers.widgetService) provide(WidgetServiceKey, providers.widgetService);
      if (providers.bladeId) {
        provide(
          BladeDescriptorKey,
          computed(() => ({ id: providers.bladeId!, name: "TestBlade" })),
        );
      }
      return () => h(Inner);
    },
  });
  const wrapper = mount(Outer);
  return { result: result!, wrapper };
}

describe("useWidget", () => {
  it("returns widgetId from injected WidgetIdKey", () => {
    const { result } = mountWithProviders(() => useWidget(), {
      widgetId: "MyWidget",
      widgetService: createMockWidgetService(),
      bladeId: "blade-1",
    });
    expect(result.widgetId).toBe("MyWidget");
  });

  it("throws when WidgetIdKey is not provided", () => {
    expect(() => {
      mountWithProviders(() => useWidget(), {
        widgetService: createMockWidgetService(),
        bladeId: "blade-1",
      });
    }).toThrow();
  });

  it("throws when WidgetServiceKey is not provided", () => {
    expect(() => {
      mountWithProviders(() => useWidget(), {
        widgetId: "MyWidget",
        bladeId: "blade-1",
      });
    }).toThrow();
  });

  it("setTrigger calls widgetService.updateWidget with trigger data and bladeId", () => {
    const updateWidget = vi.fn();
    const service = createMockWidgetService({ updateWidget });

    const { result } = mountWithProviders(() => useWidget(), {
      widgetId: "TestWidget",
      widgetService: service,
      bladeId: "blade-1",
    });

    const onRefresh = vi.fn();
    const badge = ref(5);
    result.setTrigger({ badge, onRefresh });

    expect(updateWidget).toHaveBeenCalledWith({
      id: "TestWidget",
      bladeId: "blade-1",
      widget: { trigger: { badge, onRefresh } },
    });
  });
});
