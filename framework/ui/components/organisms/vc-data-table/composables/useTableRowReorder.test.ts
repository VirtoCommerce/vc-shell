import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

// Mock sortablejs: capture the options passed to Sortable.create and expose
// a controllable instance so we can invoke onStart/onEnd manually.
const createSpy = vi.fn();
const destroySpy = vi.fn();
const optionSpy = vi.fn();
let lastOptions: any = null;

vi.mock("sortablejs", () => ({
  default: {
    create: (el: HTMLElement, options: any) => {
      lastOptions = options;
      createSpy(el, options);
      return { destroy: destroySpy, option: optionSpy, el };
    },
  },
}));

import { useTableRowReorder } from "@ui/components/organisms/vc-data-table/composables/useTableRowReorder";

type Item = { id: string; name: string };
const makeItems = (): Item[] => [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];

beforeEach(() => {
  createSpy.mockClear();
  destroySpy.mockClear();
  optionSpy.mockClear();
  lastOptions = null;
});

describe("useTableRowReorder (SortableJS)", () => {
  it("does not create Sortable until the list element ref is set", () => {
    const listEl = ref<HTMLElement>();
    const items = ref(makeItems());
    mountWithSetup(() => useTableRowReorder(listEl, items, { disabled: ref(false), handle: ".h", onReorder: vi.fn() }));
    expect(createSpy).not.toHaveBeenCalled();
  });

  it("creates Sortable with handle + disabled when the element appears", async () => {
    const listEl = ref<HTMLElement>();
    const items = ref(makeItems());
    mountWithSetup(() => useTableRowReorder(listEl, items, { disabled: ref(false), handle: ".h", onReorder: vi.fn() }));
    listEl.value = document.createElement("div");
    await nextTick();
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(lastOptions.handle).toBe(".h");
    expect(lastOptions.disabled).toBe(false);
    expect(lastOptions.forceFallback).toBe(true);
    // Floating clone is hidden via fallbackClass; the in-list placeholder is the ghost.
    expect(lastOptions.ghostClass).toBe("vc-data-table__row-reorder-ghost");
    expect(lastOptions.fallbackClass).toBe("vc-data-table__row-reorder-fallback");
  });

  it("onEnd emits onReorder with dragIndex/dropIndex/value and sets pendingReorder", async () => {
    const listEl = ref<HTMLElement>(document.createElement("div"));
    const items = ref(makeItems());
    const onReorder = vi.fn();
    const { result } = mountWithSetup(() =>
      useTableRowReorder(listEl, items, { disabled: ref(false), handle: ".h", onReorder }),
    );
    await nextTick();
    // Move index 0 -> index 2
    lastOptions.onEnd({ oldIndex: 0, newIndex: 2 });
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder.mock.calls[0][0]).toEqual({
      dragIndex: 0,
      dropIndex: 2,
      value: [
        { id: "b", name: "Beta" },
        { id: "c", name: "Gamma" },
        { id: "a", name: "Alpha" },
      ],
    });
    expect(result.pendingReorder.value).toBe(true);
    expect(result.reorderedItems.value[0].id).toBe("b");
  });

  it("onEnd is a no-op when oldIndex === newIndex", async () => {
    const listEl = ref<HTMLElement>(document.createElement("div"));
    const items = ref(makeItems());
    const onReorder = vi.fn();
    mountWithSetup(() => useTableRowReorder(listEl, items, { disabled: ref(false), handle: ".h", onReorder }));
    await nextTick();
    lastOptions.onEnd({ oldIndex: 1, newIndex: 1 });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("toggles Sortable disabled option when the disabled ref changes", async () => {
    const listEl = ref<HTMLElement>(document.createElement("div"));
    const items = ref(makeItems());
    const disabled = ref(false);
    mountWithSetup(() => useTableRowReorder(listEl, items, { disabled, handle: ".h", onReorder: vi.fn() }));
    await nextTick();
    disabled.value = true;
    await nextTick();
    expect(optionSpy).toHaveBeenCalledWith("disabled", true);
  });

  it("items watcher resyncs reorderedItems and clears pendingReorder when not dragging", async () => {
    const listEl = ref<HTMLElement>(document.createElement("div"));
    const items = ref(makeItems());
    const { result } = mountWithSetup(() =>
      useTableRowReorder(listEl, items, { disabled: ref(false), handle: ".h", onReorder: vi.fn() }),
    );
    await nextTick();
    result.pendingReorder.value = true;
    items.value = [
      { id: "b", name: "Beta" },
      { id: "a", name: "Alpha" },
      { id: "c", name: "Gamma" },
    ];
    await nextTick();
    expect(result.pendingReorder.value).toBe(false);
    expect(result.reorderedItems.value[0].id).toBe("b");
  });

  it("toggles isDragging true on start and false on end", async () => {
    const listEl = ref<HTMLElement>(document.createElement("div"));
    const items = ref(makeItems());
    const { result } = mountWithSetup(() =>
      useTableRowReorder(listEl, items, { disabled: ref(false), handle: ".h", onReorder: vi.fn() }),
    );
    await nextTick();
    expect(result.isDragging.value).toBe(false);
    lastOptions.onStart();
    expect(result.isDragging.value).toBe(true);
    lastOptions.onEnd({ oldIndex: 0, newIndex: 1 });
    expect(result.isDragging.value).toBe(false);
  });

  it("destroys Sortable on unmount", async () => {
    const listEl = ref<HTMLElement>(document.createElement("div"));
    const items = ref(makeItems());
    const { wrapper } = mountWithSetup(() =>
      useTableRowReorder(listEl, items, { disabled: ref(false), handle: ".h", onReorder: vi.fn() }),
    );
    await nextTick();
    wrapper.unmount();
    expect(destroySpy).toHaveBeenCalled();
  });

  it("reverts SortableJS's DOM mutation on drop so Vue stays the source of truth", async () => {
    // Build a real list container with one child element per item, in original order.
    const container = document.createElement("div");
    const items = ref(makeItems()); // a, b, c
    const nodes = items.value.map((it) => {
      const el = document.createElement("div");
      el.dataset.id = it.id;
      container.appendChild(el);
      return el;
    });
    const listEl = ref<HTMLElement>(container);
    const onReorder = vi.fn();
    const { result } = mountWithSetup(() =>
      useTableRowReorder(listEl, items, { disabled: ref(false), handle: ".h", onReorder }),
    );
    await nextTick();

    // Simulate SortableJS having physically moved the first node to the end: [b, c, a].
    container.appendChild(nodes[0]);
    expect([...container.children].map((c) => (c as HTMLElement).dataset.id)).toEqual(["b", "c", "a"]);

    // Drop: SortableJS reports oldIndex 0 -> newIndex 2 and passes the moved node + source list.
    lastOptions.onEnd({ item: nodes[0], from: container, to: container, oldIndex: 0, newIndex: 2 });

    // DOM is reverted to the original order so Vue can re-render from a known baseline.
    expect([...container.children].map((c) => (c as HTMLElement).dataset.id)).toEqual(["a", "b", "c"]);
    // The logical reorder is still committed correctly.
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder.mock.calls[0][0].value.map((i: { id: string }) => i.id)).toEqual(["b", "c", "a"]);
    expect(result.reorderedItems.value.map((i) => i.id)).toEqual(["b", "c", "a"]);
  });
});
