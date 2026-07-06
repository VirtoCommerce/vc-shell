import { describe, it, expect, vi } from "vitest";
import { ref, computed } from "vue";
import { createTableSelectionFacade, type SelectionImpl } from "./createTableSelectionFacade";

type Row = { id: string };

/**
 * Minimal fake of the raw useTableSelectionV2 instance — only the members the
 * facade reads, plus a couple it must NOT expose (proving they stay hidden).
 */
function makeFakeSelection(initial: Row[] = []) {
  const internalSelection = ref<Row[]>(initial);
  const isSelectAllActive = ref(false);
  const allSelected = computed(() => internalSelection.value.length > 0);
  const someSelected = computed(() => false);
  const showSelectAllChoice = computed(() => false);
  const selectionInfo = computed(() => ({
    count: internalSelection.value.length,
    isSelectAll: isSelectAllActive.value,
  }));

  const impl = {
    internalSelection,
    allSelected,
    someSelected,
    isSelectAllActive,
    showSelectAllChoice,
    selectionInfo,
    isSelected: vi.fn((item: Row) => internalSelection.value.some((r) => r.id === item.id)),
    canSelect: vi.fn(() => true),
    getSelectionState: vi.fn(() => ({ selected: internalSelection.value })),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
    // Members the facade intentionally hides:
    selectItem: vi.fn(),
    unselectItem: vi.fn(),
    handleSelectAllChange: vi.fn(),
    handleRowSelectionChange: vi.fn(),
  } as unknown as SelectionImpl<Row>;

  return { impl, internalSelection, allSelected, someSelected, isSelectAllActive, showSelectAllChoice, selectionInfo };
}

describe("createTableSelectionFacade", () => {
  it("maps state members 1:1 to the raw selection instance (identity preserved)", () => {
    const raw = makeFakeSelection([{ id: "a" }]);
    const facade = createTableSelectionFacade(raw.impl, { onRowSelect: vi.fn(), onSelectAll: vi.fn() });

    expect(facade.selected.value).toEqual([{ id: "a" }]);
    expect(facade.isAllSelected).toBe(raw.allSelected);
    expect(facade.isPartiallySelected).toBe(raw.someSelected);
    expect(facade.isSelectAllAcrossPages).toBe(raw.isSelectAllActive);
    expect(facade.showSelectAllPrompt).toBe(raw.showSelectAllChoice);
    expect(facade.info).toBe(raw.selectionInfo);
  });

  it("aliases actions and predicates to the raw instance", () => {
    const raw = makeFakeSelection();
    const facade = createTableSelectionFacade(raw.impl, { onRowSelect: vi.fn(), onSelectAll: vi.fn() });

    expect(facade.selectAll).toBe(raw.impl.selectAll);
    expect(facade.clear).toBe(raw.impl.clearSelection);
    expect(facade.getState).toBe(raw.impl.getSelectionState);
    expect(facade.isSelected).toBe(raw.impl.isSelected);
    expect(facade.canSelect).toBe(raw.impl.canSelect);
  });

  it("exposes the emit-owning handlers and calls through", () => {
    const raw = makeFakeSelection();
    const onRowSelect = vi.fn();
    const onSelectAll = vi.fn();
    const facade = createTableSelectionFacade(raw.impl, { onRowSelect, onSelectAll });

    expect(facade.onRowSelect).toBe(onRowSelect);
    expect(facade.onSelectAll).toBe(onSelectAll);

    facade.onRowSelect({ id: "x" });
    facade.onSelectAll(true);
    expect(onRowSelect).toHaveBeenCalledWith({ id: "x" });
    expect(onSelectAll).toHaveBeenCalledWith(true);
  });

  it("keeps `selected` reactive to the underlying internalSelection", () => {
    const raw = makeFakeSelection([]);
    const facade = createTableSelectionFacade(raw.impl, { onRowSelect: vi.fn(), onSelectAll: vi.fn() });

    expect(facade.selected.value).toEqual([]);
    raw.internalSelection.value = [{ id: "b" }];
    expect(facade.selected.value).toEqual([{ id: "b" }]);
  });

  it("does not surface the raw internal members", () => {
    const raw = makeFakeSelection();
    const facade = createTableSelectionFacade(raw.impl, { onRowSelect: vi.fn(), onSelectAll: vi.fn() }) as Record<
      string,
      unknown
    >;

    expect(facade.internalSelection).toBeUndefined();
    expect(facade.selectItem).toBeUndefined();
    expect(facade.handleRowSelectionChange).toBeUndefined();
    expect(facade.clearSelection).toBeUndefined();
  });
});
