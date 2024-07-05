import {
  IBladeToolbar,
  ListBaseBladeScope,
  ListComposableArgs,
  UseList,
  useDynamicViewsUtils,
  useListFactory,
} from "@vc-shell/framework";
import { OrderLineItem } from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref, watch } from "vue";

export interface ShippingItemScope extends ListBaseBladeScope {
  toolbarOverrides: {
    add: IBladeToolbar;
  };
}

export const useShippingItems = (
  args: ListComposableArgs<{
    options: {
      items: OrderLineItem[];
    };
  }>,
): UseList<OrderLineItem[], Record<string, unknown>, ShippingItemScope> => {
  const { getBladeExposedData } = useDynamicViewsUtils();

  const factory = useListFactory({
    load: () => {
      return { results: args.props.options?.items ?? [] };
    },
  });

  const { load, loading, pagination, query, remove, items } = factory();
  const exposedData = getBladeExposedData();

  const selectedIds = ref<string[]>([]);

  const scope: ShippingItemScope = {
    toolbarOverrides: {
      add: {
        clickHandler: () => {
          args.emit("parent:call", {
            method: "addLineItems",
            args: { selectedIds: selectedIds.value },
          });
          args.emit("close:blade");
        },
        disabled: computed(() => selectedIds.value.length === 0),
      },
    },
  };

  watch(
    () => exposedData.value?.selectedIds,
    (newVal) => {
      selectedIds.value = newVal;
    },
    { deep: true },
  );

  return {
    load,
    loading,
    pagination,
    query,
    remove,
    items,
    scope,
  };
};
