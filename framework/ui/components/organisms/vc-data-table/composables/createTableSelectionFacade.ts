import { computed, type ComputedRef } from "vue";
import type { useTableSelectionV2 } from "@ui/components/organisms/vc-data-table/composables/useTableSelectionV2";

/** @internal Raw selection composable instance — hidden behind {@link TableSelectionFacade}. */
export type SelectionImpl<T extends Record<string, unknown>> = ReturnType<typeof useTableSelectionV2<T>>;

/** Emit-owning handlers the facade exposes as `onRowSelect` / `onSelectAll`. */
export interface TableSelectionHandlers<T extends Record<string, unknown>> {
  /** Toggle a row's selection; emits row-select / row-unselect. */
  onRowSelect: (item: T, eventOrValue?: Event | boolean) => void;
  /** Toggle select-all; emits row-select-all / row-unselect-all + update:selectAll. */
  onSelectAll: (value: boolean) => void;
}

/**
 * Deep, intention-revealing surface for row selection. Wraps the raw
 * `useTableSelectionV2` instance (hidden implementation) plus the two
 * emit-owning handlers, so VcDataTable's template and children consume a single
 * `selection` object instead of the 17-member composable and loose handlers.
 * Members map 1:1 to the implementation; behaviour is unchanged.
 */
export interface TableSelectionFacade<T extends Record<string, unknown>> {
  /** Currently selected items (loaded rows). Maps `internalSelection`. */
  selected: ComputedRef<T[]>;
  /** All loaded rows are selected. Maps `allSelected`. */
  isAllSelected: SelectionImpl<T>["allSelected"];
  /** Some, but not all, loaded rows are selected. Maps `someSelected`. */
  isPartiallySelected: SelectionImpl<T>["someSelected"];
  /** "Select all across pages/total" mode is active. Maps `isSelectAllActive`. */
  isSelectAllAcrossPages: SelectionImpl<T>["isSelectAllActive"];
  /** Whether to show the "select all N" prompt. Maps `showSelectAllChoice`. */
  showSelectAllPrompt: SelectionImpl<T>["showSelectAllChoice"];
  /** Selection summary ({ count, isSelectAll }). Maps `selectionInfo`. */
  info: SelectionImpl<T>["selectionInfo"];
  /** Predicate: is this item selected. */
  isSelected: SelectionImpl<T>["isSelected"];
  /** Predicate: can this item be selected. */
  canSelect: SelectionImpl<T>["canSelect"];
  /** Snapshot of the current selection state. Maps `getSelectionState`. */
  getState: SelectionImpl<T>["getSelectionState"];
  /** Select all selectable rows. */
  selectAll: SelectionImpl<T>["selectAll"];
  /** Clear the selection. Maps `clearSelection`. */
  clear: SelectionImpl<T>["clearSelection"];
  /** Toggle a row's selection; emits row-select / row-unselect. */
  onRowSelect: TableSelectionHandlers<T>["onRowSelect"];
  /** Toggle select-all; emits row-select-all / row-unselect-all + update:selectAll. */
  onSelectAll: TableSelectionHandlers<T>["onSelectAll"];
}

/**
 * Assemble the {@link TableSelectionFacade} from a raw selection instance and
 * its emit-owning handlers. Pure aliasing — reactivity identity is preserved,
 * so no behaviour changes versus reading the raw members directly.
 */
export function createTableSelectionFacade<T extends Record<string, unknown>>(
  selection: SelectionImpl<T>,
  handlers: TableSelectionHandlers<T>,
): TableSelectionFacade<T> {
  return {
    selected: computed(() => selection.internalSelection.value),
    isAllSelected: selection.allSelected,
    isPartiallySelected: selection.someSelected,
    isSelectAllAcrossPages: selection.isSelectAllActive,
    showSelectAllPrompt: selection.showSelectAllChoice,
    info: selection.selectionInfo,
    isSelected: selection.isSelected,
    canSelect: selection.canSelect,
    getState: selection.getSelectionState,
    selectAll: selection.selectAll,
    clear: selection.clearSelection,
    onRowSelect: handlers.onRowSelect,
    onSelectAll: handlers.onSelectAll,
  };
}
