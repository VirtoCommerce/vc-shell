import { describe, expect, it } from "vitest";
import { shallowRef } from "vue";
import type { ColumnInstance } from "../utils/ColumnCollector";
import type { VcColumnProps } from "../types";
import { useMobileCardLayout } from "./useMobileCardLayout";

function createColumn(props: Partial<VcColumnProps> & { id: string }): ColumnInstance {
  const { id, ...rest } = props;

  return {
    instance: {} as ColumnInstance["instance"],
    props: {
      id,
      type: "text",
      visible: true,
      mobileVisible: true,
      ...rest,
    } as VcColumnProps,
    slots: {} as ColumnInstance["slots"],
  };
}

describe("useMobileCardLayout", () => {
  it("builds fallback mobile layout from column types when no explicit mobile config exists", () => {
    const columns = shallowRef<ColumnInstance[]>([
      createColumn({ id: "name", title: "Name", type: "text" }),
      createColumn({ id: "status", title: "Status", type: "status" }),
      createColumn({ id: "image", title: "Image", type: "image" }),
      createColumn({ id: "price", title: "Price", type: "money" }),
      createColumn({ id: "sku", title: "SKU", type: "text" }),
    ]);

    const { hasMobileColumns, mobileLayout } = useMobileCardLayout({ columns });

    expect(hasMobileColumns.value).toBe(true);
    expect(mobileLayout.value.title?.id).toBe("name");
    expect(mobileLayout.value.image?.id).toBe("image");
    expect(mobileLayout.value.statuses.map((col) => col.id)).toEqual(["status"]);
    expect(mobileLayout.value.fields.map((col) => col.id)).toEqual(["price", "sku"]);
  });

  it("keeps explicit mobile configuration as highest priority", () => {
    const columns = shallowRef<ColumnInstance[]>([
      createColumn({ id: "name", title: "Name", type: "text", mobileRole: "title" }),
      createColumn({ id: "price", title: "Price", type: "money" }),
    ]);

    const { mobileVisibleColumns, mobileLayout } = useMobileCardLayout({ columns });

    expect(mobileVisibleColumns.value.map((col) => col.id)).toEqual(["name"]);
    expect(mobileLayout.value.title?.id).toBe("name");
    expect(mobileLayout.value.fields).toHaveLength(0);
  });

  it("skips service columns in fallback mode", () => {
    const columns = shallowRef<ColumnInstance[]>([
      createColumn({ id: "selection", selectionMode: "multiple" }),
      createColumn({ id: "expand", expander: true }),
      createColumn({ id: "name", title: "Name", type: "text" }),
    ]);

    const { mobileVisibleColumns, mobileLayout } = useMobileCardLayout({ columns });

    expect(mobileVisibleColumns.value.map((col) => col.id)).toEqual(["name"]);
    expect(mobileLayout.value.title?.id).toBe("name");
  });

  it("does not suppress fallback layout when only hidden columns have explicit mobile config", () => {
    const columns = shallowRef<ColumnInstance[]>([
      createColumn({ id: "hiddenExplicit", title: "Hidden", type: "text", mobileRole: "title", visible: false }),
      createColumn({ id: "name", title: "Name", type: "text" }),
      createColumn({ id: "status", title: "Status", type: "status" }),
    ]);

    const { hasMobileColumns, mobileLayout } = useMobileCardLayout({ columns });

    expect(hasMobileColumns.value).toBe(true);
    expect(mobileLayout.value.title?.id).toBe("name");
    expect(mobileLayout.value.statuses.map((col) => col.id)).toEqual(["status"]);
  });
});
