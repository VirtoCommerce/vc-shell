import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import VcColumn from "./VcColumn.vue";
import { ColumnCollectorKey } from "@ui/components/organisms/vc-table/keys";

describe("VcColumn", () => {
  it("is renderless (renders nothing to DOM)", () => {
    const collector = { add: vi.fn(), delete: vi.fn() };
    const w = mount(VcColumn, {
      props: { id: "name" },
      global: {
        provide: { [ColumnCollectorKey as symbol]: collector },
      },
    });
    expect(w.html()).toBe("");
  });

  it("registers with ColumnCollector on mount", () => {
    const collector = { add: vi.fn(), delete: vi.fn() };
    mount(VcColumn, {
      props: { id: "name", field: "name", title: "Name", sortable: true },
      global: {
        provide: { [ColumnCollectorKey as symbol]: collector },
      },
    });
    expect(collector.add).toHaveBeenCalledTimes(1);
    const addArg = collector.add.mock.calls[0][0];
    expect(addArg.props.id).toBe("name");
    expect(addArg.props.sortable).toBe(true);
  });

  it("unregisters from ColumnCollector on unmount", () => {
    const collector = { add: vi.fn(), delete: vi.fn() };
    const w = mount(VcColumn, {
      props: { id: "name" },
      global: {
        provide: { [ColumnCollectorKey as symbol]: collector },
      },
    });
    w.unmount();
    expect(collector.delete).toHaveBeenCalledTimes(1);
  });

  it("does not error without ColumnCollector", () => {
    const w = mount(VcColumn, {
      props: { id: "name" },
    });
    expect(w.html()).toBe("");
  });

  it("passes props correctly to collector", () => {
    const collector = { add: vi.fn(), delete: vi.fn() };
    mount(VcColumn, {
      props: {
        id: "price",
        field: "price",
        title: "Price",
        type: "money",
        width: "150",
        sortable: true,
        visible: true,
        editable: false,
      },
      global: {
        provide: { [ColumnCollectorKey as symbol]: collector },
      },
    });
    const addArg = collector.add.mock.calls[0][0];
    expect(addArg.props.type).toBe("money");
    expect(addArg.props.width).toBe("150");
  });
});
