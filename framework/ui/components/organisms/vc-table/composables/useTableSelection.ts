import { computed, ref, Ref, watch } from "vue";
import { TableItem } from "../vc-table.vue";
import * as _ from "lodash-es";

type TableItemType = TableItem | string;

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

  function isSelected(item: T): boolean {
    return selection.value.some((x) => _.isEqual(x, item));
  }

  function handleSelectAll(): void {
    allSelected.value = !allSelected.value;

    if (!allSelected.value) {
      selection.value = [];
    }

    onSelectAll?.(allSelected.value);
  }

  function rowCheckbox(item: T): void {
    if (disabledSelection.value.includes(item)) {
      return;
    }

    const index = selection.value.findIndex((x) => _.isEqual(x, item));

    if (index !== -1) {
      selection.value = selection.value.filter((_, i) => i !== index);
    } else {
      selection.value = [...selection.value, item];
    }
  }

  async function handleMultiselect(items: T[]): Promise<void> {
    if (disableItemCheckbox && typeof disableItemCheckbox === "function") {
      const disabledMultiselect: T[] = [];
      for (const item of items) {
        if (typeof item === "object") {
          const element = await disableItemCheckbox(item);
          if (element) {
            disabledMultiselect.push(item);
          }
        }
      }
      disabledSelection.value = disabledMultiselect;
    }
  }

  watch(
    () => items.value,
    (newItems) => {
      handleMultiselect(newItems);
      selection.value = selection.value.filter((item) => newItems.includes(item));
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
