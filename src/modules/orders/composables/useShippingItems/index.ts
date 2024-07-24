import {
  IBladeToolbar,
  ListBaseBladeScope,
  ListComposableArgs,
  UseList,
  useDynamicViewsUtils,
  useListFactory,
} from "@vc-shell/framework";
import { OrderLineItem } from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, ref, toRef, toRefs, watch } from "vue";
import * as _ from "lodash-es";
import { useForm, useIsFormValid } from "vee-validate";

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
  const { meta } = useForm({
    validateOnMount: false,
  });
  const isFormValid = computed(() => meta.value.valid);

  const internalModel = ref([]) as Ref<(OrderLineItem & { quantityOnShipment?: number })[]>;

  const factory = useListFactory({
    load: () => {
      return { results: internalModel.value };
    },
  });

  const { load, loading, pagination, query, remove, items } = factory();
  const exposedData = getBladeExposedData();

  const selectedIds = ref<string[]>([]);

  const scope: ShippingItemScope = {
    disabled: false,
    toolbarOverrides: {
      add: {
        clickHandler: () => {
          args.emit("parent:call", {
            method: "addLineItems",
            args: {
              selectedItems: selectedIds.value.map((id) => {
                const item = internalModel.value.find((item) => item.id === id);
                return {
                  ...item,
                  quantity: item?.quantityOnShipment,
                };
              }),
            },
          });
          args.emit("close:blade");
        },
        disabled: computed(() => !isFormValid.value || selectedIds.value.length === 0),
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

  watch(
    () => args?.props.options?.items,
    (newVal) => {
      internalModel.value = _.cloneDeep(newVal) ?? [];

      internalModel.value.forEach((item) => {
        item.quantityOnShipment = item.quantity;
      });
    },
    { deep: true, immediate: true },
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
