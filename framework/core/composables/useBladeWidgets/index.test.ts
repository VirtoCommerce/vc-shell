import { describe, it, expect, vi } from "vitest";
import { ref, computed } from "vue";
import { mount } from "@vue/test-utils";
import { WidgetServiceKey, WidgetScopeKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { useBladeWidgets, useWidgetTrigger } from ".";
import type { IWidgetService } from "@core/services/widget-service";
import type { IWidgetScope } from ".";

function createMockWidgetService(overrides: Partial<IWidgetService> = {}): IWidgetService {
  return {
    registerWidget: vi.fn(),
    unregisterWidget: vi.fn(),
    getWidgets: vi.fn(() => []),
    updateWidget: vi.fn(),
    getExternalWidgetsForBlade: vi.fn(() => []),
    getAllExternalWidgets: vi.fn(() => []),
    cloneWidget: vi.fn((w) => w),
    ...overrides,
  };
}

function mountWithBlade(setup: () => unknown, options: { bladeId?: string; widgetService?: IWidgetService } = {}) {
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

describe("useBladeWidgets", () => {
  it("registers all widgets on mount with headless fields", () => {
    const registerWidget = vi.fn();
    const service = createMockWidgetService({ registerWidget });

    mountWithBlade(
      () =>
        useBladeWidgets([
          { id: "W1", icon: "lucide-tag", title: "Widget 1", badge: ref(5) },
          { id: "W2", icon: "lucide-star", title: "Widget 2" },
        ]),
      { widgetService: service, bladeId: "blade-1" },
    );

    expect(registerWidget).toHaveBeenCalledTimes(2);
    expect(registerWidget).toHaveBeenCalledWith(
      expect.objectContaining({ id: "W1", headless: expect.objectContaining({ icon: "lucide-tag" }) }),
      "blade-1",
    );
    expect(registerWidget).toHaveBeenCalledWith(
      expect.objectContaining({ id: "W2", headless: expect.objectContaining({ icon: "lucide-star" }) }),
      "blade-1",
    );
  });

  it("unregisters all widgets on unmount", () => {
    const unregisterWidget = vi.fn();
    const service = createMockWidgetService({ unregisterWidget });

    const wrapper = mountWithBlade(
      () =>
        useBladeWidgets([
          { id: "W1", icon: "lucide-tag", title: "Widget 1" },
          { id: "W2", icon: "lucide-star", title: "Widget 2" },
        ]),
      { widgetService: service, bladeId: "blade-1" },
    );

    wrapper.unmount();

    expect(unregisterWidget).toHaveBeenCalledTimes(2);
    expect(unregisterWidget).toHaveBeenCalledWith("W1", "blade-1");
    expect(unregisterWidget).toHaveBeenCalledWith("W2", "blade-1");
  });

  it("passes headless fields (icon, badge, onClick) to registerWidget", () => {
    const registerWidget = vi.fn();
    const service = createMockWidgetService({ registerWidget });
    const badge = ref(5);
    const onClick = vi.fn();

    mountWithBlade(
      () =>
        useBladeWidgets([
          {
            id: "W1",
            icon: "lucide-tag",
            title: "Test Widget",
            badge,
            onClick,
          },
        ]),
      { widgetService: service, bladeId: "blade-1" },
    );

    expect(registerWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "W1",
        headless: expect.objectContaining({ icon: "lucide-tag", badge, onClick }),
      }),
      "blade-1",
    );
  });

  it("wires onRefresh as trigger.onRefresh", () => {
    const registerWidget = vi.fn();
    const service = createMockWidgetService({ registerWidget });
    const onRefresh = vi.fn();

    mountWithBlade(
      () =>
        useBladeWidgets([
          {
            id: "W1",
            icon: "lucide-star",
            title: "Refresh Widget",
            onRefresh,
          },
        ]),
      { widgetService: service, bladeId: "blade-1" },
    );

    expect(registerWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.objectContaining({ onRefresh }),
      }),
      "blade-1",
    );
  });

  it("refresh() calls trigger.onRefresh on specific widget", () => {
    const onRefresh = vi.fn();
    const getWidgets = vi.fn(() => [{ id: "W1", trigger: { onRefresh } }]);
    const service = createMockWidgetService({ getWidgets });

    let result: ReturnType<typeof useBladeWidgets> | undefined;
    mountWithBlade(
      () => {
        result = useBladeWidgets([{ id: "W1", icon: "lucide-star", title: "Test" }]);
      },
      { widgetService: service, bladeId: "blade-1" },
    );

    result!.refresh("W1");
    expect(onRefresh).toHaveBeenCalledOnce();
  });

  it("refreshAll() calls trigger.onRefresh on all widgets with triggers", () => {
    const onRefresh1 = vi.fn();
    const onRefresh2 = vi.fn();
    const getWidgets = vi.fn(() => [
      { id: "W1", trigger: { onRefresh: onRefresh1 } },
      { id: "W2", trigger: { onRefresh: onRefresh2 } },
      { id: "W3" },
    ]);
    const service = createMockWidgetService({ getWidgets });

    let result: ReturnType<typeof useBladeWidgets> | undefined;
    mountWithBlade(
      () => {
        result = useBladeWidgets([
          { id: "W1", icon: "lucide-star", title: "T1", onRefresh: onRefresh1 },
          { id: "W2", icon: "lucide-tag", title: "T2", onRefresh: onRefresh2 },
          { id: "W3", icon: "lucide-link", title: "T3" },
        ]);
      },
      { widgetService: service, bladeId: "blade-1" },
    );

    result!.refreshAll();
    expect(onRefresh1).toHaveBeenCalledOnce();
    expect(onRefresh2).toHaveBeenCalledOnce();
  });

  it("passes isVisible to registerWidget", () => {
    const registerWidget = vi.fn();
    const service = createMockWidgetService({ registerWidget });
    const isVisible = computed(() => true);

    mountWithBlade(() => useBladeWidgets([{ id: "W1", icon: "lucide-star", title: "Test", isVisible }]), {
      widgetService: service,
    });

    expect(registerWidget).toHaveBeenCalledWith(expect.objectContaining({ id: "W1", isVisible }), expect.any(String));
  });
});

