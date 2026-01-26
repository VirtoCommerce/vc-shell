import { computed, ref, Ref, watch } from "vue";
import { TableItem } from "../types";

type TableItemType = TableItem | string;

/**
 * Gets a unique identifier for a table item
 */
function getItemId(item: TableItemType): string {
  if (typeof item === "string") return item;
  return (item as TableItem).id ?? JSON.stringify(item);
}

export interface UseTableSelectionOptions<T extends TableItemType> {
  items: Ref<T[]>;
  disableItemCheckbox?: (item: T) => boolean;
  totalCount?: number;
  onSelectionChanged?: (values: T[]) => void;
  onSelectAll?: (selected: boolean) => void;
}

export function useTableSelection<T extends TableItemType>(options: UseTableSelectionOptions<T>) {
  const { items, disableItemCheckbox, onSelectionChanged, onSelectAll } = options;

  const selection = ref([]) as Ref<T[]>;
  const allSelected = ref(false);
  const disabledSelection = ref([]) as Ref<T[]>;

  const headerCheckbox = computed({
    get() {
      return items.value && items.value.length
        ? selection.value.length ===
            items.value.length -
              (disabledSelection.value.length !== items.value.length ? disabledSelection.value.length : 0)
        : false;
    },
    set(checked: boolean) {
      selection.value = checked ? items.value.filter((x) => !disabledSelection.value.includes(x)) : [];
      allSelected.value = false;
    },
  });

  const showSelectionChoice = computed(() => {
    return selection.value.length === items.value.length && (options.totalCount || 0) > items.value.length;
  });

  // Use Set for O(1) selection lookups instead of O(n) array search with deep equality
  const selectionIds = computed(() => new Set(selection.value.map(getItemId)));

  function isSelected(item: T): boolean {
    return selectionIds.value.has(getItemId(item));
  }

  function handleSelectAll(): void {
    allSelected.value = !allSelected.value;

    if (!allSelected.value) {
      selection.value = [];
    }

    onSelectAll?.(allSelected.value);
  }

  function rowCheckbox(item: T): void {
    const itemId = getItemId(item);
    const disabledIds = new Set(disabledSelection.value.map(getItemId));

    if (disabledIds.has(itemId)) {
      return;
    }

    if (selectionIds.value.has(itemId)) {
      selection.value = selection.value.filter((x) => getItemId(x) !== itemId);
    } else {
      selection.value = [...selection.value, item];
    }
  }

  async function handleMultiselect(items: T[]): Promise<void> {
    if (disableItemCheckbox && typeof disableItemCheckbox === "function") {
      // Use Promise.all for parallel execution instead of sequential awaits
      const objectItems = items.filter((item) => typeof item === "object");
      const results = await Promise.all(objectItems.map((item) => disableItemCheckbox(item)));

      disabledSelection.value = objectItems.filter((_, index) => results[index]);
    }
  }

  watch(
    () => items.value,
    (newItems) => {
      handleMultiselect(newItems);
      // Use Set for O(1) lookups when filtering selection
      const newItemIds = new Set(newItems.map(getItemId));
      selection.value = selection.value.filter((item) => newItemIds.has(getItemId(item)));
    },
    { deep: true, immediate: true },
  );

  watch(
    () => selection.value,
    (newSelection) => {
      onSelectionChanged?.(newSelection);
    },
    { deep: true },
  );

  watch(
    () => allSelected.value,
    (newAllSelected) => {
      onSelectAll?.(newAllSelected);
    },
  );

  return {
    selection,
    allSelected,
    disabledSelection,
    headerCheckbox,
    showSelectionChoice,
    isSelected,
    handleSelectAll,
    rowCheckbox,
    handleMultiselect,
  };
}
