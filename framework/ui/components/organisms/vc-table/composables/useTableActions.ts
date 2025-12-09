import { type MaybeRef, Ref, ref, shallowRef, unref } from "vue";
import { IActionBuilderResult } from "../../../../../core/types";
import type { TableItem } from "./../types";

export interface UseTableActionsOptions<T extends TableItem | string> {
  enableItemActions?: MaybeRef<boolean | undefined>;
  itemActionBuilder?: MaybeRef<
    ((item: T) => Promise<IActionBuilderResult<T>[]> | IActionBuilderResult<T>[] | undefined) | undefined
  >;
}

export function useTableActions<T extends TableItem | string>(options: UseTableActionsOptions<T>) {
  const { enableItemActions, itemActionBuilder } = options;

  const itemActions: Ref<IActionBuilderResult<T>[][]> = ref([]);
  const selectedRowIndex = shallowRef<number>();
  const mobileSwipeItem = ref<string>();

  async function calculateActions(items: T[]) {
    const builder = unref(itemActionBuilder);

    if (unref(enableItemActions) && typeof builder === "function") {
      // Use Promise.all for parallel execution instead of sequential awaits
      const actionPromises = items
        .filter((item) => typeof item === "object")
        .map((item) => builder(item));

      const results = await Promise.all(actionPromises);
      itemActions.value = results.filter((result): result is IActionBuilderResult<T>[] => !!result);
    } else {
      itemActions.value = [];
    }
  }

  function showActions(index: number) {
    if (typeof index === "number") {
      selectedRowIndex.value = index;
    }
  }

  function closeActions() {
    selectedRowIndex.value = undefined;
  }

  function handleSwipe(id: string) {
    mobileSwipeItem.value = id;
  }

  return {
    itemActions,
    selectedRowIndex,
    mobileSwipeItem,
    calculateActions,
    showActions,
    closeActions,
    handleSwipe,
  };
}
