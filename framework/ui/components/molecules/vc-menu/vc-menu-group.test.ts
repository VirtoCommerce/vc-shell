import { beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcMenuGroup from "@ui/components/molecules/vc-menu/vc-menu-group.vue";

describe("VcMenuGroup", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mountComponent = (props: Record<string, unknown> = {}) =>
    mount(VcMenuGroup as any, {
      props: { groupId: "catalog", title: "Catalog", ...props },
      slots: { default: '<div class="child-item">Child</div>' },
      global: { stubs: { VcIcon: true, VcBadge: true, VcTooltip: { template: "<div><slot /></div>" } } },
    });

  describe("section variant", () => {
    const mountSection = (props: Record<string, unknown> = {}) => mountComponent({ variant: "section", ...props });

    it("renders the header as a button that does not submit forms", () => {
      const header = mountSection().find(".vc-menu-group__section-header");
      expect(header.element.tagName).toBe("BUTTON");
      expect(header.attributes("type")).toBe("button");
    });

    it("reports its collapsed state to assistive technology", () => {
      const header = mountSection({ open: false }).find(".vc-menu-group__section-header");
      expect(header.attributes("aria-expanded")).toBe("false");
    });

    it("reports its expanded state to assistive technology", () => {
      const header = mountSection({ open: true }).find(".vc-menu-group__section-header");
      expect(header.attributes("aria-expanded")).toBe("true");
    });

    it("updates aria-expanded when toggled", async () => {
      const wrapper = mountSection({ open: false });
      const header = wrapper.find(".vc-menu-group__section-header");
      await header.trigger("click");
      expect(header.attributes("aria-expanded")).toBe("true");
    });

    it("points aria-controls at the element it expands", () => {
      const wrapper = mountSection();
      const controls = wrapper.find(".vc-menu-group__section-header").attributes("aria-controls");
      expect(controls).toBeTruthy();
      expect(wrapper.find(`#${controls}`).classes()).toContain("vc-menu-group__children-wrapper");
    });
  });

  describe("default variant", () => {
    const mountDefault = (props: Record<string, unknown> = {}) => mountComponent(props);

    // The state belongs on the element that carries the role and the click, not
    // on VcMenuItem's outer wrapper: a bare div reports nothing to a screen
    // reader, and the wrapper is not what toggles the group.
    const header = (wrapper: ReturnType<typeof mountComponent>) => wrapper.find(".vc-menu-item__content");

    it("reports its collapsed state to assistive technology", () => {
      expect(header(mountDefault({ open: false })).attributes("aria-expanded")).toBe("false");
    });

    it("reports its expanded state to assistive technology", () => {
      expect(header(mountDefault({ open: true })).attributes("aria-expanded")).toBe("true");
    });

    it("points assistive technology at the children it controls", () => {
      const wrapper = mountDefault({ open: true });
      const controls = header(wrapper).attributes("aria-controls");
      expect(controls).toBeTruthy();
      expect(wrapper.find(`#${controls}`).classes()).toContain("vc-menu-group__children-wrapper");
    });

    it("flips the reported state when toggled", async () => {
      const wrapper = mountDefault({ open: false });
      await header(wrapper).trigger("click");
      expect(header(wrapper).attributes("aria-expanded")).toBe("true");
    });
  });

  it("renders children in the default variant", () => {
    expect(mountComponent().find(".child-item").exists()).toBe(true);
  });

  // A group and one of its children can carry the same data-test-id (a
  // "Products" group holding a "Products" item), so the group needs an
  // identifier of its own that reaches the DOM.
  it("exposes its group id for unambiguous addressing", () => {
    expect(mountComponent().attributes("data-group-id")).toBe("catalog");
  });
});
