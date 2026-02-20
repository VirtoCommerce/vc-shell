import { describe, it, expect, beforeEach } from "vitest";
import { createSimpleMapRegistry, type SimpleMapRegistry } from "@core/services/_internal/createSimpleMapRegistry";

interface TestItem {
  id: string;
  order?: number;
  label: string;
}

interface TestOptions {
  id?: string;
  order?: number;
  label: string;
}

function createTestRegistry(): SimpleMapRegistry<TestItem, TestOptions> {
  return createSimpleMapRegistry<TestItem, TestOptions>({
    createItem: (opts, currentSize) => ({
      id: opts.id || "",
      order: opts.order ?? currentSize,
      label: opts.label,
    }),
    getId: (opts) => opts.id || "",
  });
}

describe("createSimpleMapRegistry", () => {
  let registry: SimpleMapRegistry<TestItem, TestOptions>;

  beforeEach(() => {
    registry = createTestRegistry();
  });

  it("registers items and returns them sorted by order", () => {
    registry.register({ id: "b", order: 2, label: "B" });
    registry.register({ id: "a", order: 1, label: "A" });
    registry.register({ id: "c", order: 3, label: "C" });

    const sorted = registry.sortedItems.value;
    expect(sorted.map((i) => i.id)).toEqual(["a", "b", "c"]);
  });

  it("auto-generates id when none provided", () => {
    const id = registry.register({ label: "No ID" });
    expect(id).toBeTruthy();
    expect(registry.sortedItems.value).toHaveLength(1);
  });

  it("unregister removes the item", () => {
    registry.register({ id: "x", label: "X" });
    expect(registry.sortedItems.value).toHaveLength(1);

    registry.unregister("x");
    expect(registry.sortedItems.value).toHaveLength(0);
  });

  it("uses currentSize as default order", () => {
    registry.register({ id: "first", label: "First" });
    registry.register({ id: "second", label: "Second" });

    const items = registry.sortedItems.value;
    expect(items[0].order).toBe(0);
    expect(items[1].order).toBe(1);
  });

  it("overwrites item with same id", () => {
    registry.register({ id: "a", label: "Original", order: 1 });
    registry.register({ id: "a", label: "Updated", order: 1 });

    expect(registry.sortedItems.value).toHaveLength(1);
    expect(registry.sortedItems.value[0].label).toBe("Updated");
  });

  it("sorts items with undefined order as 0", () => {
    registry.register({ id: "a", order: 5, label: "A" });
    registry.register({ id: "b", label: "B" }); // order defaults to currentSize=1

    const sorted = registry.sortedItems.value;
    expect(sorted[0].id).toBe("b");
    expect(sorted[1].id).toBe("a");
  });
});
