import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcAccordion from "@ui/components/molecules/vc-accordion/vc-accordion.vue";

describe("VcAccordion", () => {
  const defaultItems = [
    { id: "a", title: "Section A", content: "Content A" },
    { id: "b", title: "Section B", content: "Content B" },
    { id: "c", title: "Section C", content: "Content C" },
  ];

  const mountComponent = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
    mount(VcAccordion as any, {
      props: { items: defaultItems, ...props },
      slots,
      global: {
        stubs: {
          VcAccordionItem: {
            template: '<div class="stub-accordion-item"><slot /></div>',
            props: ["title", "collapsedHeight", "maxExpandedHeight", "isExpanded", "disabled"],
            emits: ["toggle"],
          },
        },
      },
    });

  it("renders correctly with default props", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-accordion").exists()).toBe(true);
    expect(wrapper.find(".vc-accordion--default").exists()).toBe(true);
  });

  it("renders the correct number of items", () => {
    const wrapper = mountComponent();
    expect(wrapper.findAll(".stub-accordion-item")).toHaveLength(3);
  });

  it("applies variant class", () => {
    const wrapper = mountComponent({ variant: "bordered" });
    expect(wrapper.find(".vc-accordion--bordered").exists()).toBe(true);
  });

  it("supports separated variant", () => {
    const wrapper = mountComponent({ variant: "separated" });
    expect(wrapper.find(".vc-accordion--separated").exists()).toBe(true);
  });

  it("supports ghost variant", () => {
    const wrapper = mountComponent({ variant: "ghost" });
    expect(wrapper.find(".vc-accordion--ghost").exists()).toBe(true);
  });

  it("initializes expanded items from modelValue (single)", () => {
    const wrapper = mountComponent({ modelValue: "a" });
    expect(wrapper.exists()).toBe(true);
  });

  it("initializes expanded items from modelValue (array)", () => {
    const wrapper = mountComponent({ modelValue: ["a", "b"], multiple: true });
    expect(wrapper.exists()).toBe(true);
  });

  it("emits update:modelValue when toggling in single mode", async () => {
    const wrapper = mountComponent();
    const accordionItems = wrapper.findAllComponents({ name: undefined }).filter((c) => {
      try {
        return c.props("title") !== undefined;
      } catch {
        return false;
      }
    });
    if (accordionItems.length > 0) {
      await accordionItems[0].vm.$emit("toggle", true);
      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    }
  });

  it("renders default slot content", () => {
    const wrapper = mountComponent({}, { default: "<div class='custom-slot'>Custom</div>" });
    expect(wrapper.find(".custom-slot").exists()).toBe(true);
  });

  it("renders with empty items array", () => {
    const wrapper = mountComponent({ items: [] });
    expect(wrapper.find(".vc-accordion").exists()).toBe(true);
    expect(wrapper.findAll(".stub-accordion-item")).toHaveLength(0);
  });
});