describe("useWidgetTrigger", () => {
  it("calls scope.setTrigger with provided trigger", () => {
    const setTrigger = vi.fn();
    const scope: IWidgetScope = { setTrigger };
    const onRefresh = vi.fn();

    const Wrapper = {
      setup() {
        useWidgetTrigger({ onRefresh });
      },
      template: "<div />",
    };

    mount(Wrapper, {
      global: {
        provide: {
          [WidgetScopeKey as symbol]: scope,
        },
      },
    });

    expect(setTrigger).toHaveBeenCalledOnce();
    expect(setTrigger).toHaveBeenCalledWith({ onRefresh });
  });

  it("does not throw when called outside WidgetScope (logs warning)", () => {
    const Wrapper = {
      setup() {
        useWidgetTrigger({ onRefresh: vi.fn() });
      },
      template: "<div />",
    };

    // No WidgetScopeKey provided — should not throw
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(() => mount(Wrapper)).not.toThrow();
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("passes full trigger contract (onRefresh, onClick, badge)", () => {
    const setTrigger = vi.fn();
    const scope: IWidgetScope = { setTrigger };
    const onRefresh = vi.fn();
    const onClick = vi.fn();
    const badge = ref(42);

    const Wrapper = {
      setup() {
        useWidgetTrigger({ onRefresh, onClick, badge });
      },
      template: "<div />",
    };

    mount(Wrapper, {
      global: {
        provide: {
          [WidgetScopeKey as symbol]: scope,
        },
      },
    });

    expect(setTrigger).toHaveBeenCalledWith({ onRefresh, onClick, badge });
  });
});
