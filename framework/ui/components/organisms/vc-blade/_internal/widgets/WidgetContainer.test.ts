import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref, reactive, computed, defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { IsMobileKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { createWidgetService, type IWidgetService } from "@core/services/widget-service";

const mockWidgets = ref<Record<string, unknown>[]>([]);
// Reactive, as the real registry: a module loaded later adds to it
const mockExternalWidgets = reactive<Record<string, unknown>[]>([]);
const registerWidget = vi.fn();
let realService: IWidgetService | undefined;

vi.mock("@core/composables/useWidgets", () => ({
  useWidgets: () =>
    realService ?? {
      getWidgets: (_bladeId: string) => mockWidgets.value,
      registerWidget,
      unregisterWidget: vi.fn(),
      getAllExternalWidgets: () => [...mockExternalWidgets],
    },
}));

import WidgetContainer from "./WidgetContainer.vue";

const StubWidgetComponent = defineComponent({
  name: "StubWidget",
  setup() {
    return () => h("div", { class: "stub-widget" }, "Widget");
  },
});

function mountContainer(props: Record<string, unknown> = {}, options: { isMobile?: boolean; bladeName?: string } = {}) {
  return mount(WidgetContainer, {
    props: {
      bladeId: "test-blade",
      ...props,
    },
    global: {
      provide: {
        [IsMobileKey as symbol]: ref(options.isMobile ?? false),
        ...(options.bladeName && { [BladeDescriptorKey as symbol]: computed(() => ({ name: options.bladeName })) }),
      },
      stubs: {
        WidgetContainerDesktop: {
          name: "WidgetContainerDesktop",
          props: ["widgets", "bladeId"],
          template: '<div class="stub-desktop-widgets" :data-count="widgets.length" />',
        },
        WidgetContainerMobile: {
          name: "WidgetContainerMobile",
          props: ["widgets", "bladeId"],
          template: '<div class="stub-mobile-widgets" :data-count="widgets.length" />',
        },
      },
    },
  });
}

describe("WidgetContainer", () => {
  beforeEach(() => {
    mockWidgets.value = [];
    mockExternalWidgets.length = 0;
    realService = undefined;
    registerWidget.mockClear();
  });

  it("registers an external widget that targets the blade", () => {
    mockExternalWidgets.push({ id: "ext", component: StubWidgetComponent, targetBlades: ["productdetails"] });

    mountContainer({}, { bladeName: "ProductDetails" });
    expect(registerWidget).toHaveBeenCalledWith(expect.objectContaining({ id: "ext" }), "test-blade");
  });

  it("registers an external widget whose module loads after the blade opened", async () => {
    mountContainer({}, { bladeName: "ProductDetails" });
    expect(registerWidget).not.toHaveBeenCalled();

    mockExternalWidgets.push({ id: "late", component: StubWidgetComponent, targetBlades: ["productdetails"] });
    await nextTick();
    expect(registerWidget).toHaveBeenCalledWith(expect.objectContaining({ id: "late" }), "test-blade");
  });

  it("renders nothing when no widgets exist", () => {
    const wrapper = mountContainer();
    expect(wrapper.find(".stub-desktop-widgets").exists()).toBe(false);
    expect(wrapper.find(".stub-mobile-widgets").exists()).toBe(false);
  });

  it("renders desktop widget container when widgets exist and not mobile", () => {
    mockWidgets.value = [{ id: "w1", component: StubWidgetComponent, isVisible: true }];

    const wrapper = mountContainer({}, { isMobile: false });
    expect(wrapper.find(".stub-desktop-widgets").exists()).toBe(true);
    expect(wrapper.find(".stub-mobile-widgets").exists()).toBe(false);
  });

  it("renders mobile widget container when widgets exist and is mobile", () => {
    mockWidgets.value = [{ id: "w1", component: StubWidgetComponent, isVisible: true }];

    const wrapper = mountContainer({}, { isMobile: true });
    expect(wrapper.find(".stub-mobile-widgets").exists()).toBe(true);
    expect(wrapper.find(".stub-desktop-widgets").exists()).toBe(false);
  });

  it("filters out widgets where isVisible is false", () => {
    mockWidgets.value = [{ id: "w1", component: StubWidgetComponent, isVisible: false }];

    const wrapper = mountContainer();
    expect(wrapper.find(".stub-desktop-widgets").exists()).toBe(false);
  });

  it("normalizes bladeId to lowercase", () => {
    mockWidgets.value = [{ id: "w1", component: StubWidgetComponent, isVisible: true }];

    const wrapper = mountContainer({ bladeId: "My-Blade" });
    const desktopStub = wrapper.find(".stub-desktop-widgets");
    expect(desktopStub.exists()).toBe(true);
  });

  it("shows multiple visible widgets", () => {
    mockWidgets.value = [
      { id: "w1", component: StubWidgetComponent, isVisible: true },
      { id: "w2", component: StubWidgetComponent, isVisible: true },
    ];

    const wrapper = mountContainer();
    const desktopStub = wrapper.find(".stub-desktop-widgets");
    expect(desktopStub.attributes("data-count")).toBe("2");
  });

  it("mixes visible and hidden widgets correctly", () => {
    mockWidgets.value = [
      { id: "w1", component: StubWidgetComponent, isVisible: true },
      { id: "w2", component: StubWidgetComponent, isVisible: false },
      { id: "w3", component: StubWidgetComponent, isVisible: true },
    ];

    const wrapper = mountContainer();
    const desktopStub = wrapper.find(".stub-desktop-widgets");
    expect(desktopStub.attributes("data-count")).toBe("2");
  });

  describe("widgets registered by blade name", () => {
    function mountInBlade(bladeId: string, name: string) {
      return mount(WidgetContainer, {
        props: { bladeId },
        global: {
          provide: {
            [IsMobileKey as symbol]: ref(false),
            [BladeDescriptorKey as symbol]: ref({ id: bladeId, name }),
          },
          stubs: {
            WidgetContainerDesktop: {
              props: ["widgets", "bladeId"],
              template: '<div class="stub-desktop-widgets" :data-count="widgets.length" />',
            },
          },
        },
      });
    }

    it("shows a widget registered under the blade name", async () => {
      realService = createWidgetService();
      realService.registerWidget({ id: "by-name", title: "By name" }, "OrderDetails");

      const wrapper = mountInBlade("blade_1_abc", "OrderDetails");
      await nextTick();

      expect(wrapper.find(".stub-desktop-widgets").attributes("data-count")).toBe("1");
      expect(realService.getWidgets("blade_1_abc").map((w) => w.id)).toEqual(["by-name"]);
    });

    it("gives each blade instance its own copy and removes it on unmount", () => {
      realService = createWidgetService();
      realService.registerWidget({ id: "by-name" }, "OrderDetails");

      const first = mountInBlade("blade_1_abc", "OrderDetails");
      mountInBlade("blade_2_def", "OrderDetails");

      realService.updateWidget({ id: "by-name", bladeId: "blade_1_abc", widget: { title: "First" } });
      expect(realService.getWidgets("blade_2_def")[0].title).toBeUndefined();

      first.unmount();
      expect(realService.getWidgets("blade_1_abc")).toHaveLength(0);
      expect(realService.getWidgets("orderdetails")).toHaveLength(1);
    });

    it("picks up a widget registered by name after the blade opened", async () => {
      realService = createWidgetService();
      const wrapper = mountInBlade("blade_1_abc", "OrderDetails");

      realService.registerWidget({ id: "late-by-name" }, "OrderDetails");
      await nextTick();
      await nextTick();

      expect(realService.getWidgets("blade_1_abc").map((w) => w.id)).toEqual(["late-by-name"]);
      expect(wrapper.find(".stub-desktop-widgets").attributes("data-count")).toBe("1");
    });

    it("keeps the blade's own widget when ids collide", () => {
      realService = createWidgetService();
      realService.registerWidget({ id: "w", title: "Name" }, "OrderDetails");
      realService.registerWidget({ id: "w", title: "Own" }, "blade_1_abc");

      mountInBlade("blade_1_abc", "OrderDetails");

      expect(realService.getWidgets("blade_1_abc").map((w) => w.title)).toEqual(["Own"]);
    });

    it("ignores widgets registered for another blade name", async () => {
      realService = createWidgetService();
      realService.registerWidget({ id: "other" }, "ProductDetails");

      const wrapper = mountInBlade("blade_1_abc", "OrderDetails");
      await nextTick();

      expect(wrapper.find(".stub-desktop-widgets").exists()).toBe(false);
    });
  });
});
