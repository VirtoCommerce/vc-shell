import { useI18n } from "vue-i18n";
import {
  DetailsComposableArgs,
  UseDetails,
  useAsync,
  useBladeNavigation,
  useDetailsFactory,
  useLoading,
  useApiClient,
  DetailsBaseBladeScope,
  IBladeToolbar,
} from "@vc-shell/framework";
import {
  OrderShipment,
  FulfillmentCenter,
  SellerUser,
  OrderLineItem,
  VcmpSellerOrdersClient,
  ShippingMethod,
  OrderShipmentItem,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import { ComputedRef, WritableComputedRef, computed, reactive, ref, watch } from "vue";
import { useFulfillmentCenters } from "../../../fulfillment-centers/composables";
import { useTeamList } from "../../../team/composables";
import * as _ from "lodash-es";

export interface ShippingDetailsScope extends DetailsBaseBladeScope {
  fulfillmentCenters: ComputedRef<FulfillmentCenter[]>;
  employee: ComputedRef<SellerUser[]>;
  addNewLineItem: () => Promise<void>;
  addLineItems: (data: { selectedItems: OrderLineItem[] }) => void;
  removeLineItem: (lineItem: OrderLineItem, idx: number) => void;
  setEmployee: WritableComputedRef<SellerUser | undefined>;
  setFulfillmentCenter: WritableComputedRef<FulfillmentCenter | undefined>;
  toolbarOverrides: {
    remove: IBladeToolbar;
    saveChanges: IBladeToolbar;
  };
}

const { getApiClient } = useApiClient(VcmpSellerOrdersClient);

export const useShippingDetails = (
  args: DetailsComposableArgs<{
    options: {
      items: OrderLineItem[];
      orderId: string;
      shipment: OrderShipment;
    };
  }>,
): UseDetails<OrderShipment, ShippingDetailsScope> => {
  const internalModel = ref<OrderShipment | undefined>(_.cloneDeep(args.props.options?.shipment));

  const factory = useDetailsFactory<OrderShipment>({
    load: () => {
      return internalModel.value;
    },
    remove: async () => {
      args.emit("parent:call", {
        method: "removeShipment",
        args: { item: internalModel.value },
      });
    },
    saveChanges: async (details) => {
      args.emit("parent:call", {
        method: "saveShipment",
        args: { item: _.cloneDeep(details) },
      });
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = factory();

  const {
    load: loadFulfillmentCenters,
    loading: fulfillmentCentersLoading,
    items: fulfillmentCenters,
  } = useFulfillmentCenters();

  const { load: loadEmployee, loading: employeeLoading, items: employee } = useTeamList();
  const { openBlade, resolveBladeByName } = useBladeNavigation();
  const { t } = useI18n({ useScope: "global" });

  const shippingMethods = ref<ShippingMethod[]>([]);
  const shippingStatuses = ref<{ value: string; label: string }[]>([]);

  const { loading: getNewShipmentLoading, action: getNewShipment } = useAsync(async () => {
    return await (await getApiClient()).getNewShipment(args.props.options?.orderId);
  });

  watch(
    () => args?.mounted.value,
    async () => {
      if (!args.props.param) {
        const newShipment = await getNewShipment();
        item.value = reactive(new OrderShipment(newShipment));

        item.value.createdDate = new Date();

        validationState.value.resetModified(item.value, true);
      }

      await loadFulfillmentCenters();
      await loadEmployee();
      await getShippingMethods();
      await getShippingStatuses();
    },
  );

  async function addNewLineItem() {
    await openBlade({
      blade: resolveBladeByName("ShippingItems"),
      options: {
        items: args.props.options?.items,
      },
    });
  }

  function addLineItems(data: { selectedItems: OrderLineItem[] }) {
    const lineItems = data.selectedItems;

    if (!lineItems) return;

    if (!item.value!.items) {
      item.value!.items = [];
    }

    lineItems.forEach((lineItem) => {
      const exists = item.value!.items?.some((existingItem) => existingItem.lineItemId === lineItem.id);
      if (!exists) {
        item.value!.items?.push(
          new OrderShipmentItem({
            lineItem,
            lineItemId: lineItem.id,
            quantity: lineItem.quantity,
          }),
        );
      }
    });
  }

  function removeLineItem(lineItem: OrderLineItem, idx: number) {
    item.value?.items?.splice(idx, 1);
  }

  const { loading: getShippingMethodsLoading, action: getShippingMethods } = useAsync(async () => {
    shippingMethods.value = await (await getApiClient()).getShippingMethods();
  });

  const { loading: getShippingStatusesLoading, action: getShippingStatuses } = useAsync(async () => {
    shippingStatuses.value = (await (await getApiClient()).getShipmentStatuses()).map((status) => ({
      value: status,
      label: status,
    }));
  });

  const allLoading = useLoading(
    loading,
    fulfillmentCentersLoading,
    employeeLoading,
    getShippingMethodsLoading,
    getShippingStatusesLoading,
    getNewShipmentLoading,
  );

  const scope: ShippingDetailsScope = {
    fulfillmentCenters,
    employee,
    addNewLineItem,
    addLineItems,
    removeLineItem,
    shippingStatuses,
    shippingMethods,
    disabledDateTime: true,
    isShippingMethodDisabled: true,
    isShippingMethodVisible: computed(() => !!args.props.param),
    isShippingMethodSelectVisible: computed(() => !args.props.param),
    shipmentMethodCode: computed({
      get() {
        return shippingMethods.value.find((method) => method.code === item.value?.shipmentMethodCode);
      },
      set(value) {
        item.value!.shipmentMethodCode = value?.code;
        item.value!.shippingMethod = new ShippingMethod(value);
      },
    }),
    setEmployee: computed({
      get() {
        return employee.value?.find((emp) => emp.id === item.value?.employeeId);
      },
      set(value: SellerUser | undefined) {
        item.value!.employeeId = value?.id;
        item.value!.employeeName = value?.fullName;
      },
    }),
    setFulfillmentCenter: computed({
      get() {
        return fulfillmentCenters.value?.find((fc) => fc.id === item.value?.fulfillmentCenterId);
      },
      set(value: FulfillmentCenter | undefined) {
        item.value!.fulfillmentCenterId = value?.id;
        item.value!.fulfillmentCenterName = value?.name;
      },
    }),
    toolbarOverrides: {
      remove: {
        isVisible: computed(() => !!args.props.options?.shipment),
      },
      saveChanges: {
        disabled: computed(() => {
          return !(validationState.value.valid && validationState.value.modified);
        }),
      },
    },
  };

  return {
    bladeTitle: computed(() =>
      item.value?.number
        ? t("SHIPPING.PAGES.DETAILS.TITLE_EDIT") + item.value.number
        : t("SHIPPING.PAGES.DETAILS.TITLE"),
    ),
    load,
    saveChanges,
    remove,
    loading: allLoading,
    item,
    validationState,
    scope,
  };
};
