import {
  ListComposableArgs,
  useListFactory,
  useBladeNavigation,
  TOpenBladeArgs,
  useApiClient,
  ListBaseBladeScope,
  UseList,
  IBladeToolbar,
  useAsync,
  useLoading,
  usePopup,
  useBeforeUnload,
} from "@vc-shell/framework";
import {
  ISearchShipmentsQuery,
  OrderLineItem,
  OrderShipment,
  SearchShipmentsQuery,
  VcmpSellerOrdersClient,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { computed, ref, unref, watch } from "vue";
import * as _ from "lodash-es";
import { useI18n } from "vue-i18n";

export interface ShippingScope extends ListBaseBladeScope {
  toolbarOverrides: {
    save: IBladeToolbar;
  };
}

export const useShipping = (
  args: ListComposableArgs<{
    options?: {
      items: OrderLineItem[];
      orderId: string;
      shipments: OrderShipment[];
    };
  }>,
): UseList<OrderShipment[], ISearchShipmentsQuery, ShippingScope> => {
  const internalModel = ref<OrderShipment[]>(_.cloneDeep(args?.props.options?.shipments) ?? []);

  const factory = useListFactory<OrderShipment[], ISearchShipmentsQuery>({
    load: () => {
      return {
        results: internalModel.value ?? [],
      };
    },
  });

  const { load, loading, items, query, pagination } = factory();
  const { openBlade, resolveBladeByName, onBeforeClose } = useBladeNavigation();
  const { showConfirmation } = usePopup();
  const { t } = useI18n({ useScope: "global" });

  const modified = ref(false);

  watch(
    () => internalModel.value,
    (value) => {
      modified.value = !_.isEqual(value, args?.props.options?.shipments);
    },
    { deep: true },
  );

  async function openDetailsBlade(navArgs?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("ShippingDetails"),
      options: {
        items: args?.props.options?.items,
        orderId: args?.props.options?.orderId,
        shipment: items.value?.find((x) => x.id === navArgs?.param),
      },
      ...navArgs,
    });
  }

  function saveShipment(arg: { item: OrderShipment }) {
    const index = internalModel.value.findIndex((x) => x.id === arg.item.id);
    if (index > -1) {
      internalModel.value[index] = arg.item;
    } else {
      internalModel.value.push(arg.item);
    }
  }

  function saveShipping() {
    args?.emit("parent:call", {
      method: "saveShipping",
      args: {
        items: internalModel.value,
      },
    });
    modified.value = false;
    args.emit("close:blade");
  }

  function removeShipment(arg: { item: OrderShipment }) {
    const index = internalModel.value.findIndex((x) => _.isEqual(x, arg.item));
    if (index > -1) {
      internalModel.value.splice(index, 1);
    }
  }

  const scope: ShippingScope = {
    openDetailsBlade,
    saveShipment,
    removeShipment,
    toolbarOverrides: {
      save: {
        clickHandler: saveShipping,
        disabled: computed(() => !modified.value),
      },
    },
  };

  onBeforeClose(async () => {
    if (modified.value) {
      return await showConfirmation(unref(computed(() => t("SHIPPING.PAGES.ALERTS.CLOSE_CONFIRMATION"))));
    }
  });

  useBeforeUnload(computed(() => modified.value));

  if (!internalModel.value.length) {
    openBlade({
      blade: resolveBladeByName("ShippingDetails"),
      options: {
        items: args?.props.options?.items,
        orderId: args?.props.options?.orderId,
      },
      replaceCurrentBlade: true,
    });
  }

  return {
    load,
    loading,
    items,
    query,
    pagination,
    scope,
  };
};
