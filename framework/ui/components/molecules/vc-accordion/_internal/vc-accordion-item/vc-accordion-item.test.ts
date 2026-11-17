import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import VcAccordionItem from "./vc-accordion-item.vue";

// Mock useCollapsible
vi.mock("@ui/composables/useCollapsible", () => ({
  useCollapsible: (opts: any) => {
    const { ref, computed } = require("vue");
    const isExpanded = ref(opts?.expanded ?? false);
    const hasOverflow = ref(true);
    const hasScroll = ref(false);
    const wrapperStyle = computed(() => ({}));
    const contentRef = ref(undefined);
    return {
      contentRef,
      isExpanded,
      hasOverflow,
      hasScroll,
      wrapperStyle,
      contentHeight: ref(100),
      toggle: () => {
        isExpanded.value = !isExpanded.value;
      },
    };
  },
}));

describe("VcAccordionItem", () => {
  it("renders with title prop", () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "Section 1" },
    });
    expect(wrapper.find(".vc-accordion-item__title").text()).toBe("Section 1");
  });

  it("renders title slot content", () => {
    const wrapper = mount(VcAccordionItem, {
      slots: { title: "<strong>Custom Title</strong>" },
    });
    expect(wrapper.find(".vc-accordion-item__title strong").exists()).toBe(true);
    expect(wrapper.find(".vc-accordion-item__title").text()).toBe("Custom Title");
  });

  it("renders default slot content", () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T" },
      slots: { default: "<p>Body content</p>" },
    });
    expect(wrapper.find(".vc-accordion-item__content p").text()).toBe("Body content");
  });

  it("emits toggle and update:isExpanded on header click", async () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T" },
    });
    await wrapper.find(".vc-accordion-item__header").trigger("click");
    expect(wrapper.emitted("toggle")).toBeTruthy();
    expect(wrapper.emitted("update:isExpanded")).toBeTruthy();
  });

  it("toggles expanded state on click", async () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T", isExpanded: false },
    });
    // Initially not expanded
    expect(wrapper.find(".vc-accordion-item--expanded").exists()).toBe(false);
    await wrapper.find(".vc-accordion-item__header").trigger("click");
    expect(wrapper.find(".vc-accordion-item--expanded").exists()).toBe(true);
  });

  it("applies disabled class when disabled", () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T", disabled: true },
    });
    expect(wrapper.find(".vc-accordion-item--disabled").exists()).toBe(true);
  });

  it("disables header button when disabled", () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T", disabled: true },
    });
    expect((wrapper.find(".vc-accordion-item__header").element as HTMLButtonElement).disabled).toBe(true);
  });

  it("shows chevron icon when hasOverflow is true", () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T" },
    });
    expect(wrapper.find(".vc-accordion-item__icon").exists()).toBe(true);
  });

  it("sets aria-expanded on header button", async () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T", isExpanded: false },
    });
    const header = wrapper.find(".vc-accordion-item__header");
    expect(header.attributes("aria-expanded")).toBe("false");
    await header.trigger("click");
    expect(header.attributes("aria-expanded")).toBe("true");
  });

  it("content wrapper has role='region'", () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T" },
    });
    expect(wrapper.find("[role='region']").exists()).toBe(true);
  });

  it("header button type is 'button'", () => {
    const wrapper = mount(VcAccordionItem, {
      props: { title: "T" },
    });
    expect(wrapper.find(".vc-accordion-item__header").attributes("type")).toBe("button");
  });

  describe("lazy, iconPosition and the actions slot", () => {
    it("renders the header button alone when there is no actions slot", () => {
      const wrapper = mount(VcAccordionItem, { props: { title: "T" } });
      expect(wrapper.find(".vc-accordion-item__head").exists()).toBe(false);
      expect(wrapper.element.firstElementChild?.classList.contains("vc-accordion-item__header")).toBe(true);
    });

    it("puts the actions next to the header button, outside it", () => {
      const wrapper = mount(VcAccordionItem, {
        props: { title: "T" },
        slots: { actions: '<button class="x">x</button>' },
      });
      const head = wrapper.find(".vc-accordion-item__head");
      expect(head.find(".vc-accordion-item__header").exists()).toBe(true);
      expect(head.find(".vc-accordion-item__actions .x").exists()).toBe(true);
      expect(wrapper.find(".vc-accordion-item__header .x").exists()).toBe(false);
    });

    it("mounts lazy content only while open and makes the closed panel inert", async () => {
      const wrapper = mount(VcAccordionItem, {
        props: { title: "T", lazy: true },
        slots: { default: '<input class="body" />' },
      });
      expect(wrapper.find(".body").exists()).toBe(false);
      expect(wrapper.find(".vc-accordion-item__content-wrapper").attributes("inert")).toBeDefined();

      await wrapper.find(".vc-accordion-item__header").trigger("click");
      expect(wrapper.find(".body").exists()).toBe(true);
      expect(wrapper.find(".vc-accordion-item__content-wrapper").attributes("inert")).toBeUndefined();

      // no close animation in jsdom: the content goes at once
      await wrapper.find(".vc-accordion-item__header").trigger("click");
      expect(wrapper.find(".body").exists()).toBe(false);
    });

    it("keeps non-lazy content mounted while closed", () => {
      const wrapper = mount(VcAccordionItem, { props: { title: "T" }, slots: { default: '<input class="body" />' } });
      expect(wrapper.find(".body").exists()).toBe(true);
      expect(wrapper.find(".vc-accordion-item__content-wrapper").attributes("inert")).toBeUndefined();
    });

    it("puts the chevron before the title with iconPosition start", () => {
      const end = mount(VcAccordionItem, { props: { title: "T" } });
      const start = mount(VcAccordionItem, { props: { title: "T", iconPosition: "start" } });
      expect(end.find(".vc-accordion-item__header").element.lastElementChild?.classList).toContain(
        "vc-accordion-item__icon",
      );
      const first = start.find(".vc-accordion-item__header").element.firstElementChild;
      expect(first?.classList).toContain("vc-accordion-item__icon--start");
    });
  });
});
