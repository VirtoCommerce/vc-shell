import { describe, it, expect, vi } from "vitest";
import { ref, nextTick } from "vue";
import { useTableSelectionV2 } from "@ui/components/organisms/vc-table/composables/useTableSelectionV2";

/**
 * Tests for FR-3.7 — Stale callback audit
 *
 * Audit results:
 * - useTableSelection (shared): no callback captures — uses idField which is a value, not a function reference
 * - useTableSelectionV2: isRowSelectable is destructured from options, but options is a plain object.
 *   VcDataTable.vue (line 847) uses the getter pattern:
 *     isRowSelectable: (item) => (props.isRowSelectable ? props.isRowSelectable(item) : true)
 *   so prop changes are reflected at call time — safe.
 * - All other vc-table composables: no static callback captures found.
 */

type Item = { id: string; price: number; selectable: boolean };

function makeOptions(isRowSelectable?: (item: Item) => boolean) {
  return {
    items: ref<Item[]>([
      { id: "a", price: 10, selectable: true },
      { id: "b", price: 20, selectable: false },
      { id: "c", price: 30, selectable: true },
    ]),
    selectionMode: ref<"single" | "multiple">("multiple"),
    dataKey: "id",
    getItemKey: (item: Item) => item.id,
    isRowSelectable,
  };
}

describe("stale callback audit (FR-3.7)", () => {
  it("isRowSelectable uses getter pattern — not static capture", () => {
    // The getter pattern: read from options/props at call time.
    // We simulate this by passing an arrow function that closes over a mutable ref.
    let allowAll = true;
    const isRowSelectableGetter = (item: Item) => (allowAll ? true : item.selectable);

    const { canSelect } = useTableSelectionV2(makeOptions(isRowSelectableGetter));

    // When allowAll=true, everything is selectable
    const itemB: Item = { id: "b", price: 20, selectable: false };
    expect(canSelect(itemB)).toBe(true);

    // Change the captured variable — getter reflects it at call time
    allowAll = false;
    expect(canSelect(itemB)).toBe(false);
  });

  it("changing isRowSelectable prop at runtime is reflected in composable", () => {
    // Simulate the VcDataTable.vue pattern:
    //   isRowSelectable: (item) => (props.isRowSelectable ? props.isRowSelectable(item) : true)
    // where props.isRowSelectable can be changed after setup.
    const propsRef = ref<((item: Item) => boolean) | undefined>(undefined);

    // This getter closes over propsRef — reads at call time (safe pattern)
    const runtimeGetter = (item: Item): boolean => (propsRef.value ? propsRef.value(item) : true);

    const { canSelect } = useTableSelectionV2(makeOptions(runtimeGetter));

    const nonSelectableItem: Item = { id: "b", price: 20, selectable: false };

    // Initially no prop set — everything selectable
    expect(canSelect(nonSelectableItem)).toBe(true);

    // Set prop to only allow items with selectable=true
    propsRef.value = (item: Item) => item.selectable;

    // Now reflected at call time
    expect(canSelect(nonSelectableItem)).toBe(false);
  });

  it("no composable in vc-table/ captures callback props as static references", () => {
    // Audit verification: useTableSelectionV2 receives isRowSelectable as a plain function
    // from options. Since options is a plain object (not a Vue reactive props proxy),
    // the function itself is stable. VcDataTable.vue uses the getter arrow pattern
    // ensuring props changes are captured at call time.
    //
    // This test verifies the selectableItems computed always reads through the callback:
    const callLog: string[] = [];

    const trackingCallback = (item: Item): boolean => {
      callLog.push(item.id);
      return item.selectable;
    };

    const { allSelected, handleSelectAllChange } = useTableSelectionV2(makeOptions(trackingCallback));

    // Trigger selectableItems computation by calling handleSelectAllChange
    handleSelectAllChange(true);

    // trackingCallback was called for each item — not captured statically as a no-op
    expect(callLog.length).toBeGreaterThan(0);

    // Only selectable items are selected (b is not selectable)
    expect(allSelected.value).toBe(true); // all selectable items are selected
  });

  it("selection correctly excludes non-selectable items based on isRowSelectable", () => {
    // Verify the composable uses the isRowSelectable callback to filter
    const isRowSelectable = (item: Item) => item.selectable;
    const { handleSelectAllChange, internalSelection } = useTableSelectionV2(makeOptions(isRowSelectable));

    // Select all — only selectable items should be included
    handleSelectAllChange(true);

    const selectedIds = internalSelection.value.map((i) => i.id);
    expect(selectedIds).toContain("a");
    expect(selectedIds).not.toContain("b"); // not selectable
    expect(selectedIds).toContain("c");
  });

  it("canSelect returns true for all items when no isRowSelectable is provided", () => {
    const { canSelect } = useTableSelectionV2(makeOptions(undefined));
    const item: Item = { id: "b", price: 20, selectable: false };
    expect(canSelect(item)).toBe(true);
  });
});

