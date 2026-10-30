import { describe, expect, it, vi, beforeEach } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";

const created: {
  el: HTMLElement;
  options: Record<string, any>;
  option: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
}[] = [];

vi.mock("sortablejs", () => ({
  default: {
    create: (el: HTMLElement, options: Record<string, any>) => {
      const inst = { el, options, option: vi.fn(), destroy: vi.fn() };
      created.push(inst);
      return inst;
    },
  },
}));

import { useWidgetSortable } from "./useWidgetSortable";

function setup(onMove = vi.fn(), canPut?: (l: "strip" | "overflow") => boolean) {
  const enabled = ref(true);
  const Host = defineComponent({
    setup() {
      const el = ref<HTMLElement>();
      useWidgetSortable(el, { group: "w", enabled, onMove, canPut });
      return () =>
        h(
          "div",
          { ref: el, "data-widget-list": "strip" },
          ["a", "b", "c"].map((id) => h("div", { "data-widget-id": id, key: id })),
        );
    },
  });
  return { wrapper: mount(Host, { attachTo: document.body }), enabled, onMove };
}

describe("useWidgetSortable", () => {
  beforeEach(() => (created.length = 0));

  it("restores the DOM order before onMove is called", async () => {
    const order: string[] = [];
    const onMove = vi.fn(() =>
      order.push(...Array.from(list.children).map((c) => (c as HTMLElement).dataset.widgetId!)),
    );
    const { wrapper } = setup(onMove);
    await nextTick();
    const list = wrapper.element as HTMLElement;
    const [a, , c] = Array.from(list.children) as HTMLElement[];
    // Sortable moved "a" to the end
    list.appendChild(a);
    created[0].options.onEnd({ item: a, from: list, to: list, oldIndex: 0, newIndex: 2 });
    expect(order).toEqual(["a", "b", "c"]);
    expect(onMove).toHaveBeenCalledWith({ fromList: "strip", toList: "strip", from: 0, to: 2, id: "a" });
    expect(c).toBe(list.lastElementChild);
    wrapper.unmount();
  });

  it("reports a cross-list move and returns the node to its source list", async () => {
    const { wrapper, onMove } = setup();
    await nextTick();
    const list = wrapper.element as HTMLElement;
    const target = document.createElement("div");
    target.dataset.widgetList = "overflow";
    const a = list.children[0] as HTMLElement;
    target.appendChild(a);
    created[0].options.onEnd({ item: a, from: list, to: target, oldIndex: 0, newIndex: 0 });
    expect(list.children[0]).toBe(a);
    expect(onMove).toHaveBeenCalledWith({ fromList: "strip", toList: "overflow", from: 0, to: 0, id: "a" });
    wrapper.unmount();
  });

  it("does not touch the DOM when an index is missing", async () => {
    const { wrapper, onMove } = setup();
    await nextTick();
    const list = wrapper.element as HTMLElement;
    const a = list.children[0] as HTMLElement;
    const detached = document.createElement("div");
    detached.appendChild(a);
    created[0].options.onEnd({ item: a, from: list, to: detached, oldIndex: undefined, newIndex: 0 });
    expect(a.parentNode).toBe(detached);
    expect(onMove).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("ignores a no-op drop", async () => {
    const { wrapper, onMove } = setup();
    await nextTick();
    const list = wrapper.element as HTMLElement;
    created[0].options.onEnd({ item: list.children[1], from: list, to: list, oldIndex: 1, newIndex: 1 });
    expect(onMove).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("refuses a drop through canPut and follows enabled", async () => {
    const { wrapper, enabled } = setup(vi.fn(), () => false);
    await nextTick();
    expect(created[0].options.group.put()).toBe(false);
    expect(created[0].options.disabled).toBe(false);
    enabled.value = false;
    await nextTick();
    expect(created[0].option).toHaveBeenCalledWith("disabled", true);
    wrapper.unmount();
    expect(created[0].destroy).toHaveBeenCalled();
  });
});
