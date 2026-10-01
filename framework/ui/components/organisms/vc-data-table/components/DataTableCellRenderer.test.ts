import { describe, expect, it } from "vitest";
import { h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import DataTableCellRenderer from "./DataTableCellRenderer.vue";
import { ColumnCollectorKey } from "@ui/components/organisms/vc-data-table/keys";

const stubs = {
  TableCheckbox: { template: '<div class="table-checkbox-stub" />' },
  TableCell: { template: '<div class="table-cell-stub"><slot /></div>' },
  VcButton: { template: '<button class="vc-button-stub"><slot /></button>' },
  VcIcon: { template: '<i class="vc-icon-stub" />' },
  VcRadioButton: { template: '<div class="vc-radio-stub" />' },
  DynamicCellRenderer: { template: '<span class="dynamic-cell-stub" />' },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(DataTableCellRenderer, {
    props: {
      column: {
        instance: {},
        props: { id: "name", field: "name", type: "text" },
        slots: {},
      },
      item: { name: "Test" },
      editingRowData: { name: "Test" },
      index: 0,
      ...props,
    },
    global: {
      stubs,
      provide: {
        [ColumnCollectorKey as symbol]: { columns: [] },
      },
    },
  });
}

describe("DataTableCellRenderer", () => {
  it("renders without errors", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });

  it("mounts the component", () => {
    const w = factory();
    expect(w.vm).toBeDefined();
  });

  describe("expander column", () => {
    const expanderColumn = {
      instance: {},
      props: { id: "expander", expander: true },
      slots: {},
    };

    it("renders expander button by default", () => {
      const w = factory({ column: expanderColumn });
      expect(w.html()).toContain("vc-button-stub");
    });

    it("renders expander button when canExpand is true", () => {
      const w = factory({ column: expanderColumn, canExpand: true });
      expect(w.html()).toContain("vc-button-stub");
    });

    it("hides expander button when canExpand is false", () => {
      const w = factory({ column: expanderColumn, canExpand: false });
      expect(w.html()).not.toContain("vc-button-stub");
    });
  });

  describe("cell editor", () => {
    // The editor renders an input that controls a popup, like VcSelect's teleported listbox.
    const editorColumn = {
      instance: {},
      props: { id: "name", field: "name", type: "text", editable: true },
      slots: {
        editor: () => [h("div", { "aria-controls": "editor-popup" }, [h("input", { class: "editor-input" })])],
      },
    };

    function mountEditor() {
      return mount(DataTableCellRenderer, {
        attachTo: document.body,
        props: {
          column: editorColumn as never,
          item: { name: "Test" },
          editingRowData: { name: "Test" },
          index: 0,
          isCellEditing: true,
        },
        global: { stubs, provide: { [ColumnCollectorKey as symbol]: { columns: [] } } },
      });
    }

    it("focuses the editor when it opens", async () => {
      const w = mountEditor();
      await nextTick();
      expect(document.activeElement).toBe(w.find(".editor-input").element);
      w.unmount();
    });

    it("keeps editing when focus moves into a popup the editor controls", async () => {
      const popup = document.createElement("div");
      popup.id = "editor-popup";
      popup.innerHTML = "<button>option</button>";
      document.body.appendChild(popup);
      const w = mountEditor();

      await w.find(".editor-input").trigger("focusout", { relatedTarget: popup.querySelector("button") });
      expect(w.emitted("edit-complete")).toBeUndefined();

      await w.find(".editor-input").trigger("focusout", { relatedTarget: document.body });
      expect(w.emitted("edit-complete")).toHaveLength(1);

      w.unmount();
      popup.remove();
    });

    // A popup that drops focus on close (VcSelect after a pick) leaves no focusout to react to.
    it("completes on a click outside the editor, but not on a click in its popup", async () => {
      const popup = document.createElement("div");
      popup.id = "editor-popup";
      popup.innerHTML = "<button>option</button>";
      document.body.appendChild(popup);
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      const w = mountEditor();
      await nextTick();

      const click = (el: Element) => {
        el.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
        el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      };
      click(popup.querySelector("button")!);
      expect(w.emitted("edit-complete")).toBeUndefined();
      click(outside);
      expect(w.emitted("edit-complete")).toHaveLength(1);

      w.unmount();
      popup.remove();
      outside.remove();
    });

    // Built-in editors (no #editor slot) open the same way.
    it("focuses a built-in editor and completes it on a click outside", async () => {
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      const w = mount(DataTableCellRenderer, {
        attachTo: document.body,
        props: {
          column: {
            instance: {},
            props: { id: "name", field: "name", type: "text", editable: true },
            slots: {},
          } as never,
          item: { name: "Test" },
          editingRowData: { name: "Test" },
          index: 0,
          isCellEditing: true,
        },
        global: {
          stubs: {
            ...stubs,
            DynamicCellRenderer: { template: '<div class="builtin-editor"><input class="builtin-input" /></div>' },
          },
          provide: { [ColumnCollectorKey as symbol]: { columns: [] } },
        },
      });
      await nextTick();
      expect(document.activeElement).toBe(w.find(".builtin-input").element);

      outside.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
      outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      expect(w.emitted("edit-complete")).toHaveLength(1);

      w.unmount();
      outside.remove();
    });
  });
});
