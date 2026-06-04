import { describe, it, expect } from "vitest";
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
