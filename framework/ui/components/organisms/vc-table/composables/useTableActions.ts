import { Ref, ref, shallowRef } from "vue";
import { IActionBuilderResult } from "../../../../../core/types";
import { TableItem } from "../types";

export interface UseTableActionsOptions<T extends TableItem | string> {
  enableItemActions?: boolean;
  itemActionBuilder?: (item: T) => Promise<IActionBuilderResult[]> | IActionBuilderResult[] | undefined;
}

export function useTableActions<T extends TableItem | string>(options: UseTableActionsOptions<T>) {
  const { enableItemActions, itemActionBuilder } = options;

  const itemActions: Ref<IActionBuilderResult[][]> = ref([]);
  const selectedRowIndex = shallowRef<number>();
  const mobileSwipeItem = ref<string>();

  async function calculateActions(items: T[]) {
    if (enableItemActions && typeof itemActionBuilder === "function") {
      const populatedItems: IActionBuilderResult[][] = [];
      for (let index = 0; index < items.length; index++) {
        if (typeof items[index] === "object") {
          const elementWithActions = await itemActionBuilder(items[index]);
          if (elementWithActions) {
            populatedItems.push(elementWithActions);
          }
        }
      }
      itemActions.value = populatedItems;
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
    console.log("handleSwipe", id);
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
