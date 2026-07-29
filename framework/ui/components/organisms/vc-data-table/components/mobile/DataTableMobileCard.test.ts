import { describe, it, expect, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import DataTableMobileCard from "@ui/components/organisms/vc-data-table/components/mobile/DataTableMobileCard.vue";
import { provideTableSwipe } from "@ui/components/organisms/vc-data-table/composables/useTableSwipe";

const baseLayout = { image: null, title: null, fields: [], statuses: [] };

const baseProps = {
  item: { id: "1", name: "Row 1" },
  index: 0,
  layout: baseLayout,
  isSelected: false,
  isSelectable: true,
};

// DataTableMobileCard calls useTableSwipe() which requires a provider in the tree.
function mountCard(props: Record<string, unknown>) {
  const Wrapper = defineComponent({
    setup() {
      provideTableSwipe();
      return () => h(DataTableMobileCard as any, props);
    },
  });
  return mount(Wrapper, {
    global: {
      stubs: {
        MobileCellRenderer: true,
        MobileActionSheet: true,
        VcCheckbox: true,
        VcIcon: true,
      },
    },
  });
}

describe("DataTableMobileCard — reorder handle", () => {
  it("does not render the drag handle when reorderable is false", () => {
    const wrapper = mountCard({ ...baseProps, reorderable: false });
    expect(wrapper.find(".vc-data-table-mobile-card__drag-handle").exists()).toBe(false);
  });

  it("renders the drag handle when reorderable is true", () => {
    const wrapper = mountCard({ ...baseProps, reorderable: true });
    expect(wrapper.find(".vc-data-table-mobile-card__drag-handle").exists()).toBe(true);
  });

  it("drag handle contains a grip svg with aria-hidden", () => {
    const wrapper = mountCard({ ...baseProps, reorderable: true });
    const handle = wrapper.find(".vc-data-table-mobile-card__drag-handle");
    const svg = handle.find("svg");
    expect(svg.exists()).toBe(true);
    expect(svg.attributes("aria-hidden")).toBe("true");
  });
});

describe("DataTableMobileCard — expandable rows", () => {
  // The mobile card had no expansion UI at all, so a configurable order line
  // could be opened on desktop but never on a phone.
  function mountExpandable(props: Record<string, unknown>, slots?: Record<string, unknown>) {
    const Wrapper = defineComponent({
      setup() {
        provideTableSwipe();
        return () => h(DataTableMobileCard as any, props, slots);
      },
    });
    return mount(Wrapper, {
      global: { stubs: { MobileCellRenderer: true, MobileActionSheet: true, VcCheckbox: true, VcIcon: true } },
    });
  }

  it("does not render the expander when the row cannot expand", () => {
    const wrapper = mountExpandable({ ...baseProps, expandable: false });
    expect(wrapper.find(".vc-data-table-mobile-card__expander").exists()).toBe(false);
  });

  it("renders the expander when the row can expand", () => {
    const wrapper = mountExpandable({ ...baseProps, expandable: true });
    const btn = wrapper.find(".vc-data-table-mobile-card__expander");
    expect(btn.exists()).toBe(true);
    expect(btn.attributes("aria-expanded")).toBe("false");
  });

  it("reflects the expanded state on the toggle", () => {
    const wrapper = mountExpandable({ ...baseProps, expandable: true, isExpanded: true });
    const btn = wrapper.find(".vc-data-table-mobile-card__expander");
    expect(btn.attributes("aria-expanded")).toBe("true");
    expect(btn.classes()).toContain("vc-data-table-mobile-card__expander--expanded");
  });

  it("emits expand-toggle without also emitting the row click", async () => {
    // click.stop matters: without it, tapping the chevron would also open the
    // details blade via the card's row-click handler.
    const onExpandToggle = vi.fn();
    const onClick = vi.fn();
    const wrapper = mountExpandable({
      ...baseProps,
      expandable: true,
      onExpandToggle,
      onClick,
    });

    await wrapper.find(".vc-data-table-mobile-card__expander").trigger("click");

    expect(onExpandToggle).toHaveBeenCalledTimes(1);
    expect(onExpandToggle.mock.calls[0][0]).toEqual(baseProps.item);
    expect(onExpandToggle.mock.calls[0][1]).toBe(0);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders the expansion slot only while expanded", () => {
    const slots = { expansion: () => h("div", { class: "cfg-items" }, "Configuration items") };

    const collapsed = mountExpandable({ ...baseProps, expandable: true, isExpanded: false }, slots);
    expect(collapsed.find(".vc-data-table-mobile-card__expansion").exists()).toBe(false);
    expect(collapsed.find(".cfg-items").exists()).toBe(false);

    const expanded = mountExpandable({ ...baseProps, expandable: true, isExpanded: true }, slots);
    expect(expanded.find(".vc-data-table-mobile-card__expansion").exists()).toBe(true);
    expect(expanded.find(".cfg-items").text()).toBe("Configuration items");
  });
});
