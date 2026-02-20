import { ref, computed, Ref, ComputedRef } from "vue";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-table-selection");

export interface UseTableSelectionOptions<T> {
  /**
   * The field to use for extracting IDs from items.
   * Can be a key of T or a function that extracts the ID.
   * @default 'id'
   */
  idField?: keyof T | ((item: T) => string | undefined);
}

export interface UseTableSelectionReturn<T> {
  /**
   * Array of currently selected item objects.
   */
  selectedItems: Ref<T[]>;

  /**
   * Computed array of IDs extracted from selected items.
   */
  selectedIds: ComputedRef<string[]>;

  /**
   * Whether "select all" across pagination is active.
   */
  allSelected: Ref<boolean>;

  /**
   * Number of currently selected items.
   */
  selectionCount: ComputedRef<number>;

  /**
   * Whether any items are currently selected.
   */
  hasSelection: ComputedRef<boolean>;

  /**
   * Handler for VcTable's @selection-changed event.
   */
  handleSelectionChange: (items: T[]) => void;

  /**
   * Handler for VcTable's @select:all event.
   */
  handleSelectAll: (selected: boolean) => void;

  /**
   * Clears all selection state.
   */
  resetSelection: () => void;

  /**
   * Checks if a specific item is selected.
   */
  isSelected: (item: T) => boolean;

  /**
   * Programmatically select items.
   */
  selectItems: (items: T[]) => void;

  /**
   * Deselect items by their IDs.
   */
  deselectByIds: (ids: string[]) => void;
}

export function useTableSelection<T extends object>(
  options?: UseTableSelectionOptions<T>
): UseTableSelectionReturn<T> {
  const idField = options?.idField ?? ("id" as keyof T);

  const getItemId = (item: T): string | undefined => {
    if (typeof idField === "function") {
      return idField(item);
    }
    const value = item[idField as keyof T];
    return typeof value === "string" ? value : undefined;
  };

  const selectedItems = ref<T[]>([]) as Ref<T[]>;
  const allSelected = ref(false);

  const selectedIds = computed<string[]>(() => {
    return selectedItems.value.flatMap((item) => {
      const id = getItemId(item);
      return id ? [id] : [];
    });
  });

  const selectionCount = computed(() => selectedItems.value.length);
  const hasSelection = computed(() => selectedItems.value.length > 0);
  const selectedIdSet = computed(() => new Set(selectedIds.value));

  const handleSelectionChange = (items: T[]): void => {
    selectedItems.value = items;
    if (items.length === 0) {
      allSelected.value = false;
    }
    logger.debug("Selection changed", { count: items.length });
  };

  const handleSelectAll = (selected: boolean): void => {
    allSelected.value = selected;
    if (!selected) {
      selectedItems.value = [];
    }
    logger.debug("Select all changed", { selected });
  };

  const resetSelection = (): void => {
    selectedItems.value = [];
    allSelected.value = false;
    logger.debug("Selection reset");
  };

  const isSelected = (item: T): boolean => {
    const id = getItemId(item);
    return id ? selectedIdSet.value.has(id) : false;
  };

  const selectItems = (items: T[]): void => {
    selectedItems.value = items;
  };

  const deselectByIds = (ids: string[]): void => {
    const idsToRemove = new Set(ids);
    selectedItems.value = selectedItems.value.filter((item) => {
      const id = getItemId(item);
      return id ? !idsToRemove.has(id) : true;
    });
  };

  return {
    selectedItems,
    selectedIds,
    allSelected,
    selectionCount,
    hasSelection,
    handleSelectionChange,
    handleSelectAll,
    resetSelection,
    isSelected,
    selectItems,
    deselectByIds,
  };
}
