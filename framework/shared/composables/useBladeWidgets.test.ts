import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed, provide, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { WidgetServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@shared/components/blade-navigation/types";
import { useBladeWidgets } from "./useBladeWidgets";
import type { IWidgetService } from "@core/services/widget-service";
import type { WidgetDeclaration } from "./useBladeWidgets";

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

function mountWithBlade(
  setup: () => unknown,
  options: { bladeId?: string; widgetService?: IWidgetService } = {},
) {
  const bladeId = options.bladeId ?? "test-blade";
  const service = options.widgetService ?? createMockWidgetService();

  const Wrapper = {
    setup() {
      return setup();
    },
    template: "<div />",
  };
  return mount(Wrapper, {
    global: {
      provide: {
        [WidgetServiceKey as symbol]: service,
        [BladeDescriptorKey as symbol]: computed(() => ({ id: bladeId, name: "TestBlade", visible: true })),
      },
    },
  });
}

const FakeComponent = { template: "<div />" };

describe("useBladeWidgets", () => {
  it("registers all widgets on mount", () => {
    const registerWidget = vi.fn();
    const service = createMockWidgetService({ registerWidget });

    const widgets: WidgetDeclaration[] = [
      { id: "W1", component: FakeComponent, props: { item: ref({}) } },
      { id: "W2", component: FakeComponent },
    ];

    mountWithBlade(
      () => useBladeWidgets(widgets),
      { widgetService: service, bladeId: "blade-1" },
    );

    expect(registerWidget).toHaveBeenCalledTimes(2);
    expect(registerWidget).toHaveBeenCalledWith(
      expect.objectContaining({ id: "W1" }),
      "blade-1",
    );
    expect(registerWidget).toHaveBeenCalledWith(
      expect.objectContaining({ id: "W2" }),
      "blade-1",
    );
  });

  it("unregisters all widgets on unmount", async () => {
    const unregisterWidget = vi.fn();
    const service = createMockWidgetService({ unregisterWidget });

    const widgets: WidgetDeclaration[] = [
      { id: "W1", component: FakeComponent },
      { id: "W2", component: FakeComponent },
    ];

    const wrapper = mountWithBlade(
      () => useBladeWidgets(widgets),
      { widgetService: service, bladeId: "blade-1" },
    );

    wrapper.unmount();

    expect(unregisterWidget).toHaveBeenCalledTimes(2);
    expect(unregisterWidget).toHaveBeenCalledWith("W1", "blade-1");
    expect(unregisterWidget).toHaveBeenCalledWith("W2", "blade-1");
  });

  it("refresh() calls trigger.onRefresh on specific widget", () => {
    const onRefresh = vi.fn();
    const getWidgets = vi.fn(() => [
      { id: "W1", component: FakeComponent, trigger: { onRefresh } },
    ]);
    const service = createMockWidgetService({ getWidgets });

    let result: ReturnType<typeof useBladeWidgets> | undefined;
    mountWithBlade(
      () => { result = useBladeWidgets([{ id: "W1", component: FakeComponent }]); },
      { widgetService: service, bladeId: "blade-1" },
    );

    result!.refresh("W1");
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("refreshAll() calls trigger.onRefresh on all widgets with triggers", () => {
    const onRefresh1 = vi.fn();
    const onRefresh2 = vi.fn();
    const getWidgets = vi.fn(() => [
      { id: "W1", component: FakeComponent, trigger: { onRefresh: onRefresh1 } },
      { id: "W2", component: FakeComponent, trigger: { onRefresh: onRefresh2 } },
      { id: "W3", component: FakeComponent },
    ]);
    const service = createMockWidgetService({ getWidgets });

    let result: ReturnType<typeof useBladeWidgets> | undefined;
    mountWithBlade(
      () => { result = useBladeWidgets([
        { id: "W1", component: FakeComponent },
        { id: "W2", component: FakeComponent },
        { id: "W3", component: FakeComponent },
      ]); },
      { widgetService: service, bladeId: "blade-1" },
    );

    result!.refreshAll();
    expect(onRefresh1).toHaveBeenCalledOnce();
    expect(onRefresh2).toHaveBeenCalledOnce();
  });

  it("passes isVisible and events to registerWidget", () => {
    const registerWidget = vi.fn();
    const service = createMockWidgetService({ registerWidget });
    const isVisible = computed(() => true);
    const events = { onUpdate: vi.fn() };

    mountWithBlade(
      () => useBladeWidgets([
        { id: "W1", component: FakeComponent, isVisible, events },
      ]),
      { widgetService: service },
    );

    expect(registerWidget).toHaveBeenCalledWith(
      expect.objectContaining({ id: "W1", isVisible, events }),
      expect.any(String),
    );
  });
});
