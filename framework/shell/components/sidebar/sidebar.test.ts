import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import Sidebar from "./sidebar.vue";
import { IsMobileKey, IsDesktopKey } from "@framework/injection-keys";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: ref("en") }),
}));

const VcSidebarStub = {
  template: '<div data-stub="VcSidebar"><slot name="header" :close="() => {}" /><slot /></div>',
  props: ["modelValue", "position", "title", "closeButton", "teleport"],
  emits: ["update:modelValue"],
};

function factory(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
  provide: Record<symbol, unknown> = {},
) {
  return mount(Sidebar, {
    props: { isExpanded: true, ...props },
    slots,
    global: {
      stubs: { VcSidebar: VcSidebarStub },
      provide: {
        [IsMobileKey as symbol]: ref(false),
        [IsDesktopKey as symbol]: ref(true),
        ...provide,
      },
    },
  });
}

describe("Sidebar", () => {
  it("renders VcSidebar when expanded", () => {
    const w = factory({ isExpanded: true });
    expect(w.find('[data-stub="VcSidebar"]').exists()).toBe(true);
  });

  it("does not render VcSidebar when not expanded", () => {
    const w = factory({ isExpanded: false });
    expect(w.find('[data-stub="VcSidebar"]').exists()).toBe(false);
  });

  it("renders content slot directly when not expanded", () => {
    const w = factory({ isExpanded: false }, { content: '<div class="my-content">Content</div>' });
    expect(w.find(".my-content").exists()).toBe(true);
  });

  it("renders content slot inside VcSidebar when expanded", () => {
    const w = factory({ isExpanded: true }, { content: '<div class="my-content">Content</div>' });
    expect(w.find('[data-stub="VcSidebar"]').exists()).toBe(true);
    expect(w.find(".my-content").exists()).toBe(true);
  });

  it("emits close when VcSidebar updates modelValue to false", async () => {
    const w = factory({ isExpanded: true });
    const sidebar = w.findComponent(VcSidebarStub);
    await sidebar.vm.$emit("update:modelValue", false);
    expect(w.emitted("close")).toHaveLength(1);
  });

  it("does not emit close when VcSidebar updates modelValue to true", async () => {
    const w = factory({ isExpanded: true });
    const sidebar = w.findComponent(VcSidebarStub);
    await sidebar.vm.$emit("update:modelValue", true);
    expect(w.emitted("close")).toBeUndefined();
  });

  it("respects render=mobile - shows sidebar only on mobile", () => {
    const w = factory(
      { isExpanded: true, render: "mobile" },
      {},
      { [IsMobileKey as symbol]: ref(true), [IsDesktopKey as symbol]: ref(false) },
    );
    expect(w.find('[data-stub="VcSidebar"]').exists()).toBe(true);
  });

  it("respects render=mobile - hides sidebar on desktop", () => {
    const w = factory(
      { isExpanded: true, render: "mobile" },
      {},
      { [IsMobileKey as symbol]: ref(false), [IsDesktopKey as symbol]: ref(true) },
    );
    expect(w.find('[data-stub="VcSidebar"]').exists()).toBe(false);
  });

  it("respects render=desktop - shows sidebar only on desktop", () => {
    const w = factory(
      { isExpanded: true, render: "desktop" },
      {},
      { [IsMobileKey as symbol]: ref(false), [IsDesktopKey as symbol]: ref(true) },
    );
    expect(w.find('[data-stub="VcSidebar"]').exists()).toBe(true);
  });

  it("render=always shows sidebar regardless of viewport", () => {
    const w = factory(
      { isExpanded: true, render: "always" },
      {},
      { [IsMobileKey as symbol]: ref(false), [IsDesktopKey as symbol]: ref(false) },
    );
    expect(w.find('[data-stub="VcSidebar"]').exists()).toBe(true);
  });

  it("defaults position to right", () => {
    const w = factory({ isExpanded: true });
    const sidebar = w.findComponent(VcSidebarStub);
    expect(sidebar.props("position")).toBe("right");
  });

  it("passes position prop", () => {
    const w = factory({ isExpanded: true, position: "left" });
    const sidebar = w.findComponent(VcSidebarStub);
    expect(sidebar.props("position")).toBe("left");
  });
});
