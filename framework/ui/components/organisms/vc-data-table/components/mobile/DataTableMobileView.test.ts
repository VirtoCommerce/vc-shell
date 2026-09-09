import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DataTableMobileView from "@ui/components/organisms/vc-data-table/components/mobile/DataTableMobileView.vue";
import DataTableMobileCard from "@ui/components/organisms/vc-data-table/components/mobile/DataTableMobileCard.vue";

const items = [
  { id: "a", name: "Row A" },
  { id: "b", name: "Row B" },
];

function mountView(props: Record<string, unknown>) {
  return mount(DataTableMobileView as any, {
    props: { items, columns: [], dataKey: "id", selectionMode: "multiple", ...props },
    global: { stubs: { MobileCellRenderer: true, MobileActionSheet: true, VcCheckbox: true, VcIcon: true } },
  });
}

/**
 * The mobile card has no permanent checkbox: it enters selection mode only while
 * something is selected, and a tap then toggles selection instead of opening the
 * row. So "is anything selected" decides whether rows are clickable at all — and
 * it has to mean "on this screen", not "anywhere in the array".
 *
 * Deleting the only selected row left its ghost in the selection, which pinned
 * every remaining row into selection mode with nothing left to untick.
 */
describe("DataTableMobileView selection mode", () => {
  it("is on while a selected row is on screen", () => {
    const view = mountView({ selection: [items[0]] });
    expect(view.findComponent(DataTableMobileCard).props("anySelected")).toBe(true);
  });

  it("is off when nothing is selected", () => {
    const view = mountView({ selection: [] });
    expect(view.findComponent(DataTableMobileCard).props("anySelected")).toBe(false);
  });

  it("is off when the only selected row is no longer in the list", () => {
    // The row was deleted; the parent's selection array still holds it.
    const view = mountView({ selection: [{ id: "deleted", name: "Row C" }] });
    expect(view.findComponent(DataTableMobileCard).props("anySelected")).toBe(false);
  });

  it("opens a row instead of selecting it once the selected row is gone", async () => {
    const view = mountView({ selection: [{ id: "deleted", name: "Row C" }] });
    await view.findComponent(DataTableMobileCard).find(".vc-data-table-mobile-card").trigger("click");
    expect(view.emitted("click")).toBeTruthy();
    expect(view.emitted("select")).toBeFalsy();
  });
});
