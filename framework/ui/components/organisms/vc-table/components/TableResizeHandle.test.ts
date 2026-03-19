import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import TableResizeHandle from "./TableResizeHandle.vue";

function factory(props: Record<string, unknown> = {}) {
  return mount(TableResizeHandle, { props });
}

describe("TableResizeHandle", () => {
  it("renders handle element", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__resize-handle").exists()).toBe(true);
  });

  it("renders handle bar", () => {
    const w = factory();
    expect(w.find(".vc-table-composition__resize-handle-bar").exists()).toBe(true);
  });

  it("emits resizeStart on mousedown", async () => {
    const w = factory({ columnId: "col1" });
    await w.find(".vc-table-composition__resize-handle").trigger("mousedown", { pageX: 100 });
    expect(w.emitted("resizeStart")).toBeTruthy();
    // jsdom trigger doesn't support pageX, so just check columnId is passed
    expect(w.emitted("resizeStart")![0][0]).toBe("col1");
  });

  it("emits resizeEnd on mouseup after mousedown", async () => {
    const w = factory({ columnId: "col1" });
    await w.find(".vc-table-composition__resize-handle").trigger("mousedown", { pageX: 100 });
    document.dispatchEvent(new MouseEvent("mouseup"));
    expect(w.emitted("resizeEnd")).toBeTruthy();
  });

  it("applies resizing class during resize", async () => {
    const w = factory({ columnId: "col1" });
    await w.find(".vc-table-composition__resize-handle").trigger("mousedown", { pageX: 100 });
    expect(w.find(".vc-table-composition__resize-handle--resizing").exists()).toBe(true);
  });

  it("emits resizeStart on touchstart", async () => {
    const w = factory({ columnId: "col1" });
    await w.find(".vc-table-composition__resize-handle").trigger("touchstart", {
      touches: [{ pageX: 200 }],
    });
    expect(w.emitted("resizeStart")).toBeTruthy();
  });
});