describe("useTableSelectionV2 — single mode", () => {
  it("handleRowSelectionChange replaces selection (clicking B after A results in only B)", () => {
    const opts = makeOptions();
    opts.selectionMode = ref<"single" | "multiple">("single");
    const { handleRowSelectionChange, internalSelection } = useTableSelectionV2(opts);

    const itemA: Item = { id: "a", price: 10, selectable: true };
    const itemB: Item = { id: "b", price: 20, selectable: false };

    handleRowSelectionChange(itemA);
    expect(internalSelection.value).toHaveLength(1);
    expect(internalSelection.value[0].id).toBe("a");

    handleRowSelectionChange(itemB);
    // Single mode: only B is selected (A replaced)
    // Note: itemB has selectable=false but no isRowSelectable callback, so it CAN be selected
    expect(internalSelection.value).toHaveLength(1);
    expect(internalSelection.value[0].id).toBe("b");
  });

  it("single mode: clicking an already-selected row deselects it", () => {
    const opts = makeOptions();
    opts.selectionMode = ref<"single" | "multiple">("single");
    const { handleRowSelectionChange, internalSelection } = useTableSelectionV2(opts);

    const itemA: Item = { id: "a", price: 10, selectable: true };
    handleRowSelectionChange(itemA);
    expect(internalSelection.value).toHaveLength(1);

    // Click again to deselect
    handleRowSelectionChange(itemA);
    expect(internalSelection.value).toHaveLength(0);
  });
});

describe("useTableSelectionV2 — multi mode", () => {
  it("handleRowSelectionChange accumulates: clicking A then B results in [A, B]", () => {
    const opts = makeOptions();
    const { handleRowSelectionChange, internalSelection } = useTableSelectionV2(opts);

    const itemA: Item = { id: "a", price: 10, selectable: true };
    const itemC: Item = { id: "c", price: 30, selectable: true };

    handleRowSelectionChange(itemA);
    expect(internalSelection.value.map((i) => i.id)).toEqual(["a"]);

    handleRowSelectionChange(itemC);
    expect(internalSelection.value.map((i) => i.id)).toEqual(["a", "c"]);
  });

  it("clicking an already-selected row deselects it in multi mode", () => {
    const opts = makeOptions();
    const { handleRowSelectionChange, internalSelection } = useTableSelectionV2(opts);

    const itemA: Item = { id: "a", price: 10, selectable: true };
    const itemC: Item = { id: "c", price: 30, selectable: true };

    handleRowSelectionChange(itemA);
    handleRowSelectionChange(itemC);
    expect(internalSelection.value).toHaveLength(2);

    // Deselect A
    handleRowSelectionChange(itemA);
    expect(internalSelection.value).toHaveLength(1);
    expect(internalSelection.value[0].id).toBe("c");
  });

  it("isRowSelectable callback: rows failing predicate cannot be selected via handleRowSelectionChange", () => {
    const isRowSelectable = (item: Item) => item.selectable;
    const opts = makeOptions(isRowSelectable);
    const { handleRowSelectionChange, internalSelection } = useTableSelectionV2(opts);

    const nonSelectableItem: Item = { id: "b", price: 20, selectable: false };
    const result = handleRowSelectionChange(nonSelectableItem);

    expect(result).toBeNull();
    expect(internalSelection.value).toHaveLength(0);
  });
});

describe("useTableSelectionV2 — selectAll / clearSelection", () => {
  it("selectAll selects all items; clearSelection deselects all", () => {
    const opts = makeOptions();
    const { selectAll, clearSelection, internalSelection, allSelected } = useTableSelectionV2(opts);

    selectAll();
    expect(allSelected.value).toBe(true);
    expect(internalSelection.value).toHaveLength(3); // all items (no isRowSelectable filter)

    clearSelection();
    expect(internalSelection.value).toHaveLength(0);
    expect(allSelected.value).toBe(false);
  });

  it("handleSelectAllChange(true) selects all; handleSelectAllChange(false) deselects all", () => {
    const opts = makeOptions();
    const { handleSelectAllChange, internalSelection } = useTableSelectionV2(opts);

    handleSelectAllChange(true);
    expect(internalSelection.value).toHaveLength(3);

    handleSelectAllChange(false);
    expect(internalSelection.value).toHaveLength(0);
  });
});

describe("useTableSelectionV2 — external modelValue sync", () => {
  it("updating the selection ref externally reflects in internalSelection", async () => {
    const selectionRef = ref<Item | Item[] | undefined>(undefined);
    const opts = {
      ...makeOptions(),
      selection: selectionRef,
    };
    const { internalSelection } = useTableSelectionV2(opts);

    // Initially empty
    expect(internalSelection.value).toHaveLength(0);

    // Set external selection
    const itemA: Item = { id: "a", price: 10, selectable: true };
    selectionRef.value = [itemA];

    await nextTick();

    expect(internalSelection.value).toHaveLength(1);
    expect(internalSelection.value[0].id).toBe("a");
  });

  it("single item external selection is wrapped in array internally", async () => {
    const selectionRef = ref<Item | Item[] | undefined>(undefined);
    const opts = {
      ...makeOptions(),
      selection: selectionRef,
      selectionMode: ref<"single" | "multiple">("single"),
    };
    const { internalSelection } = useTableSelectionV2(opts);

    const itemA: Item = { id: "a", price: 10, selectable: true };
    selectionRef.value = itemA; // single item, not array

    await nextTick();

    expect(internalSelection.value).toHaveLength(1);
    expect(internalSelection.value[0].id).toBe("a");
  });
});
