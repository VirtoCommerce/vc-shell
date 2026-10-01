import { describe, expect, it, vi } from "vitest";
import { h } from "vue";
import { mount } from "@vue/test-utils";
import MobileCellRenderer from "./MobileCellRenderer.vue";
import { MobileCellEditKey, type MobileCellEdit } from "@ui/components/organisms/vc-data-table/keys";

const column = {
  instance: {},
  props: { id: "key", field: "key", title: "Key", editable: true },
  slots: { editor: () => [h("input", { class: "editor-input" })] },
};

function mountCell(edit: Partial<MobileCellEdit> = {}) {
  const cellEdit: MobileCellEdit = {
    enabled: () => true,
    isCellEditing: () => false,
    getEditingRowData: (item) => item,
    start: vi.fn(),
    complete: vi.fn(),
    cancel: vi.fn(),
    ...edit,
  };
  const onCardClick = vi.fn();
  const wrapper = mount(
    {
      components: { MobileCellRenderer },
      setup: () => ({ config: { id: "key", field: "key", column }, item: { key: "A" }, onCardClick }),
      template: `<div class="card" @click="onCardClick"><MobileCellRenderer :config="config" :item="item" :index="2" /></div>`,
    },
    {
      global: {
        provide: { [MobileCellEditKey as symbol]: cellEdit },
        stubs: { DynamicCellRenderer: { template: '<span class="value">A</span>' } },
      },
    },
  );
  return { wrapper, cellEdit, onCardClick };
}

describe("MobileCellRenderer — cell edit mode", () => {
  it("starts editing on tap without reaching the card", async () => {
    const { wrapper, cellEdit, onCardClick } = mountCell();
    await wrapper.find(".vc-mobile-cell-renderer--editable").trigger("click");

    expect(cellEdit.start).toHaveBeenCalledWith({ key: "A" }, "key", 2, column);
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it("renders the column editor while the cell is open and reports completion", async () => {
    const { wrapper, cellEdit } = mountCell({ isCellEditing: (index, field) => index === 2 && field === "key" });
    expect(wrapper.find(".editor-input").exists()).toBe(true);

    await wrapper.find(".vc-cell-renderer__editor-wrapper").trigger("keydown", { key: "Enter" });
    expect(cellEdit.complete).toHaveBeenCalledWith({ key: "A" }, "key", 2, "A");
  });

  it("stays a plain value outside cell edit mode", async () => {
    const { wrapper, cellEdit, onCardClick } = mountCell({ enabled: () => false });
    expect(wrapper.find(".vc-mobile-cell-renderer--editable").exists()).toBe(false);

    await wrapper.find(".value").trigger("click");
    expect(cellEdit.start).not.toHaveBeenCalled();
    expect(onCardClick).toHaveBeenCalled();
  });
});
