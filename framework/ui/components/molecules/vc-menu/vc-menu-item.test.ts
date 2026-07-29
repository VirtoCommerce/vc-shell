import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcMenuItem from "@ui/components/molecules/vc-menu/vc-menu-item.vue";

describe("VcMenuItem", () => {
  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcMenuItem as any, {
      props: { title: "Products", ...props },
      global: {
        stubs: {
          VcIcon: true,
          VcBadge: true,
          VcTooltip: { template: "<div><slot /><slot name='tooltip' /></div>" },
        },
      },
    });

  // Keyboard operability comes from using a native button: the browser maps
  // Enter/Space to click and puts the element in the tab order. Asserting the
  // element type is what proves it — jsdom does not synthesise that mapping.
  it("renders the interactive content as a native button", () => {
    const content = mountComponent().find(".vc-menu-item__content");
    expect(content.element.tagName).toBe("BUTTON");
    expect(content.attributes("type")).toBe("button");
  });

  it("stays in the tab order", () => {
    const content = mountComponent().find(".vc-menu-item__content");
    expect(content.attributes("tabindex")).toBeUndefined();
    expect(content.attributes("disabled")).toBeUndefined();
  });

  it("emits click when the button is activated", async () => {
    const wrapper = mountComponent();
    await wrapper.find(".vc-menu-item__content").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("marks the active item with aria-current", () => {
    const content = mountComponent({ active: true }).find(".vc-menu-item__content");
    expect(content.attributes("aria-current")).toBe("page");
  });

  it("omits aria-current when not active", () => {
    const content = mountComponent({ active: false }).find(".vc-menu-item__content");
    expect(content.attributes("aria-current")).toBeUndefined();
  });

  it("keeps an accessible name when collapsed to an icon", () => {
    // Collapsed items hide the title text visually, so the name must survive.
    const content = mountComponent({ icon: "lucide-box", expanded: false }).find(".vc-menu-item__content");
    expect(content.attributes("aria-label")).toBe("Products");
  });

  it("does not duplicate the name when the title is visible", () => {
    const content = mountComponent({ icon: "lucide-box", expanded: true }).find(".vc-menu-item__content");
    expect(content.attributes("aria-label")).toBeUndefined();
  });

  it("renders the title text", () => {
    expect(mountComponent().find(".vc-menu-item__title-text").text()).toBe("Products");
  });
});
