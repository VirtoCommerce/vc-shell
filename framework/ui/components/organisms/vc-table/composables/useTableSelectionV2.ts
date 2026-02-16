/**
 * useTableSelectionV2 - Enhanced selection composable for VcDataTable
 *
 * Features:
 * - Single and multiple selection modes
 * - isRowSelectable callback for disabling selection on specific rows
 * - Efficient Set-based lookup for O(1) selection checks
 * - Select all with selectability filtering
 *
 * This is an enhanced version for VcDataTable.
 * The original useTableSelection is kept for VcTableComposition compatibility.
 *
 * Inspired by PrimeVue DataTable selection patterns.
 */
import { ref, computed, watch, type Ref, type ComputedRef } from "vue";

export interface UseTableSelectionV2Options<T> {
  /** Source data items */
  items: Ref<T[]>;
  /** External selection value (v-model:selection) */
  selection?: Ref<T | T[] | undefined>;
  /** Selection mode: single or multiple */
  selectionMode: Ref<"single" | "multiple" | undefined>;
  /** Callback to determine if a row can be selected */
  isRowSelectable?: (item: T) => boolean;
  /** Data key field for item identification */
  dataKey: string;
  /** Function to get unique key for an item */
  getItemKey: (item: T, index: number) => string;
  /** Total count of items (for pagination - used by "select all" feature) */
  totalCount?: Ref<number | undefined>;
  /** External "select all" state (v-model:selectAllActive) */
  selectAllActive?: Ref<boolean | undefined>;
  /** Callback when "select all" mode changes */
  onSelectAllChange?: (active: boolean) => void;
}

export interface RowSelectEvent<T> {
  data: T;
  originalEvent: Event;
}

export interface RowSelectAllEvent<T> {
  data: T[];
  originalEvent: Event;
}

/** Selection state info for display */
export interface SelectionInfo {
  /** Number of selected items */
  count: number;
  /** Whether "select all" mode is active (includes non-visible items) */
  isSelectAll: boolean;
  /** Total count of items (from totalCount prop) */
  totalCount?: number;
}

export interface UseTableSelectionV2Return<T> {
  /** Internal selection array */
  internalSelection: Ref<T[]>;
  /** Set of selected item keys for O(1) lookup */
  selectionKeys: ComputedRef<Set<string>>;
  /** All selectable items are selected */
  allSelected: ComputedRef<boolean>;
  /** Some but not all selectable items are selected (indeterminate state) */
  someSelected: ComputedRef<boolean>;
  /** Whether "select all" mode is active (includes non-visible items) */
  isSelectAllActive: Ref<boolean>;
  /** Whether to show "select all" choice (when all visible items selected and more exist) */
  showSelectAllChoice: ComputedRef<boolean>;
  /** Selection info for display */
  selectionInfo: ComputedRef<SelectionInfo>;
  /** Check if an item is selected */
  isSelected: (item: T) => boolean;
  /** Check if an item can be selected */
  canSelect: (item: T) => boolean;
  /** Handle row selection change (click or checkbox) */
  handleRowSelectionChange: (item: T, event?: Event | boolean) => RowSelectEvent<T> | null;
  /** Handle select all checkbox change */
  handleSelectAllChange: (value: boolean, event?: Event) => RowSelectAllEvent<T>;
  /** Select a specific item */
  selectItem: (item: T, event?: Event) => RowSelectEvent<T> | null;
  /** Unselect a specific item */
  unselectItem: (item: T, event?: Event) => RowSelectEvent<T> | null;
  /** Clear all selections */
  clearSelection: () => void;
  /** Select all items (marks mode, emits event for parent to handle) */
  selectAll: () => void;
  /** Clear "select all" mode */
  clearSelectAll: () => void;
  /** Get selection state for bulk operations */
  getSelectionState: () => { selected: T[]; isSelectAll: boolean; count: number };
}

