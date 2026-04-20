import { describe, expect, it, vi, beforeEach } from "vitest";
import { ref, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { IsMobileKey } from "@framework/injection-keys";

const mockWidgets = ref<Record<string, unknown>[]>([]);
const mockExternalWidgets: Record<string, unknown>[] = [];

vi.mock("@core/composables/useWidgets", () => ({
  useWidgets: () => ({
    getWidgets: (_bladeId: string) => mockWidgets.value,
    registerWidget: vi.fn(),
    unregisterWidget: vi.fn(),
    getAllExternalWidgets: () => mockExternalWidgets,
  }),
}));

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

import WidgetContainer from "./WidgetContainer.vue";

const StubWidgetComponent = defineComponent({
  name: "StubWidget",
  setup() {
    return () => h("div", { class: "stub-widget" }, "Widget");
  },
});

function mountContainer(props: Record<string, unknown> = {}, options: { isMobile?: boolean } = {}) {
  return mount(WidgetContainer, {
    props: {
      bladeId: "test-blade",
      ...props,
    },
    global: {
      provide: {
        [IsMobileKey as symbol]: ref(options.isMobile ?? false),
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
});
