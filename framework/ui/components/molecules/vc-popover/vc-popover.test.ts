import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcPopover from "@ui/components/molecules/vc-popover/vc-popover.vue";

// Mock floating UI composable
vi.mock("@ui/composables", () => ({
  useFloatingPosition: () => ({
    floatingStyle: { value: {} },
  }),
  useTeleportTarget: () => ({
    teleportTarget: "body",
  }),
}));

describe("VcPopover", () => {
  const mountComponent = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
    mount(VcPopover as any, {
      props: { show: false, ...props },
      slots,
      global: {
        stubs: {
          VcIcon: true,
          Teleport: true,
        },
      },
    });

  it("does not render content when show is false", () => {
    const wrapper = mountComponent({ show: false });
    expect(wrapper.find(".vc-popover").exists()).toBe(false);
  });

  it("renders content when show is true", () => {
    const wrapper = mountComponent({ show: true });
    expect(wrapper.find(".vc-popover").exists()).toBe(true);
  });

  it("renders title in header when provided", () => {
    const wrapper = mountComponent({ show: true, title: "Panel Title" });
    expect(wrapper.find(".vc-popover__title").text()).toBe("Panel Title");
  });

  it("does not render header when title is empty and no header slot", () => {
    const wrapper = mountComponent({ show: true });
    expect(wrapper.find(".vc-popover__header").exists()).toBe(false);
  });

  it("renders header slot content", () => {
    const wrapper = mountComponent({ show: true }, { header: '<div class="custom-header">Custom Header</div>' });
    expect(wrapper.find(".vc-popover__header").exists()).toBe(true);
  });

  it("renders default slot content", () => {
    const wrapper = mountComponent({ show: true }, { default: '<div class="panel-content">Content</div>' });
    expect(wrapper.find(".panel-content").exists()).toBe(true);
  });

  it("renders footer slot when provided", () => {
    const wrapper = mountComponent({ show: true }, { footer: '<button class="footer-btn">Save</button>' });
    expect(wrapper.find(".vc-popover__footer").exists()).toBe(true);
  });

  it("does not render footer when no footer slot", () => {
    const wrapper = mountComponent({ show: true });
    expect(wrapper.find(".vc-popover__footer").exists()).toBe(false);
  });

  it("emits update:show false when close button is clicked", async () => {
    const wrapper = mountComponent({ show: true, title: "Panel" });
    await wrapper.find(".vc-popover__close").trigger("click");
    expect(wrapper.emitted("update:show")).toBeTruthy();
    expect(wrapper.emitted("update:show")![0]).toEqual([false]);
  });

  it("applies scrollable class to content when contentScrollable is true", () => {
    const wrapper = mountComponent({ show: true, contentScrollable: true });
    expect(wrapper.find(".vc-popover__content--scrollable").exists()).toBe(true);
  });

  it("does not apply scrollable class when contentScrollable is false", () => {
    const wrapper = mountComponent({ show: true, contentScrollable: false });
    expect(wrapper.find(".vc-popover__content--scrollable").exists()).toBe(false);
  });
});