export function useTableSelectionV2<T extends Record<string, unknown>>(
  options: UseTableSelectionV2Options<T>
): UseTableSelectionV2Return<T> {
  const {
    items,
    selection,
    selectionMode,
    isRowSelectable,
    getItemKey,
    totalCount,
    selectAllActive,
    onSelectAllChange,
  } = options;

  // ============================================================================
  // State
  // ============================================================================

  /** Internal selection array */
  const internalSelection = ref<T[]>([]) as Ref<T[]>;

  /** Internal "select all" mode state */
  const isSelectAllActive = ref<boolean>(false);

  // Sync selection with external prop
  watch(
    () => selection?.value,
    (newVal) => {
      if (newVal !== undefined) {
        internalSelection.value = Array.isArray(newVal) ? newVal : [newVal];
      }
    },
    { immediate: true }
  );

  // Sync selectAllActive with external prop
  watch(
    () => selectAllActive?.value,
    (newVal) => {
      if (newVal !== undefined) {
        isSelectAllActive.value = newVal;
      }
    },
    { immediate: true }
  );

  /**
   * Set of selected item keys for O(1) lookup
   */
  const selectionKeys = computed<Set<string>>(() => {
    return new Set(
      internalSelection.value.map((item) => getItemKey(item, -1))
    );
  });

  // ============================================================================
  // Computed Properties
  // ============================================================================

  /**
   * Get all selectable items (filtered by isRowSelectable)
   */
  const selectableItems = computed<T[]>(() => {
    if (!isRowSelectable) return items.value;
    return items.value.filter(isRowSelectable);
  });

  /**
   * All selectable items are selected
   */
  const allSelected = computed<boolean>(() => {
    if (!items.value || items.value.length === 0) return false;
    if (selectableItems.value.length === 0) return false;
    return selectableItems.value.every((item) => isSelected(item));
  });

  /**
   * Some but not all selectable items are selected (indeterminate state)
   */
  const someSelected = computed<boolean>(() => {
    if (!items.value || items.value.length === 0) return false;
    if (selectableItems.value.length === 0) return false;
    const selectedCount = selectableItems.value.filter((item) =>
      isSelected(item)
    ).length;
    return selectedCount > 0 && selectedCount < selectableItems.value.length;
  });

  /**
   * Whether to show "select all" choice banner
   * Shows when all visible items are selected and more items exist (totalCount > items.length)
   */
  const showSelectAllChoice = computed<boolean>(() => {
    if (!totalCount?.value) return false;
    if (isSelectAllActive.value) return false; // Already in select all mode
    return allSelected.value && totalCount.value > items.value.length;
  });

  /**
   * Selection info for display
   */
  const selectionInfo = computed<SelectionInfo>(() => ({
    count: isSelectAllActive.value
      ? (totalCount?.value ?? internalSelection.value.length)
      : internalSelection.value.length,
    isSelectAll: isSelectAllActive.value,
    totalCount: totalCount?.value,
  }));

  // ============================================================================
  // Methods
  // ============================================================================

  /**
   * Check if an item is selected
   */
  const isSelected = (item: T): boolean => {
    const key = getItemKey(item, -1);
    return selectionKeys.value.has(key);
  };

  /**
   * Check if an item can be selected
   */
  const canSelect = (item: T): boolean => {
    if (!isRowSelectable) return true;
    return isRowSelectable(item);
  };

  /**
   * Select a specific item
   */
  const selectItem = (item: T, event?: Event): RowSelectEvent<T> | null => {
    if (!canSelect(item)) return null;

    const mode = selectionMode.value;
    const key = getItemKey(item, -1);

    if (mode === "single") {
      internalSelection.value = [item];
    } else {
      if (!selectionKeys.value.has(key)) {
        internalSelection.value = [...internalSelection.value, item];
      }
    }

    return {
      data: item,
      originalEvent: event || new Event("select"),
    };
  };

  /**
   * Unselect a specific item
   */
  const unselectItem = (item: T, event?: Event): RowSelectEvent<T> | null => {
    const key = getItemKey(item, -1);

    internalSelection.value = internalSelection.value.filter(
      (selected) => getItemKey(selected, -1) !== key
    );

    return {
      data: item,
      originalEvent: event || new Event("unselect"),
    };
  };

  /**
   * Handle row selection change (click or checkbox)
   */
  const handleRowSelectionChange = (
    item: T,
    eventOrValue?: Event | boolean
  ): RowSelectEvent<T> | null => {
    // Check if row is selectable
    if (!canSelect(item)) {
      return null;
    }

    const isCurrentlySelected = isSelected(item);
    const originalEvent =
      eventOrValue instanceof Event ? eventOrValue : new Event("change");

    if (isCurrentlySelected) {
      return unselectItem(item, originalEvent);
    } else {
      return selectItem(item, originalEvent);
    }
  };

  /**
   * Handle select all checkbox change
   */
  const handleSelectAllChange = (
    value: boolean,
    event?: Event
  ): RowSelectAllEvent<T> => {
    const originalEvent = event || new Event("change");

    if (value) {
      // Select all selectable items
      internalSelection.value = [...selectableItems.value];
      return {
        data: selectableItems.value,
        originalEvent,
      };
    } else {
      // Clear selection
      internalSelection.value = [];
      return {
        data: [],
        originalEvent,
      };
    }
  };

  /**
   * Clear all selections
   */
  const clearSelection = (): void => {
    internalSelection.value = [];
    isSelectAllActive.value = false;
    onSelectAllChange?.(false);
  };

  /**
   * Select all items (marks mode, parent should handle loading all IDs)
   * This sets the "select all" flag - parent component decides how to handle bulk operations
   */
  const selectAll = (): void => {
    // First select all visible items
    internalSelection.value = [...selectableItems.value];
    // Then activate "select all" mode for non-visible items
    isSelectAllActive.value = true;
    onSelectAllChange?.(true);
  };

  /**
   * Clear "select all" mode (but keep visible selections)
   */
  const clearSelectAll = (): void => {
    isSelectAllActive.value = false;
    onSelectAllChange?.(false);
  };

  /**
   * Get selection state for bulk operations
   * Parent can use this to determine whether to operate on selected items or all items
   */
  const getSelectionState = (): { selected: T[]; isSelectAll: boolean; count: number } => {
    return {
      selected: [...internalSelection.value],
      isSelectAll: isSelectAllActive.value,
      count: isSelectAllActive.value
        ? (totalCount?.value ?? internalSelection.value.length)
        : internalSelection.value.length,
    };
  };

  // Clear select all mode when selection changes manually (e.g., uncheck an item)
  watch(
    () => internalSelection.value.length,
    (newLength, oldLength) => {
      // If user deselects an item while in "select all" mode, exit that mode
      if (isSelectAllActive.value && newLength < oldLength) {
        isSelectAllActive.value = false;
        onSelectAllChange?.(false);
      }
    }
  );

  return {
    internalSelection,
    selectionKeys,
    allSelected,
    someSelected,
    isSelectAllActive,
    showSelectAllChoice,
    selectionInfo,
    isSelected,
    canSelect,
    handleRowSelectionChange,
    handleSelectAllChange,
    selectItem,
    unselectItem,
    clearSelection,
    selectAll,
    clearSelectAll,
    getSelectionState,
  };
}

export default useTableSelectionV2;
