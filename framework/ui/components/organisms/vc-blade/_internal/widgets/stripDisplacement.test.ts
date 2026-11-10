import { describe, expect, it } from "vitest";
import { createStripDisplacement } from "./stripDisplacement";

function list(name: "strip" | "overflow", ids: string[]) {
  const el = document.createElement("div");
  el.dataset.widgetList = name;
  // Vue keeps text anchors around a v-for
  el.append(document.createTextNode(""));
  for (const id of ids) {
    const item = document.createElement("div");
    item.dataset.widgetSlot = id;
    el.append(item);
  }
  el.append(document.createTextNode(""));
  return el;
}

const ids = (el: HTMLElement) => Array.from(el.children).map((c) => (c as HTMLElement).dataset.widgetSlot);
const byId = (el: HTMLElement, id: string) => el.querySelector<HTMLElement>(`[data-widget-slot="${id}"]`)!;

describe("createStripDisplacement", () => {
  // Sortable has already moved the dragged node when it reports the change
  function dragInto(strip: HTMLElement, overflow: HTMLElement, id: string, before: string | null) {
    const item = byId(overflow, id);
    const oldIndex = ids(overflow).indexOf(id);
    strip.insertBefore(item, before ? byId(strip, before) : strip.lastChild);
    return { item, from: overflow, to: strip, oldIndex };
  }

  it("moves the last strip widget to the dragged one's place while over a full strip", () => {
    const strip = list("strip", ["a", "b", "c"]);
    const overflow = list("overflow", ["x", "y"]);
    const d = createStripDisplacement(3);
    d.onChange(dragInto(strip, overflow, "x", "b"));
    expect(ids(strip)).toEqual(["a", "x", "b"]);
    expect(ids(overflow)).toEqual(["c", "y"]);
  });

  it("puts it back when the widget is dragged back, and on drop", () => {
    const strip = list("strip", ["a", "b", "c"]);
    const overflow = list("overflow", ["x", "y"]);
    const d = createStripDisplacement(3);
    const change = dragInto(strip, overflow, "x", null);
    d.onChange(change);
    expect(ids(strip)).toEqual(["a", "b", "x"]);

    overflow.insertBefore(change.item, byId(overflow, "y"));
    d.onChange({ ...change, to: overflow });
    expect(ids(strip)).toEqual(["a", "b", "c"]);

    d.onChange(dragInto(strip, overflow, "x", "a"));
    expect(ids(overflow)).toEqual(["c", "y"]);
    d.restore();
    expect(ids(strip)).toEqual(["x", "a", "b", "c"]);
    expect(strip.lastChild?.nodeType).toBe(Node.TEXT_NODE);
  });

  it("leaves a strip with room, and drags that start on the strip, alone", () => {
    const strip = list("strip", ["a", "b"]);
    const overflow = list("overflow", ["x"]);
    const d = createStripDisplacement(3);
    d.onChange(dragInto(strip, overflow, "x", "a"));
    expect(ids(strip)).toEqual(["x", "a", "b"]);

    const full = list("strip", ["a", "b", "c"]);
    d.onChange({ item: byId(full, "a"), from: full, to: full, oldIndex: 0 });
    expect(ids(full)).toEqual(["a", "b", "c"]);
  });
});
