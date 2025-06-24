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
      const populatedItems: IActionBuilderResult<T>[][] = [];
      for (let index = 0; index < items.length; index++) {
        if (typeof items[index] === "object") {
          const elementWithActions = await builder(items[index]);
          if (elementWithActions) {
            populatedItems.push(elementWithActions);
          }
        }
      }
      itemActions.value = populatedItems;
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
