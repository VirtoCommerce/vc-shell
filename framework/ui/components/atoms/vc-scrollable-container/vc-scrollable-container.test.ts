import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import VcScrollableContainer from "@ui/components/atoms/vc-scrollable-container/vc-scrollable-container.vue";

// Mock the composable since jsdom has no real scroll
vi.mock("@ui/composables", () => ({
  useScrollArrows: () => ({
    canScrollUp: ref(false),
    canScrollDown: ref(false),
    startScroll: vi.fn(),
    stopScroll: vi.fn(),
    updateScrollState: vi.fn(),
  }),
  useTeleportTarget: () => ({ teleportTarget: ref("body") }),
}));

describe("VcScrollableContainer", () => {
  const mountComponent = (props = {}, slots = {}) =>
    mount(VcScrollableContainer as any, {
      props,
      slots,
      global: { stubs: { VcIcon: true } },
    });

  it("renders with role='region' and aria-label", () => {
    const wrapper = mountComponent();
    const region = wrapper.find("[role='region']");
    expect(region.exists()).toBe(true);
    expect(region.attributes("aria-label")).toBe("Scrollable content");
  });

  it("renders default slot content in the viewport", () => {
    const wrapper = mountComponent({}, { default: () => "Scrollable content" });
    const viewport = wrapper.find(".vc-scrollable-container__viewport");
    expect(viewport.text()).toContain("Scrollable content");
  });

  it("renders arrow containers", () => {
    const wrapper = mountComponent();
    const arrows = wrapper.findAll(".vc-scrollable-container__arrow");
    expect(arrows.length).toBe(2);
  });

  it("hides arrows when scroll is not possible", () => {
    const wrapper = mountComponent();
    const arrows = wrapper.findAll(".vc-scrollable-container__arrow");
    arrows.forEach((arrow) => {
      expect(arrow.classes()).toContain("vc-scrollable-container__arrow--hidden");
    });
  });

  it("viewport has tabindex for keyboard navigation", () => {
    const wrapper = mountComponent();
    const viewport = wrapper.find(".vc-scrollable-container__viewport");
    expect(viewport.attributes("tabindex")).toBe("0");
  });

  it("arrows have aria-hidden='true'", () => {
    const wrapper = mountComponent();
    const arrows = wrapper.findAll(".vc-scrollable-container__arrow");
    arrows.forEach((arrow) => {
      expect(arrow.attributes("aria-hidden")).toBe("true");
    });
  });

  it("renders custom arrow-up slot", () => {
    const wrapper = mountComponent(
      {},
      { "arrow-up": () => "Up Arrow" },
    );
    const arrows = wrapper.findAll(".vc-scrollable-container__arrow");
    expect(arrows[0].text()).toContain("Up Arrow");
  });

  it("renders custom arrow-down slot", () => {
    const wrapper = mountComponent(
      {},
      { "arrow-down": () => "Down Arrow" },
    );
    const arrows = wrapper.findAll(".vc-scrollable-container__arrow");
    expect(arrows[1].text()).toContain("Down Arrow");
  });

  it("exposes viewportRef and updateScrollState", () => {
    const wrapper = mountComponent();
    expect(wrapper.vm.viewportRef).toBeDefined();
    expect(wrapper.vm.updateScrollState).toBeDefined();
  });
});
